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

export interface PostedEntry {
  posted: true;
  seq: number;
  tallyRoot: string;
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
