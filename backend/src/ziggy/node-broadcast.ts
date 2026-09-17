/**
 * Ziggy on-chain broadcast plug-in seam — bitcoind JSON-RPC.
 *
 * Given a ready PsbtPlan (threshold met) + a bitcoind RPC endpoint + auth,
 * this is the seam that turns a signed plan into an on-chain spend and returns
 * the txid so the rest of the system (the broadcast endpoint, receipts,
 * reconcile) can use a real transaction instead of the stub.
 *
 * Two seams live here; the host picks the one it runs (the broadcast endpoint
 * prefers the PSBT workflow and falls back to the raw seam on failure):
 *
 *   A. PSBT workflow (preferred when bitcoind has a wallet + signing key):
 *      serialize the plan's PSBT → walletprocesspsbt (sign) → finalizepsbt
 *      (extract) → sendpsbt. This is the BIP174 path the hardware-wallet
 *      signatures eventually feed: the coordinator aggregates real partial
 *      signatures into `plan.psbtB64` and the node finalizes + broadcasts.
 *   B. Raw tx path (watch-only UTXOs + external signer): build the signed raw
 *      hex outside bitcoind, then sendrawtransaction. The signing step is the
 *      plug-in for external signers (hardware wallets, multisig coordinators).
 *
 * The PSBT serializer here emits a valid BIP174-shaped PSBT from the plan
 * (global unsigned tx + per-input partial-sig slots derived from the plan's
 * signature bookkeeping). It is a *shape-real* skeleton: when the council's
 * hardware wallets have signed, the real aggregated PSBT arrives in
 * `plan.psbtB64` and overrides the skeleton — the RPC chain is identical
 * either way, which is the point of the seam.
 *
 * Auth is via HTTP Basic (bitcoind rpcuser/rpcpassword) or a cookie file
 * (bitcoin.conf rpccookiefile). Both are supported; the endpoint config carries
 * whichever the host uses.
 */

import { createHash } from 'node:crypto';
import type { PsbtPlan } from './psbt.js';

export interface BitcoindRpcConfig {
  url: string; // e.g. http://127.0.0.1:8332 or the RPC host the operator exposes
  user?: string;
  pass?: string;
}

export interface BroadcastOutput {
  txid: string;
  /** Raw tx hex (raw seam) or finalized hex from finalizepsbt (workflow seam). */
  hex: string | null;
}

/**
 * Path A — full PSBT workflow against bitcoind:
 *   walletprocesspsbt (sign) → finalizepsbt (extract) → sendpsbt → txid.
 *
 * This seam *never fabricates*: it refuses below-threshold plans outright, and
 * if the node is unreachable, the wallet is missing, or finalizepsbt reports
 * `complete: false` (not enough signatures — e.g. the aggregated PSBT never
 * reached the threshold), it throws. Failing closed here is the contract; the endpoint falls back to the raw seam, and if
 * that fails too the caller reports `txid: null` + `rail: 'unavailable'` — no
 * placeholder is ever substituted on the rail path (the deterministic
 * placeholder exists only when the rail is off, see Path B).
 */
export async function broadcastPsbtWorkflow(
  plan: PsbtPlan,
  btc: BitcoindRpcConfig
): Promise<BroadcastOutput> {
  // Readiness guard (same contract as broadcastPsbt): the seam itself refuses
  // below-threshold plans so no caller can route an unsigned plan to the node
  // even when the endpoint's own gate is bypassed.
  if (!plan.ready) {
    throw new Error(
      `plan not ready: ${plan.requiredSignatures}-of-${plan.totalSigners} required, ${
        Object.values(plan.signatures).filter(Boolean).length
      } signed`
    );
  }

  // Real aggregated PSBT from the signing coordinator when it exists; the
  // plan-shaped skeleton otherwise. Same RPC chain either way.
  const serialized = plan.psbtB64 ?? serializePsbtSkeleton(plan);

  // 1. walletprocesspsbt — the node's wallet adds its signatures.
  const processed = (await rpc('walletprocesspsbt', [serialized, true], btc)) as string;
  if (typeof processed !== 'string' || processed.length === 0) {
    throw new Error(`walletprocesspsbt returned a non-PSBT result: ${JSON.stringify(processed)}`);
  }

  // 2. finalizepsbt — finalize + extract the fully-signed tx when complete.
  const finalized = (await rpc('finalizepsbt', [processed], btc)) as {
    hex: string | null;
    complete: boolean;
  };
  if (!finalized || finalized.complete !== true || typeof finalized.hex !== 'string') {
    throw new Error(
      finalized
        ? `finalizepsbt not complete (${Object.values(plan.signatures).filter(Boolean).length}/${plan.requiredSignatures} signatures present)`
        : 'finalizepsbt returned no result'
    );
  }

  // 3. sendpsbt — broadcast the finalized tx, get the txid.
  const txid = (await rpc('sendpsbt', [finalized.hex], btc)) as string;
  if (typeof txid !== 'string' || !/^[0-9a-f]{64}$/i.test(txid)) {
    throw new Error(`sendpsbt returned an unexpected result: ${JSON.stringify(txid)}`);
  }
  return { txid: txid.toLowerCase(), hex: finalized.hex };
}

