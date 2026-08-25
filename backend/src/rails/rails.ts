/**
 * Sovereign payment rails — Bitcoin + Layer-2 acceptance layer.
 *
 * Covers the framework doc's Bitcoin rail (3-of-5 PSBT + Lightning) and the
 * follow-on rails Cam asked to prepare for: Lightning Network (LNURL/BOLT-12),
 * Liquid (L-USD/L-BTC), PayNym (BIP-47 payment codes), Bitcoin mainnet, and
 * Nostr identity. Guiding principle (PRODUCT-PLAN): **fiat primary, Bitcoin
 * additive, never custody.**
 *
 * This module is PURE + deterministic: it validates recipients, builds
 * rail-specific invoices/requests with a shared `referenceCode` (so Ziggy +
 * the trust ledger can reconcile the same way e-transfers do), and enforces
 * the LNURL 15-minute CAD rate-lock window. Network calls (LND/Liquid/Nostr
 * relays) are behind seams the operator wires when those daemons exist.
 */

export type Rail = 'fiat' | 'onchain' | 'lightning' | 'liquid' | 'paynym_bip47' | 'nostr';
export type RailNetwork = 'mainnet' | 'testnet';
export type Currency = 'CAD' | 'BTC' | 'USDT';

export interface RailConfig {
  enabled: boolean;
  endpoint?: string; // LND / Liquid JSON-RPC / relay URL
  network?: RailNetwork;
}

export interface RailRegistry {
  [rail: string]: RailConfig;
}

export interface PaymentRequestSeed {
  /** Caller-supplied unique id for this request (for idempotency/reference). */
  refId: string;
  communityId: string;
  /** Per-unit ledger reference, e.g. 'unit-302'. */
  unitRef: string;
  /** Amount in integer fiat basis points (100 bp = 1.00), or sat if rail is BTC-only. */
  amountBasis: number;
  currency: Currency;
  rail: Rail;
  note?: string;
}

const RAIL_NAMES: Record<Rail, string> = {
  fiat: 'Fiat',
  onchain: 'Bitcoin (on-chain)',
  lightning: 'Lightning Network',
  liquid: 'Liquid Network',
  paynym_bip47: 'PayNym (BIP-47)',
  nostr: 'Nostr'
};

export type ValidateResult = { ok: true } | { ok: false; reason: string };

/**
 * Deterministic reference code shared across every rail so Ziggy reconciliation
 * and the ledger can match a confirmed payment back to a unit + request.
 */
export function referenceCodeFor(seed: {
  refId: string;
  unitRef: string;
}): string {
  const unit = seed.unitRef.replace(/[^a-zA-Z0-9]/g, '');
  return `pay-${seed.refId}-${unit}`.toLowerCase();
}

// ---------------------------------------------------------------------------
// Address / identifier validation
// ---------------------------------------------------------------------------

const BECH32 = /^(bc1|lnbc|lntb|lnurl|lnbcrt|belnp|blnb)[0-9a-z]{4,}$/i;

export function validateOnchainAddress(addr: string): ValidateResult {
  const a = addr.trim();
  if (!a) return { ok: false, reason: 'empty address' };
  // Legacy P2PKH (1...) / P2SH (3...) — format-only (base58check is wallet-side).
  if (/^[13][1-9A-HJ-NP-Za-km-z]{25,40}$/.test(a)) return { ok: true };
  // Bech32 / bech32m with real BIP-173 checksum.
  if (/^(bc1|tb1)/i.test(a)) {
    const dec = decodeBech32(a);
    if (!dec || !['bc', 'tb'].includes(dec.hrp) || !dec.data.length) {
      return { ok: false, reason: 'bad bech32 checksum or hrp' };
    }
    const version = dec.data[0];
    if (version === 0 && !dec.bech32m) return { ok: true }; // segwit v0
    if (version === 1 && dec.bech32m) return { ok: true }; // taproot v1
    return { ok: false, reason: 'unsupported witness version' };
  }
  return { ok: false, reason: 'not a valid Bitcoin on-chain address' };
}

