/**
 * Ledger endpoint helpers — read the council's trust-fund balances from the
 * hash-chained ledger (`GET /api/v1/ledger/balance`) and post entries as a
 * treasurer (`POST /api/v1/ledger/post`). The tenant (`community`) is derived
 * from the bearer token; callers never send it.
 */

import { apiFetch } from './client';
import { getToken } from './token';

export interface LedgerHeadTally {
  seq: number;
  amountBasis: number;
  kind: 'credit' | 'debit';
  type: string;
  description?: string | null;
  tallyRoot: string;
  createdAt: string;
}

export interface LedgerBalance {
  balanceBasis: number;
  entryCount: number;
  headTally: LedgerHeadTally[];
}

/** Convenience summary across the three statutory trust funds. */
export interface LedgerSummary {
  operating: LedgerBalance | null;
  crf: LedgerBalance | null;
  specialLevy: LedgerBalance | null;
}

export async function fetchLedgerBalance(fund?: string): Promise<LedgerBalance> {
  const token = getToken();
  const query = fund ? `?fund=${encodeURIComponent(fund)}` : '';
  return apiFetch<LedgerBalance>(`/api/v1/ledger/balance${query}`, { token });
}

/** Fetch operating + CRF + special-levy balances in parallel (dashboard use). */
export async function fetchLedgerSummary(): Promise<LedgerSummary> {
  const [operating, crf, specialLevy] = await Promise.all([
    fetchLedgerBalance('operating').catch(() => null),
    fetchLedgerBalance('crf').catch(() => null),
    fetchLedgerBalance('special_levy').catch(() => null)
  ]);
  return { operating, crf, specialLevy };
}

export interface SeriesPoint {
  month: string; // 'YYYY-MM'
  incomeBasis: number;
  expenseBasis: number;
  netBasis: number;
}

/** Monthly income/expense rollup for a fund (dashboard + pitch charts). */
export async function fetchLedgerSeries(fund = 'operating', months = 6): Promise<SeriesPoint[]> {
  const token = getToken();
  const res = await apiFetch<{ fund: string; points: SeriesPoint[] }>(
    `/api/v1/ledger/series?fund=${encodeURIComponent(fund)}&months=${months}`,
    { token }
  );
  return res.points;
}

export interface LedgerEntry {
  seq: number;
  amountBasis: number;
  kind: 'credit' | 'debit';
  type: string;
  description: string;
  referenceCode: string;
  prevTally: string;
  tallyRoot: string;
  postedAt: string;
}

/** The verified hash chain for a fund (ledger explorer + CSV export). */
export async function fetchLedgerEntries(fund: string): Promise<LedgerEntry[]> {
  const token = getToken();
  const res = await apiFetch<{ ok: boolean; fund: string; entries: LedgerEntry[] }>(
    `/api/v1/ledger/entries?fund=${encodeURIComponent(fund)}`,
    { token }
  );
  return res.entries;
}

export interface PostedEntry {
  posted: true;
  seq: number;
  tallyRoot: number;
}

/** POST a credit/debit. Requires a treasurer/admin token. */
export async function postLedgerEntry(input: {
  fund: string;
  amountBasis: number;
  kind: 'credit' | 'debit';
  type: string;
  description?: string;
  referenceCode?: string;
  reconRef?: string;
}): Promise<PostedEntry> {
  return apiFetch<PostedEntry>('/api/v1/ledger/post', {
    method: 'POST',
    body: input,
    token: getToken()
  });
}