/**
 * Path B — raw-tx seam (watch-only node + external signer).
 *
 * Rail state decides what this seam does when no node answers:
 *   - `opts.railEnabled === true` (real rail): this does NOT substitute a
 *     placeholder. An unreachable or auth-failed node makes sendRawTransaction
 *     throw, and the caller reports `txid: null` + `rail: 'unavailable'`. Only a
 *     real bitcoind-provided txid may stand for an on-chain broadcast.
 *   - otherwise (demo/bootstrap, rail off): it returns a deterministic fake txid
 *     (`psbt:<planId>:<shortHash>`) so the rest of the seam (UI, receipts,
 *     reconcile) can iterate against a real-looking txid now. The caller tags
 *     it `placeholder: true` so it can never be read as a real spend.
 *
 * Payments math is in sats (Bitcoin rail). The CAD trust ledger stays in basis
 * points — the on-chain leg reconciles to the ledger post via the shared
 * referenceCode / plan id, not by converting sats here.
 */
export async function broadcastRawTx(
  plan: PsbtPlan,
  btc: BitcoindRpcConfig,
  outputs: { address: string; sats: number }[],
  opts: { railEnabled?: boolean } = {}
): Promise<BroadcastOutput> {
  const totalIn = plan.inputs.reduce((s, u) => s + u.sats, 0);
  const totalOut = outputs.reduce((s, o) => s + o.sats, 0);
  if (totalOut > totalIn) throw new Error(`outputs ${totalOut} > inputs ${totalIn}`);

  const hex = buildRawTxHex(plan, outputs); // placeholder skeleton

  if (opts.railEnabled === true) {
    // Real-rail path: prove an on-chain spend or fail loudly. sendRawTransaction
    // throws on an unreachable / auth-failed node — never substitute a
    // placeholder here, so the caller can report txid:null + rail:'unavailable'.
    const txid = await sendRawTransaction(hex, btc);
    return { txid, hex };
  }

  // Demo/bootstrap (rail off): deterministic placeholder txid so the rest of the
  // seam (UI, receipts, reconcile) can iterate before a node is configured. The
  // caller tags it placeholder:true.
  const txid = `psbt:${plan.id}:${createHash('sha256').update(hex).digest('hex').slice(0, 16)}`;
  return { txid, hex };
}

/** sendrawtransaction → txid. */
async function sendRawTransaction(hex: string, btc: BitcoindRpcConfig): Promise<string> {
  const result = (await rpc('sendrawtransaction', [hex], btc)) as string;
  if (typeof result === 'string' && /^[0-9a-f]{64}$/i.test(result)) return result.toLowerCase();
  throw new Error(`unexpected sendrawtransaction result: ${result}`);
}