export function validateLightning(recipient: string): ValidateResult {
  const r = recipient.trim();
  if (/^lightning:\/\//i.test(r)) return { ok: true };
  const rr = r.toLowerCase();
  if (rr.startsWith('lnbc') || rr.startsWith('lntb') || rr.startsWith('lnbcrt')) {
    // BOLT-11 invoices are bech32; require a valid checksum.
    const dec = decodeBech32(rr);
    return dec && dec.data.length >= 4
      ? { ok: true }
      : { ok: false, reason: 'malformed or invalid-checksum Lightning invoice' };
  }
  if (rr.startsWith('lnurl')) {
    // LNURL strings are bech32 too; checksum-verify when possible.
    const dec = decodeBech32(rr);
    return dec && dec.data.length >= 8 ? { ok: true } : { ok: false, reason: 'malformed LNURL' };
  }
  return { ok: false, reason: 'expected an LNURL or BOLT-11 invoice' };
}

export function validateLiquid(addr: string): ValidateResult {
  const a = addr.trim();
  // Liquid confidential addresses begin EX then a long base58/bech32 body.
  if (/^(ex[0-9a-z]{50,100}|EX[0-9A-Za-z]{50,100})$/.test(a)) return { ok: true };
  if (/^(M|Q)[1-9A-HJ-NP-Za-km-z]{25,40}$/.test(a)) return { ok: true };
  if (/^(ert1|lq1|ex1)[0-9a-z]{39,90}$/i.test(a)) return { ok: true };
  return { ok: false, reason: 'not a valid Liquid address' };
}

export function validatePayNym(recipient: string): ValidateResult {
  // BIP-47 payment codes are an 80-byte base58 payload beginning 'PM8T' and are
  // usually ~95-110 chars. Format + length sanity only (no checksum yet).
  const p = recipient.trim();
  if (!/^PM8T[A-Za-z0-9]+$/.test(p)) {
    return { ok: false, reason: 'invalid BIP-47 payment code (expected PM8T...) / PayNym' };
  }
  if (p.length < 90 || p.length > 116) {
    return { ok: false, reason: 'unexpected PayNym length' };
  }
  return { ok: true };
}

export function validateNostrNpub(npub: string): ValidateResult {
  const n = npub.trim();
  if (n.startsWith('npub')) {
    const dec = decodeBech32(n);
    // A 32-byte secp256k1 pubkey encodes to 52 five-bit data words.
    if (dec && dec.hrp === 'npub' && dec.data.length === 52) {
      return { ok: true };
    }
    return { ok: false, reason: 'invalid npub checksum' };
  }
  // Accept a raw 64-char hex pubkey too (many keys are kept in hex).
  if (/^[0-9a-f]{64}$/i.test(n)) return { ok: true };
  return { ok: false, reason: 'expected an npub (bech32) or 64-char hex public key' };
}

export function validateRailRecipient(rail: Rail, recipient: string): ValidateResult {
  switch (rail) {
    case 'onchain':
      return validateOnchainAddress(recipient);
    case 'lightning':
      return validateLightning(recipient);
    case 'liquid':
      return validateLiquid(recipient);
    case 'paynym_bip47':
      return validatePayNym(recipient);
    case 'nostr':
      return validateNostrNpub(recipient);
    case 'fiat':
      return recipient ? { ok: true } : { ok: false, reason: 'fiat rails need an account reference' };
    default:
      return { ok: false, reason: `unsupported rail '${rail}'` };
  }
}

// ---------------------------------------------------------------------------
// Quoting / invoice building
// ---------------------------------------------------------------------------

export interface RailInvoice {
  rail: Rail;
  label: string;
  referenceCode: string;
  recipient: string;
  network?: RailNetwork;
  /** Invoice string for LN / Liquid asset / on-chain address; identity for Nostr. */
  invoice?: string;
  /** Fiat-equivalent locked (bp) for convertible rails; undefined for pure BTC. */
  fiatLockedBasis?: number;
  /** Raw units: sat for BTC rails, sats for LN, fiat bp otherwise. */
  amountSat?: number;
  expiresAt?: string; // ISO; required for LNURL rate lock
  note?: string;
}

/** Raw requested amount in BTC sats for a rail that transacts in BTC. */
export function railIsBitcoinDenominated(rail: Rail): boolean {
  return ['onchain', 'lightning', 'liquid', 'paynym_bip47'].includes(rail);
}

/**
 * Build a rail invoice/request. Applies per-rail rules:
 *  - lightning: sets an expiry 15 minutes from `nowUtc` (LNURL CAD rate lock).
 *  - bitcoin-denominated rails parse the CAD basis into sats using the supplied
 *    `cadPerBtc` (string or number), rounding to 0 sats fraud-check (>= 1).
 *  - nostr: emits an npub notice (identity, not a transfer) — no amount.
 */
export function quotePayment(
  seed: PaymentRequestSeed,
  recipient: string,
  nowUtc = new Date(),
  cadPerBtc: number | string = 0
): RailInvoice {
  if (!seed.refId || !seed.unitRef) throw new Error('refId and unitRef are required');
  if (seed.communityId && seed.amountBasis < 0) throw new Error('amount must be non-negative');

  const validated = validateRailRecipient(seed.rail, recipient);
  if (!validated.ok) throw new Error(validated.reason);

  const referenceCode = referenceCodeFor(seed);
  const base: RailInvoice = {
    rail: seed.rail,
    label: RAIL_NAMES[seed.rail],
    referenceCode,
    recipient,
    note: seed.note
  };

  if (seed.rail === 'lightning') {
    const expiresAt = new Date(nowUtc.getTime() + 15 * 60 * 1000);
    const rate = toInt(cadPerBtc);
    return {
      ...base,
      invoice: recipient,
      amountSat: satsFromCadBasis(seed.amountBasis, rate),
      fiatLockedBasis: seed.amountBasis,
      expiresAt: expiresAt.toISOString()
    };
  }

  if (railIsBitcoinDenominated(seed.rail)) {
    const rate = toInt(cadPerBtc);
    return {
      ...base,
      invoice: recipient,
      network: 'mainnet',
      amountSat: satsFromCadBasis(seed.amountBasis, rate),
      fiatLockedBasis: seed.amountBasis
    };
  }

  if (seed.rail === 'nostr') {
    // Nostr is identity/notification, not a transfer; no amount required.
    return { ...base, note: seed.note ?? `dm to ${seed.unitRef}` };
  }

  // fiat
  return { ...base, fiatLockedBasis: seed.amountBasis };
}

function toInt(v: number | string): number {
  const n = typeof v === 'string' ? parseFloat(v) : v;
  return Number.isFinite(n) ? n : 0;
}

/** Convert a CAD basis amount to sats at a given CAD/BTC rate (1 BTC = 100M sats). */
export function satsFromCadBasis(cadBasis: number, cadPerBtc: number): number {
  if (cadPerBtc <= 0) return 0;
  const cad = cadBasis / 100;
  const btc = cad / cadPerBtc;
  return Math.max(1, Math.round(btc * 100_000_000));
}

/** Compute the enabled rails from a registry (for /api/v1/rails/status). */
export function enabledRails(registry: RailRegistry): Array<{ rail: Rail; name: string; enabled: boolean; endpoint?: string }> {
  return (Object.keys(RAIL_NAMES) as Rail[]).map((rail) => {
    const cfg = registry[rail] ?? { enabled: false };
    return { rail, name: RAIL_NAMES[rail], enabled: !!cfg.enabled, endpoint: cfg.endpoint };
  });
}

export const RAIL_NAMES_BY_KEY = RAIL_NAMES;

// ---------------------------------------------------------------------------
// Bech32 / bech32m (BIP-173) checksum verification
// ---------------------------------------------------------------------------

const CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';

function polymod(values: number[]): number {
  const GENERATOR = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];
  let chk = 1;
  for (const value of values) {
    const top = chk >>> 25;
    chk = ((chk & 0x1ffffff) << 5) ^ value;
    for (let i = 0; i < 5; i++) {
      if ((top >>> i) & 1) chk ^= GENERATOR[i];
    }
  }
  return chk;
}

