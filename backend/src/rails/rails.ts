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
  // Bech32 SegWit (bc1...) or legacy (1.../3...).
  if (/^[13][1-9A-HJ-NP-Za-km-z]{25,40}$/.test(a)) return { ok: true };
  if (/^bc1[a-z0-9]{39,90}$/i.test(a)) return { ok: true };
  if (/^bc1p[a-z0-9]{57,91}$/i.test(a)) return { ok: true }; // taproot
  if (/^tb1[a-z0-9]{39,90}$/i.test(a)) return { ok: true }; // testnet
  return { ok: false, reason: 'not a valid Bitcoin on-chain address' };
}

export function validateLightning(recipient: string): ValidateResult {
  const r = recipient.trim().toLowerCase();
  if (r.startsWith('lnurl') || r.startsWith('lnbc') || r.startsWith('lntb') || r.startsWith('lnbcrt')) {
    return BECH32.test(r) ? { ok: true } : { ok: false, reason: 'malformed Lightning identifier' };
  }
  if (/^lightning:\/\//i.test(recipient)) return { ok: true };
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
  if (n.startsWith('npub') && /^npub[0-9a-z]{50,70}$/.test(n)) return { ok: true };
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