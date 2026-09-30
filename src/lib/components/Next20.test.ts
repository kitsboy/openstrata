import { describe, it, expect } from 'vitest';
import { formDeliverBy, daysUntil, FORM_DELIVERY_DAYS } from '$lib/api/forms';

describe('forms deadline math (SPA ss.256–258 7-day window)', () => {
  it('formDeliverBy adds 7 calendar days', () => {
    expect(formDeliverBy('2026-08-01')).toBe('2026-08-08');
    expect(formDeliverBy('2026-08-25')).toBe('2026-09-01');
  });

  it('crosses month boundaries', () => {
    expect(formDeliverBy('2026-12-28')).toBe('2027-01-04');
  });

  it('daysUntil counts whole days and goes negative when overdue', () => {
    const now = new Date('2026-08-26T12:00:00');
    expect(daysUntil('2026-08-30', now)).toBe(4);
    expect(daysUntil('2026-08-26', now)).toBe(0);
    expect(daysUntil('2026-08-20', now)).toBe(-6);
  });

  it('the delivery window constant is 7 days', () => {
    expect(FORM_DELIVERY_DAYS).toBe(7);
  });
});

describe('QrPay payload derivation (deep links)', () => {
  // Same logic as the component: onchain -> bitcoin: URI, lightning -> lightning: URI.
  const walletLink = (rail: 'lightning' | 'onchain', payload: string): string =>
    rail === 'onchain'
      ? payload.startsWith('bitcoin:') ? payload : `bitcoin:${payload}`
      : payload.startsWith('lnurl') || payload.startsWith('lnbc')
        ? `lightning:${payload.replace(/^lightning:/, '')}`
        : payload;

  it('wraps a bare on-chain address in a bitcoin: URI', () => {
    expect(walletLink('onchain', 'bc1qabc')).toBe('bitcoin:bc1qabc');
  });

  it('keeps an already-URIfied bitcoin: payload unchanged', () => {
    expect(walletLink('onchain', 'bitcoin:bc1qabc?amount=0.001')).toBe('bitcoin:bc1qabc?amount=0.001');
  });

  it('wraps LNURL/LNBC in a lightning: URI', () => {
    expect(walletLink('lightning', 'lnurl1dp68gurn8ghj')).toBe('lightning:lnurl1dp68gurn8ghj');
    expect(walletLink('lightning', 'lnbc1mxyz')).toBe('lightning:lnbc1mxyz');
  });

  it('leaves non-BTC payloads alone (e.g. demo reference codes)', () => {
    expect(walletLink('lightning', 'demo-a1b2c3')).toBe('demo-a1b2c3');
  });
});