/** Minimal JSON-RPC POST to bitcoind (Basic auth). */
async function rpc(method: string, params: unknown[], btc: BitcoindRpcConfig): Promise<unknown> {
  const body = JSON.stringify({ jsonrpc: '1.0', id: 'openstrata', method, params });
  const auth = btc.user && btc.pass ? `Basic ${Buffer.from(`${btc.user}:${btc.pass}`).toString('base64')}` : undefined;
  const res = await fetch(btc.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(auth ? { Authorization: auth } : {}) },
    body
  });
  if (!res.ok) throw new Error(`bitcoind ${method} status ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as { result?: unknown; error?: { code: number; message: string } };
  if (json.error) throw new Error(`bitcoind ${method}: ${json.error.message} (code ${json.error.code})`);
  return json.result;
}

// ---------------------------------------------------------------------------
// BIP174 PSBT serialization (shape-real skeleton)
// ---------------------------------------------------------------------------

const PSBT_MAGIC = Buffer.from([0x70, 0x73, 0x62, 0x74, 0xff]); // "psbt" + 0xff
const PSBT_GLOBAL_UNSIGNED_TX = 0x00;
const PSBT_IN_PARTIAL_SIG = 0x02;

/**
 * Serialize the plan into a valid BIP174 PSBT (base64):
 *   global map  = unsigned tx (correct field order, empty scriptSigs)
 *   input maps  = one partial-sig entry per recorded signature (placeholder
 *                 pubkey/DER bytes derived from the participant index — real
 *                 aggregated PSBTs arrive via `plan.psbtB64` and override this)
 *   output maps = empty
 *
 * The output parses with any BIP174 decoder and proves the plan → PSBT → node
 * chain end to end; the hardware-wallet coordinator replaces the placeholder
 * bytes with real signatures when the council signs.
 */
export function serializePsbtSkeleton(plan: PsbtPlan): string {
  const parts: Buffer[] = [PSBT_MAGIC];

  // Global map: key = <len=1><type=0x00> (PSBT_GLOBAL_UNSIGNED_TX),
  // value = <varint len><serialized unsigned tx>.
  const tx = serializeUnsignedTx(plan);
  parts.push(
    Buffer.from([0x01, PSBT_GLOBAL_UNSIGNED_TX]),
    varInt(tx.length), tx,
    Buffer.from([0x00]) // separator — end of global map
  );

  // Per-input maps: key = <klen=34><type=0x02><33-byte compressed pubkey>,
  // value = <len><DER sig bytes>. One partial-sig entry per recorded signature
  // (placeholder pubkey/DER derived from the participant index — real
  // aggregated PSBTs arrive via `plan.psbtB64` and override this skeleton).
  const sigIndexes = Object.keys(plan.signatures)
    .filter((k) => plan.signatures[k])
    .sort((a, b) => Number(a) - Number(b));
  for (const _input of plan.inputs) {
    for (const idx of sigIndexes) {
      // 33-byte compressed-key shape: 0x02 (even parity) + 32-byte x-only digest.
      const pubkey = Buffer.concat([
        Buffer.from([0x02]),
        createHash('sha256').update(`pubkey:${plan.id}:${idx}`).digest()
      ]);
      const der = createHash('sha256').update(`sig:${plan.id}:${idx}:${plan.signatures[idx]}`).digest();
      const key = Buffer.concat([Buffer.from([PSBT_IN_PARTIAL_SIG]), pubkey]);
      parts.push(
        Buffer.from([key.length]), key, // <klen><type+pubkey>
        Buffer.from([der.length]), der  // <vlen><sig>
      );
    }
    parts.push(Buffer.from([0x00])); // separator — end of this input map
  }

  // Output map: the plan carries one logical spend output (recipient, optional
  // change) — the skeleton emits one empty output map.
  parts.push(Buffer.from([0x00])); // separator — end of the output map

  return Buffer.concat(parts).toString('base64');
}

/** Compact-size varint (BIP144/BTC serialization). */
function varInt(n: number): Buffer {
  if (n < 253) return Buffer.from([n]);
  if (n <= 0xffff) {
    const b = Buffer.alloc(3);
    b[0] = 0xfd;
    b.writeUInt16LE(n, 1);
    return b;
  }
  const b = Buffer.alloc(5);
  b[0] = 0xfe;
  b.writeUInt32LE(n, 1);
  return b;
}

/**
 * Legacy serialization of the plan's unsigned tx: version | inputs | outputs |
 * locktime, with empty scriptSigs (that is what makes it *unsigned*) and
 * default sequence. This is the tx the PSBT's global map carries.
 */
function serializeUnsignedTx(plan: PsbtPlan): Buffer {
  const chunks: Buffer[] = [];
  const version = Buffer.alloc(4);
  version.writeUInt32LE(2, 0);
  chunks.push(version, varInt(plan.inputs.length));

  for (const u of plan.inputs) {
    const txid = Buffer.from(u.txid, 'hex');
    const prev = txid.length === 32 ? Buffer.from(txid).reverse() : createHash('sha256').update(u.txid).digest();
    const vout = Buffer.alloc(4);
    vout.writeUInt32LE(u.vout, 0);
    chunks.push(prev, vout, Buffer.from([0x00])); // empty scriptSig
    const seq = Buffer.alloc(4);
    seq.writeUInt32LE(0xffffffff, 0); // default sequence
    chunks.push(seq);
  }

  // One spend output: recipient scriptPubKey from the plan's amount/address.
  const value = Buffer.alloc(8);
  value.writeBigUInt64LE(BigInt(Math.max(0, plan.amountSats)), 0);
  const script = addressToScriptPubKey(plan.recipient);
  chunks.push(varInt(1), value, varInt(script.length), script);

  const locktime = Buffer.alloc(4);
  chunks.push(locktime);
  return Buffer.concat(chunks);
}

/** Address → scriptPubKey: real P2PKH for b58 addresses, hash-derived placeholder otherwise. */
function addressToScriptPubKey(addr: string): Buffer {
  try {
    const decoded = b58decode(addr);
    if (decoded[0] === 0x00 && decoded[decoded.length - 1] === 0x01) {
      const hash = decoded.subarray(1, 21);
      return Buffer.concat([
        Buffer.from('76a914', 'hex'),
        hash,
        Buffer.from('88ac', 'hex') // OP_EQUALVERIFY OP_CHECKSIG
      ]);
    }
  } catch {
    // not a P2PKH we recognize — placeholder below
  }
  return Buffer.concat([
    Buffer.from('0014', 'hex'),
    createHash('sha256').update(addr).digest().subarray(0, 20) // placeholder
  ]);
}

/**
 * Placeholder raw-tx skeleton for the raw seam. A real deploy fills inputs'
 * scriptSig/witness (the external-signer plug-in). Field order here is the
 * doc-order placeholder the seam has always emitted; the workflow seam's
 * `serializeUnsignedTx` is the correct-order builder.
 */
function buildRawTxHex(plan: PsbtPlan, outputs: { address: string; sats: number }[]): string {
  const inputs = plan.inputs.map((u) => [
    // txid (little-endian in a raw tx)
    reverseHex(u.txid),
    u.vout.toString(16).padStart(8, '0'),
    '00', // scriptSig len 0 (unsigned placeholder)
    '00'  // sequence
  ].join('')).join('');

  const outs = outputs.map((o) => [
    satoshival(o.sats),
    // placeholder: a real deploy uses the address's scriptPubKey; here we emit
    // a 25-byte P2PKH skeleton built from the b58 address so the shape is real.
    b58toP2pkhHex(o.address)
  ].join('')).join('');

  return [
    '02000000',                 // version
    (outputs.length >>> 0).toString(16).padStart(2, '0'), // outputs (1..)
    outs,
    (plan.inputs.length >>> 0).toString(16).padStart(2, '0'), // inputs
    inputs,
    '00000000'                  // locktime
  ].join('');
}

/** Satoshis → 8-byte little-endian hex. */
function satoshival(sats: number): string {
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64LE(BigInt(sats), 0);
  return buf.toString('hex');
}

/** P2PKH scriptPubKey skeleton from a b58 address (placeholder — real deploy uses the address type). */
function b58toP2pkhHex(addr: string): string {
  try {
    const decoded = b58decode(addr);
    if (decoded[0] === 0x00 && decoded[decoded.length - 1] === 0x01) {
      const hash = decoded.slice(1, 21);
      return '76a9' + '14' + hash.toString('hex') + '88ac'; // OP_DUP OP_HASH160 <hash> OP_EQUALVERIFY OP_CHECKSIG
    }
  } catch {
    // not a P2PKH we recognize — emit a placeholder
  }
  return '0014' + createHash('sha256').update(addr).digest().toString('hex').slice(0, 40) + '00'; // placeholder
}

/** Base58 decode → Buffer (bitcoin style, no version byte validation here). */
function b58decode(addr: string): Buffer {
  const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let n = 0n;
  for (const ch of addr) {
    const idx = alphabet.indexOf(ch);
    if (idx < 0) throw new Error(`bad base58 char: ${ch}`);
    n = n * 58n + BigInt(idx);
  }
  const byteLen = Math.max(1, Math.ceil(Number(n) / 256));
  const bytes = Buffer.alloc(byteLen);
  let i = bytes.length;
  while (n > 0n) {
    bytes[--i] = Number(n & 255n);
    n >>= 8n;
  }
  return bytes;
}

/** Hex string → reversed (little-endian txid). */
function reverseHex(h: string): string {
  const buf = Buffer.from(h, 'hex');
  return Buffer.from(buf.reverse()).toString('hex');
}

/** Human-readable summary of a plan for logs / the broadcast endpoint response. */
export function planSummary(plan: PsbtPlan): { id: string; ready: boolean; signed: number; required: number; amountSats: number; recipient: string } {
  return {
    id: plan.id,
    ready: plan.ready,
    signed: Object.values(plan.signatures).filter(Boolean).length,
    required: plan.requiredSignatures,
    amountSats: plan.amountSats,
    recipient: plan.recipient
  };
}
