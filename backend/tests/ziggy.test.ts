import { describe, it, expect } from 'vitest';
import {
  crfFloor,
  checkCrfCap,
  authorizeSpend,
  invoiceFingerprint
} from '../src/ziggy/ziggy.js';
import { reconcile } from '../src/trf/recon.js';

const budget = { fiscalYear: '2026', totalOperatingBasis: 4_200_000, crfMandatoryPct: 10 };

describe('ziggy CRF hard block', () => {
  it('computes the 10% mandatory floor', () => {
    expect(crfFloor(budget)).toBe(420_000);
  });

  it('blocks a CRF spend that would breach the floor', () => {
    const cap = checkCrfCap(budget, 500_000, 100_000);
    expect(cap.breached).toBe(true);
    expect(cap.floorBasis).toBe(420_000);
  });

  it('allows a CRF spend that stays above the floor', () => {
    const cap = checkCrfCap(budget, 600_000, 100_000);
    expect(cap.breached).toBe(false);
  });

  it('authorizeSpend returns allow for an operating expense with a PO', () => {
    const verdict = authorizeSpend(budget, { operating: 1_000_000, crf: 500_000 }, {
      amountBasis: 10_000,
      fundCode: 'operating',
      poRef: 'PO-100',
      category: 'maintenance'
    });
    expect(verdict.allow).toBe(true);
  });

  it('authorizeSpend rejects an unverified expense with no PO', () => {
    const verdict = authorizeSpend(budget, { operating: 1_000_000 }, {
      amountBasis: 1000,
      fundCode: 'operating',
      poRef: '',
      category: 'maintenance'
    });
    expect(verdict).toMatchObject({ allow: false, blocked: 'expense-unverified' });
  });

  it('authorizeSpend hard-blocks a CRF breach', () => {
    const verdict = authorizeSpend(budget, { crf: 500_000 }, {
      amountBasis: 100_000, // post-CRF = 400k < 420k floor
      fundCode: 'crf',
      poRef: 'PO-200',
      category: 'roofing'
    });
    expect(verdict).toMatchObject({ allow: false, blocked: 'crf-floor' });
  });

  it('rejects when the fund balance is insufficient', () => {
    const verdict = authorizeSpend(budget, { operating: 500 }, {
      amountBasis: 1000,
      fundCode: 'operating',
      poRef: 'PO-3',
      category: 'supplies'
    });
    expect(verdict).toMatchObject({ allow: false, blocked: 'no-funds' });
  });
});

describe('ziggy duplicate detection', () => {
  it('same invoice yields the same fingerprint; different amount differs', () => {
    const a = invoiceFingerprint('INV-1', 'Roof Co', 12345);
    const b = invoiceFingerprint('INV-1', 'Roof Co', 12345);
    const c = invoiceFingerprint('INV-1', 'Roof Co', 12346);
    expect(a).toBe(b);
    expect(a).not.toBe(c);
  });
});

describe('ziggy reconciliation (no-guess)', () => {
  const units = [
    { unitId: '101', refs: ['101', 'unit101', 'chen'] },
    { unitId: '302', refs: ['302', 'unit302', 'chen'] }
  ];

  it('auto-posts a reference unique to one unit', () => {
    expect(reconcile('ET Unit 101 May', units)).toEqual({ status: 'auto', unitId: '101' });
  });

  it('flags ambiguous references that hit multiple units', () => {
    expect(reconcile('Chen', units)).toEqual({ status: 'ambiguous', matches: ['101', '302'] });
  });

  it('leaves unmatched transfers for a human', () => {
    expect(reconcile('For the pool fund', units)).toEqual({ status: 'unmatched' });
  });

  it('rejects empty references (never guesses)', () => {
    expect(reconcile('', units)).toEqual({ status: 'unmatched' });
  });
});