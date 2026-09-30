/**
 * Ziggy — BTC war-chest DCA planner (item #18).
 *
 * Pure planning logic: given a monthly CAD allocation the council approved for
 * the war chest, produce the purchase schedule (per-period BTC amount at the
 * current rate) and the statutory disclosure line (the war chest allocation is
 * a documented CRF/operating decision that must appear on Form B).
 *
 * Execution is intentionally NOT here: buys are broadcast through the
 * sovereign rails (`/payments/quote` + on-chain/LN when daemons are live) and
 * keys never leave council hardware wallets. This module is the deterministic
 * plan + record.
 */

import { assertValidAmount } from '../ledger/model.js';

export type DcaFrequency = 'weekly' | 'biweekly' | 'monthly';

export interface DcaConfig {
  /** Annual operating budget in basis points — used for the disclosure %. */
  annualOperatingBudgetBasis: number;
  /** CAD allocation per period, in basis points. */
  allocationPerPeriodBasis: number;
  frequency: DcaFrequency;
  /** Horizon in periods (e.g. 12 for a year of monthly buys). */
  periods: number;
  /** CAD/BTC spot rate used for the plan (0 → amounts cannot be computed). */
  cadPerBtc: number;
}

export interface DcaPlanPeriod {
  index: number;
  /** ISO date the purchase would execute. */
  date: string;
  /** CAD out (basis points). */
  cadBasis: number;
  /** BTC purchased at the plan rate (satoshis). */
  sats: number;
}

export interface DcaPlan {
  config: Pick<DcaConfig, 'frequency' | 'periods'>;
  allocationPerPeriodBasis: number;
  totalCadBasis: number;
  /** % of the annual operating budget the full plan represents (disclosure). */
  disclosurePct: number;
  periods: DcaPlanPeriod[];
}

/** Number of DCA windows per year for a frequency. */
export function periodsPerYear(frequency: DcaFrequency): number {
  if (frequency === 'weekly') return 52;
  if (frequency === 'biweekly') return 26;
  return 12;
}

/**
 * Build the plan starting from `startDate` (defaults to today). Period dates
 * step by the frequency; amounts are fixed per period.
 */
export function planDca(
  config: DcaConfig,
  startDate: string = new Date().toISOString().slice(0, 10)
): DcaPlan {
  assertValidAmount(config.allocationPerPeriodBasis, 'credit');
  assertValidAmount(config.annualOperatingBudgetBasis, 'credit');
  if (!Number.isInteger(config.periods) || config.periods <= 0) {
    throw new Error('periods must be a positive integer');
  }

  const stepDays = config.frequency === 'weekly' ? 7 : config.frequency === 'biweekly' ? 14 : 30;
  const satsPerPeriod =
    config.cadPerBtc > 0
      ? Math.floor((config.allocationPerPeriodBasis / 100 / config.cadPerBtc) * 100_000_000)
      : 0;

  const periods: DcaPlanPeriod[] = [];
  const start = new Date(`${startDate}T00:00:00Z`);
  for (let i = 0; i < config.periods; i++) {
    const date = new Date(start.getTime() + i * stepDays * 86_400_000);
    periods.push({
      index: i + 1,
      date: date.toISOString().slice(0, 10),
      cadBasis: config.allocationPerPeriodBasis,
      sats: satsPerPeriod
    });
  }

  const totalCadBasis = config.allocationPerPeriodBasis * config.periods;
  const disclosurePct = (totalCadBasis / config.annualOperatingBudgetBasis) * 100;

  return {
    config: { frequency: config.frequency, periods: config.periods },
    allocationPerPeriodBasis: config.allocationPerPeriodBasis,
    totalCadBasis,
    disclosurePct,
    periods
  };
}
