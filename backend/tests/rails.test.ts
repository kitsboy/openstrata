import { describe, it, expect } from 'vitest';
import {
  validateOnchainAddress,
  validateLightning,
  validateLiquid,
  validatePayNym,
  validateNostrNpub,
  validateRailRecipient,
  quotePayment,
  referenceCodeFor,
  satsFromCadBasis,
  enabledRails,
  decodeBech32,
  bech32Encode,
  StaticRateProvider,
  deriveUnitAddress,
  unitChildIndex,
  type RailRegistry
} from '../src/rails/rails.js';

const LNURL = bech32Encode('lnurl', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

const seed = {
  refId: 'A9F',
  communityId: 'cedar-point',
  unitRef: 'unit-302',
  amountBasis: 50_000, // $500.00
  currency: 'CAD' as const,
  rail: 'lightning' as const
};

describe('recipient validation', () => {
  it('accepts SegWit v0 / legacy and rejects junk', () => {
    const v0 = bech32Encode('bc', [0, 1, 2, 3, 4, 5, 20, 30, 7]);
    expect(validateOnchainAddress(v0)).toEqual({ ok: true });
    const taproot = bech32Encode('bc', [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16], true);
    expect(validateOnchainAddress(taproot).ok).toBe(true);
    expect(validateOnchainAddress('1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2')).toEqual({ ok: true });
    expect(validateOnchainAddress('not-an-address').ok).toBe(false);
  });

  it('accepts LNURL / BOLT-11 with valid checksums and rejects malformed', () => {
    const lnurl = bech32Encode('lnurl', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    const lnbc = bech32Encode('lnbc', [2, 15, 20, 3]);
    expect(validateLightning(lnurl).ok).toBe(true);
    expect(validateLightning(lnbc).ok).toBe(true);
    expect(validateLightning('hello').ok).toBe(false);
    // bad checksum must be rejected
    expect(validateLightning('lnurl1qqqqqqqqq').ok).toBe(false);
  });

  it('accepts Liquid confidential / bech32 addresses', () => {
    const ex = 'EX' + 'A'.repeat(60);
    const ert = 'ert1' + 'a'.repeat(50);
    expect(validateLiquid(ex).ok).toBe(true);
    expect(validateLiquid(ert).ok).toBe(true);
    expect(validateLiquid('Q' + 'A'.repeat(30)).ok).toBe(true);
    expect(validateLiquid('nope').ok).toBe(false);
  });

  it('accepts BIP-47 PayNym payment codes', () => {
    expect(validatePayNym('PM8T3zoPPzY...').ok).toBe(false); // too short
    const paymentCode = 'PM8T' + 'A'.repeat(95);
    expect(validatePayNym(paymentCode).ok).toBe(true);
  });

  it('accepts Nostr npub with a valid checksum and raw hex pubkeys', () => {
    const npub = bech32Encode('npub', Array(52).fill(5)); // 52 words = 32-byte key
    expect(validateNostrNpub(npub).ok).toBe(true);
    expect(validateNostrNpub('0'.repeat(64)).ok).toBe(true);
    expect(validateNostrNpub(npub.slice(0, -2) + 'aa').ok).toBe(false);
  });

  it('routes validation by rail', () => {
    expect(validateRailRecipient('lightning', LNURL).ok).toBe(true);
    expect(validateRailRecipient('onchain', bech32Encode('bc', [0, 3, 5, 8, 9, 12, 1])).ok).toBe(true);
    expect(validateRailRecipient('liquid', 'EX' + 'A'.repeat(60)).ok).toBe(true);
    expect(validateRailRecipient('nostr', bech32Encode('npub', Array(52).fill(5))).ok).toBe(true);
    expect(validateRailRecipient('paynym_bip47', 'PM8T' + 'A'.repeat(95)).ok).toBe(true);
  });
});

describe('bech32 checksum (BIP-173)', () => {
  it('encodes and decodes with a valid checksum', () => {
    const words = [1, 2, 3, 4, 5];
    const decoded = decodeBech32(bech32Encode('lnurl', words));
    expect(decoded).not.toBeNull();
    expect(decoded?.hrp).toBe('lnurl');
    expect(decoded?.data).toEqual(words);
    expect(decoded?.bech32m).toBe(false);
  });

  it('rejects a corrupted checksum', () => {
    const encoded = bech32Encode('npub', Array(20).fill(9));
    const tampered = encoded.slice(0, -1) + (encoded.endsWith('a') ? 'b' : 'a');
    expect(decodeBech32(tampered)).toBeNull();
  });
});

describe('quoting + reconciliation reference', () => {
  it('builds a shared reference code for reconciliation', () => {
    expect(referenceCodeFor({ refId: 'A9F', unitRef: 'unit-302' })).toBe('pay-a9f-unit302');
  });

  it('lightning quote locks a 15-minute CAD window and converts sats', () => {
    const now = new Date('2026-08-25T16:00:00Z');
    const inv = quotePayment(seed, LNURL, now, 50_000);
    expect(inv.expiresAt).toBe('2026-08-25T16:15:00.000Z');
    expect(inv.fiatLockedBasis).toBe(50_000);
    expect(inv.amountSat).toBe(satsFromCadBasis(50_000, 50_000)); // $500 / $50k = 0.01 BTC = 1M sats
    expect(inv.amountSat).toBe(1_000_000);
    expect(inv.referenceCode).toBe('pay-a9f-unit302');
  });

  it('rejects a quote with an invalid recipient', () => {
    expect(() => quotePayment(seed, 'garbage', new Date(), 50_000)).toThrow(
      /expected an LNURL or BOLT-11 invoice|not a valid/
    );
  });

  it('computes sats from CAD basis', () => {
    expect(satsFromCadBasis(50_000, 50_000)).toBe(1_000_000);
    expect(satsFromCadBasis(10_000, 100_000)).toBe(100_000);
    expect(satsFromCadBasis(50_000, 0)).toBe(0);
  });
});

describe('rate provider', () => {
  it('StaticRateProvider returns the env/set rate and caches', async () => {
    const p = new StaticRateProvider({ rate: 50_000, cacheMs: 60_000 });
    expect(await p.cadPerBtc()).toBe(50_000);
  });

  it('StaticRateProvider returns null when no rate is set', async () => {
    const p = new StaticRateProvider({ cacheMs: 0 });
    expect(await p.cadPerBtc()).toBe(null);
  });
});

describe('deterministic unit addresses (xpub)', () => {
  it('is deterministic for a unit and rejects private prefixes', () => {
    const a = deriveUnitAddress('zpub6rm3p3cwhHdHmCmYm', 'unit-302');
    const b = deriveUnitAddress('zpub6rm3p3cwhHdHmCmYm', 'unit-302');
    expect(a.index).toBe(b.index);
    expect(a.path).toMatch(/^m\/84'/);
    expect(unitChildIndex('unit-101')).not.toBe(unitChildIndex('unit-302'));
    expect(() => deriveUnitAddress('xprv9s21ZrQH143K24Mfq5z', 'unit-1')).toThrow(
      /public prefix/
    );
  });
});

describe('rails registry / status', () => {
  it('lists enabled rails from a registry', () => {
    const registry: RailRegistry = {
      fiat: { enabled: true },
      lightning: { enabled: true, endpoint: 'grpc://127.0.0.1:10009' },
      nostr: { enabled: false }
    };
    const list = enabledRails(registry);
    expect(list.find((r) => r.rail === 'fiat')?.enabled).toBe(true);
    expect(list.find((r) => r.rail === 'lightning')?.enabled).toBe(true);
    expect(list.find((r) => r.rail === 'lightning')?.endpoint).toBe('grpc://127.0.0.1:10009');
    expect(list.find((r) => r.rail === 'nostr')?.enabled).toBe(false);
  });
});