function hrpExpand(hrp: string): number[] {
  const hi: number[] = [];
  const lo: number[] = [];
  for (let i = 0; i < hrp.length; i++) {
    const c = hrp.charCodeAt(i) >> 5;
    hi.push(c);
  }
  for (let i = 0; i < hrp.length; i++) {
    lo.push(hrp.charCodeAt(i) & 31);
  }
  return [...hi, 0, ...lo];
}

function createChecksum(hrp: string, data: number[], bech32m: boolean): number[] {
  const values = [...hrpExpand(hrp), ...data, 0, 0, 0, 0, 0, 0];
  const mod = polymod(values) ^ (bech32m ? 0x2bc830a3 : 1);
  const ret: number[] = [];
  for (let i = 0; i < 6; i++) ret.push((mod >>> (5 * (5 - i))) & 31);
  return ret;
}

/** Encode a bech32 (bech32m=false) string from an hrp + five-bit data words. */
export function bech32Encode(hrp: string, data: number[], bech32m = false): string {
  const checksum = createChecksum(hrp, data, bech32m);
  const all = [...data, ...checksum];
  const charset = CHARSET;
  return `${hrp}1${all.map((w) => charset[w]).join('')}`;
}

/**
 * Decode a bech32/bech32m string, verifying the checksum per BIP-173.
 * Returns `null` when the format or checksum is invalid.
 */
