import { describe, it, expect } from 'vitest';
import { runBilling, referenceFor } from '../src/billing/billing.js';

const fees = [
  { unitId: '101', monthlyBasis: 35_000 },
  { unitId: '302', monthlyBasis: 48_500 }
];

const cfg = { period: '2026-09', dueDay: 1, graceDays: 5, lateFlatBasis: 2_000 };

describe('billing runBilling', () => {
  it('charges every unit for the period', () => {
    const run = runBilling(fees, () => 0, cfg, new Date('2026-09-08'));
    expect(run.charges).toHaveLength(2);
    expect(run.totalChargedBasis).toBe(35_000 + 48_500);
    expect(run.charges[0].kind).toBe('strata_fee');
    expect(run.charges[0].referenceCode).toBe(referenceFor('101'));
  });

  it('issues a late notice only when arrears clear a full month after grace', () => {
    // due 1st + grace 5 = effective 2026-09-06; reference date past it.
    const run = runBilling(fees, (u) => (u === '302' ? 99_000 : 0), cfg, new Date('2026-09-08'));
    expect(run.lateNotices).toHaveLength(1);
    expect(run.lateNotices[0].unitId).toBe('302');
    expect(run.lateNotices[0].lateFeeBasis).toBe(2_000);
    expect(run.lateNotices[0].effectiveDate).toBe('2026-09-06');
  });

  it('does not issue a late notice before the grace window elapses', () => {
    const run = runBilling(fees, () => 99_000, cfg, new Date('2026-09-01'));
    expect(run.lateNotices).toHaveLength(0);
  });

  it('rejects an invalid period and an invalid fee', () => {
    expect(() => runBilling(fees, () => 0, { ...cfg, period: '2026/09' }, new Date())).toThrow(
      /invalid period/
    );
    expect(() =>
      runBilling([{ unitId: 'x', monthlyBasis: -5 }], () => 0, cfg, new Date())
    ).toThrow(/invalid monthly fee/);
  });
});