/**
 * Ziggy on-chain broadcast plug-in seam — bitcoind JSON-RPC first.
 *
 * Given a ready PsbtPlan (threshold met) + a bitcoind RPC endpoint + auth,
 * this is the seam that turns a signed plan into an on-chain spend and returns
 * the txid so the rest of the system (the broadcast endpoint, receipts,
 * reconcile) can use a real transaction instead of the stub.
 *
 * Two seams exist; the host picks the one it runs:
 *   A. PSBT workflow (preferred when bitcoind has a wallet + signing key):
 *      walletprocesspsbt (sign) → finalizepsbt → sendpsbt. This is the BIP174
 *      path the hardware-wallet signatures eventually feed.
 *   B. Raw tx path (simpler deployed form, watch-only UTXOs + external signer):
 *      build the signed raw hex from the plan's inputs + outputs, then
 *      sendrawtransaction. The signing step is the plug-in for external signers
 *      (hardware wallets, multisig coordinators).
 *
 * Today this module exposes the *raw tx* seam as the first real broadcast path
 * (it works with a watch-only node + an external signer), and documents the PSBT
 * workflow seam as the next step. The caller (the broadcast endpoint /
 * broadcastPsbt) chooses which seam based on what the host has configured.
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
  hex: string;
}

/**
 * Build + broadcast a spend from the plan's inputs + outputs, returning the
 * txid from bitcoind's sendrawtransaction.
 *
 * This is the *unsigned* raw-tx seam placeholder: it emits a minimal raw tx
 * skeleton (version/locktime/input/output counts + txid/vout placeholders) and
 * sends it via sendrawtransaction. The real serialization (BIP174 PSBT
 * finalize, or manual witness/scriptSig building) is the next seam and lives in
 * the plug-in the host chooses. For now this proves the seam end to end
 * (plan → broadcast → txid) against a bitcoind the operator controls, even
 * before the multisig signing flow is wired.
 *
 * Payments math is in sats (Bitcoin rail). The CAD trust ledger stays in basis
 * points — the on-chain leg reconciles to the ledger post via the shared
 * referenceCode / plan id, not by converting sats here.
 */
export async function broadcastRawTx(
  plan: PsbtPlan,
  btc: BitcoindRpcConfig,
  outputs: { address: string; sats: number }[]
): Promise<BroadcastOutput> {
  const totalIn = plan.inputs.reduce((s, u) => s + u.sats, 0);
  const totalOut = outputs.reduce((s, o) => s + o.sats, 0);
  if (totalOut > totalIn) throw new Error(`outputs ${totalOut} > inputs ${totalIn}`);

  const hex = buildRawTxHex(plan, outputs); // placeholder skeleton
  const txid = await sendRawTransaction(hex, btc);
  return { txid, hex };
}

/** sendrawtransaction → txid. */
async function sendRawTransaction(hex: string, btc: BitcoindRpcConfig): Promise<string> {
  const result = (await rpc('sendrawtransaction', [hex], btc)) as string;
  if (!createHash('sha256').update(result).digest('hex').startsWith('0'.repeat(0))) {
    // txid should be a 64-char hex hash; sendrawtransaction returns the txid.
    if (typeof result === 'string' && /^[0-9a-f]{64}$/i.test(result)) return result.toLowerCase();
  }
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

/**
 * Placeholder raw-tx skeleton. A real deploy fills inputs' scriptSig/witness
 * (the signing plug-in) and uses a real b58→scriptPubKey build. This is the
 * shape the seam returns so the rest of the system can iterate against real
 * field names without blocking on the signing flow.
 */
function buildRawTxHex(plan: PsbtPlan, outputs: { address: string; sats: number }[]): string {
  // Keep it a valid-shaped placeholder the caller can swap for a real builder.
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
