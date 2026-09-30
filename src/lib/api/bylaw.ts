/**
 * Bylaw enforcement helpers — drive the CRT-proof state machine through its
 * five steps: complaint → notice → (14-day BLOCK_FINE_ACTIONS lock) → fine /
 * no-fine. The backend is stateless per call: each request submits the current
 * complaint facts and receives the validated next state.
 */

import { apiFetch } from './client';
import { getToken } from './token';

export type BreachKind = 'standard' | 'short_term_rental';

export interface ComplaintWire {
  id: string;
  unitId: string;
  bylawRef: string;
  breachKind: BreachKind;
  receivedAt: string;
  noticeIssuedAt?: string;
  noticeDeadline?: string;
  councilMinutesRef?: string;
  state: string;
  fineAmountBasis?: number;
}

export interface ComplaintInput {
  id: string;
  unitId: string;
  bylawRef: string;
  breachKind: BreachKind;
  receivedAt: string;
  evidence: boolean;
}

export async function bylawComplaint(input: ComplaintInput): Promise<ComplaintWire> {
  const res = await apiFetch<{ ok: boolean; complaint: ComplaintWire }>('/api/v1/bylaw/complaint', {
    method: 'POST',
    body: input,
    token: getToken()
  });
  return res.complaint;
}

export async function bylawIssueNotice(complaint: ComplaintWire, issuedAt: string): Promise<ComplaintWire> {
  const res = await apiFetch<{ ok: boolean; complaint: ComplaintWire }>('/api/v1/bylaw/complaint/notice', {
    method: 'POST',
    body: { complaint: JSON.stringify(complaint), issuedAt },
    token: getToken()
  });
  return res.complaint;
}

export async function bylawStatus(complaint: ComplaintWire, now: string): Promise<{
  allowed: boolean;
  blocked: string | null;
  inReviewWindow: boolean;
}> {
  const res = await apiFetch<{ ok: boolean; allowed: boolean; blocked: string | null; inReviewWindow: boolean }>(
    '/api/v1/bylaw/status',
    { method: 'POST', body: { complaint: JSON.stringify(complaint), now }, token: getToken() }
  );
  return res;
}

export async function bylawImposeFine(
  complaint: ComplaintWire,
  now: string,
  amountBasis: number,
  councilMinutesRef: string
): Promise<ComplaintWire> {
  const res = await apiFetch<{ ok: boolean; complaint: ComplaintWire }>('/api/v1/bylaw/fine', {
    method: 'POST',
    body: { complaint: JSON.stringify(complaint), now, amountBasis, councilMinutesRef },
    token: getToken()
  });
  return res.complaint;
}

export async function bylawNoFine(complaint: ComplaintWire, councilMinutesRef: string): Promise<ComplaintWire> {
  const res = await apiFetch<{ ok: boolean; complaint: ComplaintWire }>('/api/v1/bylaw/nofine', {
    method: 'POST',
    body: { complaint: JSON.stringify(complaint), councilMinutesRef },
    token: getToken()
  });
  return res.complaint;
}
