import { unitArFundCode } from '../units/model.js';

/**
 * Billing — automated strata-fee billing + late notices.
 *
 * Contract (module 'Automated Fee Billing'): per-unit monthly fee schedules,
 * late notices, AR tracking. This module is pure + deterministic: it computes
 * a bill run (charges + late notices) from fee schedules and a resolver that
 * reports a unit's current arrears. The Fastify layer posts the resulting
 * charges to the trust ledger so billing is wired end-to-end.
 *
 * Amounts are in basis points (100 bp = 1.00 CAD) for internals directly usable
 * by the ledger.
 */

export interface UnitFee {
  unitId: string;
  monthlyBasis: number; // e.g. 35_000 bp = $350.00 / month
  /** Optional per-community override reference (e.g. 'unit-101'). */
  referenceCode?: string;
}

export interface BillingConfig {
  /** Human period label, e.g. '2026-09'. */
  period: string;
  /** Calendar day of month fees are due (1..31). */
  dueDay: number;
  /** Grace days after dueDay before a late notice is issued. */
  graceDays: number;
  /** Monthly late fee as a flat integer amount in bp, added on a notice. */
  lateFlatBasis: number;
}

export interface UnitCharge {
  unitId: string;
  amountBasis: number;
  referenceCode: string;
  kind: 'strata_fee';
}

export interface LateNotice {
  unitId: string;
  arrearsBasis: number;
  lateFeeBasis: number;
  reason: string;
  // Date the notice is effective (due day + grace days).
  effectiveDate: string;
}

export interface BillRun {
  period: BillingConfig['period'];
  charges: UnitCharge[];
  lateNotices: LateNotice[];
  totalChargedBasis: number;
}

export type ArrearsResolver = (unitId: string) => number;

/**
 * Default AR ledger fund for a unit's charges. Delegates to the canonical
 * per-unit AR account (`ar:unit-<n>`) so billing AR, unit detail, and the
 * ledger all address the same account — the model's "one place to change a
 * unit" guarantee.
 */
export function referenceFor(unitId: string): string {
  return unitArFundCode(unitId);
}

function isoDaysFromBase(year: number, month: number, day: number): string {
  const d = new Date(Date.UTC(year, month - 1, day));
  return d.toISOString().slice(0, 10);
}

const MONTH_INDEX: Record<string, number> = {
  '01': 1, '02': 2, '03': 3, '04': 4, '05': 5, '06': 6,
  '07': 7, '08': 8, '09': 9, '10': 10, '11': 11, '12': 12
};

/**
 * Produce one billing run for a period (format 'YYYY-MM'). Every unit receives
 * a monthly strata-fee charge; units already carrying at least a full month of
 * arrears past the grace window get a late notice.
 */
export function runBilling(
  fees: UnitFee[],
  arrearsOf: ArrearsResolver,
  cfg: BillingConfig,
  referenceDate = new Date()
): BillRun {
  if (!/^\d{4}-\d{2}$/.test(cfg.period)) {
    throw new Error(`invalid period '${cfg.period}' — expected YYYY-MM`);
  }
  const [yearStr, monthStr] = cfg.period.split('-');
  const year = Number(yearStr);
  const month = MONTH_INDEX[monthStr];
  if (!month) throw new Error(`invalid period '${cfg.period}'`);

  const dueDay = Math.min(cfg.dueDay, 28);
  const effective = isoDaysFromBase(year, month, dueDay + cfg.graceDays);
  const effectiveTime = Date.parse(effective);
  const referenceTime = Date.parse(referenceDate.toISOString().slice(0, 10));

  const charges: UnitCharge[] = [];
  const lateNotices: LateNotice[] = [];

  for (const fee of fees) {
    if (!Number.isInteger(fee.monthlyBasis) || fee.monthlyBasis <= 0) {
      throw new Error(`invalid monthly fee for unit ${fee.unitId}`);
    }
    const referenceCode = fee.referenceCode ?? referenceFor(fee.unitId);
    charges.push({
      unitId: fee.unitId,
      amountBasis: fee.monthlyBasis,
      referenceCode,
      kind: 'strata_fee'
    });

    const arrears = arrearsOf(fee.unitId);
    if (arrears >= fee.monthlyBasis && referenceTime >= effectiveTime) {
      lateNotices.push({
        unitId: fee.unitId,
        arrearsBasis: arrears,
        lateFeeBasis: cfg.lateFlatBasis,
        reason: `Strata fee for ${cfg.period} is past due (arrears $${(arrears / 100).toFixed(2)})`,
        effectiveDate: effective
      });
    }
  }

  return {
    period: cfg.period,
    charges,
    lateNotices,
    totalChargedBasis: charges.reduce((s, c) => s + c.amountBasis, 0)
  };
}