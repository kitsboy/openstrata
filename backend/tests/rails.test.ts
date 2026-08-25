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
  type RailRegistry
} from '../src/rails/rails.js';

const seed = {
  refId: 'A9F',
  communityId: 'cedar-point',
  unitRef: 'unit-302',
  amountBasis: 50_000, // $500.00
  currency: 'CAD' as const,
  rail: 'lightning' as const
};

describe('recipient validation', () => {
  it('accepts SegWit/taproot on-chain and rejects junk', () => {
    expect(validateOnchainAddress('bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh')).toEqual({ ok: true });
    expect(validateOnchainAddress('1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2')).toEqual({ ok: true });
    expect(validateOnchainAddress('not-an-address').ok).toBe(false);
  });

  it('accepts LNURL / BOLT-11 and rejects malformed', () => {
    expect(validateLightning('lnurl1dp68gurn8ghj7um9wfcltv59uzn2umrwessxvcerw').ok).toBe(true);
    expect(validateLightning('lnbc1quickinvoice').ok).toBe(true);
    expect(validateLightning('hello').ok).toBe(false);
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

  it('accepts Nostr npub and raw hex pubkeys', () => {
    expect(validateNostrNpub('npub' + 'a'.repeat(60)).ok).toBe(true);
    expect(validateNostrNpub('0'.repeat(64)).ok).toBe(true);
    expect(validateNostrNpub('npubZ2zxyapq7y3qrk8jplk3tg4q6wgxz3vhuvqw'.toLowerCase()).ok).toBe(false);
  });

  it('routes validation by rail', () => {
    expect(validateRailRecipient('lightning', 'lnurl1dp68').ok).toBe(true);
    expect(validateRailRecipient('onchain', 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh').ok).toBe(true);
    expect(validateRailRecipient('liquid', 'EX' + 'A'.repeat(60)).ok).toBe(true);
    expect(validateRailRecipient('nostr', 'npub' + 'a'.repeat(60)).ok).toBe(true);
    expect(validateRailRecipient('paynym_bip47', 'PM8T' + 'A'.repeat(95)).ok).toBe(true);
  });
});

describe('quoting + reconciliation reference', () => {
  it('builds a shared reference code for reconciliation', () => {
    expect(referenceCodeFor({ refId: 'A9F', unitRef: 'unit-302' })).toBe('pay-a9f-unit302');
  });

  it('lightning quote locks a 15-minute CAD window and converts sats', () => {
    const now = new Date('2026-08-25T16:00:00Z');
    const inv = quotePayment(seed, 'lnurl1dp68gurn8ghj7um9wfcltv59', now, 50_000);
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