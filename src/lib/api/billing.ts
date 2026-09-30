/**
 * Billing helper — run one monthly billing cycle (`POST /api/v1/billing/run`).
 * Computes charges + late notices, then posts every charge to the unit's AR
 * ledger account so the close flow is wired end to end.
 */

import { apiFetch } from './client';
import { getToken } from './token';

export interface UnitFeeInput {
  unitId: string;
  monthlyBasis: number;
}

export interface BillingRunInput {
  period: string; // 'YYYY-MM'
  fees: UnitFeeInput[];
  dueDay: number;
  graceDays: number;
  lateFeeBasis: number;
  arrears: Record<string, number>;
  asOf?: string;
}

export interface BillRun {
  period: string;
  charges: Array<{ unitId: string; amountBasis: number; referenceCode: string; kind: string }>;
  lateNotices: Array<{ unitId: string; arrearsBasis: number; lateFeeBasis: number; reason: string; effectiveDate: string }>;
  totalChargedBasis: number;
}

export interface BillingRunResult {
  run: BillRun;
  postedCount: number;
  posted: Array<{ unitId: string; seq: number }>;
}

export async function runBillingCycle(input: BillingRunInput): Promise<BillingRunResult> {
  return apiFetch<{ ok: boolean } & BillingRunResult>('/api/v1/billing/run', {
    method: 'POST',
    body: input,
    token: getToken()
  });
}