export function decodeBech32(str: string): {
  hrp: string;
  data: number[];
  bech32m: boolean;
} | null {
  const s = str.trim().toLowerCase();
  const pos = s.lastIndexOf('1');
  if (pos < 1 || pos + 7 > s.length) return null;
  const hrp = s.slice(0, pos);
  const dataPart = s.slice(pos + 1);
  if (!hrp || !/^[a-z0-9]+$/.test(dataPart)) return null;
  if (dataPart.length < 6) return null;
  const words = dataPart.split('').map((c) => CHARSET.indexOf(c));
  if (words.some((w) => w === -1)) return null;

  const values = [...hrpExpand(hrp), ...words];
  const check = polymod(values);
  if (check === 1) return { hrp, data: words.slice(0, -6), bech32m: false };
  if (check === 0x2bc830a3) return { hrp, data: words.slice(0, -6), bech32m: true };
  return null;
}

// ---------------------------------------------------------------------------
// Pluggable CAD/BTC rate provider
// ---------------------------------------------------------------------------

export interface RateProvider {
  cadPerBtc(): Promise<number | null>;
}

/**
 * Static/env-backed rate provider (off by default until a live feed exists).
 * `staticCadPerBtc` is read from env `CAD_PER_BTC`; can be overridden in tests.
 * A `cacheMs` lets the operator request fresh values later without the provider
 * knowing about the upstream API.
 */
export class StaticRateProvider implements RateProvider {
  private cache: { at: number; value: number | null } = { at: 0, value: null };

  constructor(private readonly options: { rate?: number; cacheMs?: number } = {}) {
    const fromEnv = Number(process.env.CAD_PER_BTC);
    const rate = this.options.rate ?? (Number.isFinite(fromEnv) && fromEnv > 0 ? fromEnv : null);
    this.cache = { at: this.options.rate ? 0 : Date.now(), value: rate };
  }

  async cadPerBtc(): Promise<number | null> {
    const { cacheMs = 60_000 } = this.options;
    if (this.cache.value !== null && Date.now() - this.cache.at < cacheMs) {
      return this.cache.value;
    }
    // Seam: replace the static value with a live fetch from your FX/BTC provider.
    return this.cache.value;
  }
}

// ---------------------------------------------------------------------------
// Deterministic per-unit receive addresses from a BIP-32 xpub (watch-only)
// ---------------------------------------------------------------------------

const PUBLIC_XPUB_PREFIXES = new Set(['xpub', 'ypub', 'zpub', 'tpub', 'vpub']);

export interface XpubDeriveResult {
  xpub: string;
  unitId: string;
  /** BIP32 path for the deterministic child index. */
  path: string;
  index: number;
  /** Raw segmented-witness bytes when derivation is integrated; format-only stub today. */
  note: string;
}

/** Deterministic, non-negative child index for a unit (stable across calls). */
export function unitChildIndex(unitRef: string): number {
  let h = 2166136261;
  for (const ch of unitRef) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) >>> 0; // unsigned 32-bit
}

/**
 * Build the watch-only receive descriptor for a unit. Validates the xpub
 * prefix and returns a BIP32 path (m/84'/0'/0'/0/<index>). Full address
 * derivation needs a secp256k1/BIP32 lib — this is the deterministic seam.
 */
export function deriveUnitAddress(
  xpub: string,
  unitRef: string,
  network: RailNetwork = 'mainnet'
): XpubDeriveResult {
  const prefix = xpub.slice(0, 4);
  if (!PUBLIC_XPUB_PREFIXES.has(prefix)) {
    throw new Error('invalid xpub: expected a public prefix (xpub/ypub/zpub/tpub/vpub)');
  }
  const index = unitChildIndex(unitRef);
  const hardening = "84'"; // BIP-84 native segwit across mainnet/testnet
  const coin = network === 'mainnet' ? 0 : 1;
  return {
    xpub,
    unitId: unitRef,
    index,
    path: `m/${hardening}/${coin}'/0'/${index}`,
    note:
      'Path-selected deterministically from the unit ref; address bytes require a BIP32/secp256k1 library to materialize.'
  };
}