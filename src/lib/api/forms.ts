/**
 * Form B/F helpers — issue a statutory certificate (`POST /api/v1/forms`) and
 * open the generated document (`GET /api/v1/forms/b|f/:unitId`).
 *
 * Under BC's Strata Property Act the certificate must be delivered within a
 * strict window, so the FormsPanel tracks each issuance against its statutory
 * deadline: request date → deliver-by (7 calendar days) → days left.
 */

import { apiFetch } from './client';
import { getToken } from './token';

export interface FormCertificate {
  kind: 'B' | 'F';
  unitId: string;
  state: 'issued' | 'withheld';
  dueDate: string;
  status: 'ok' | 'due' | 'overdue';
  balanceBasis: number;
  issuedAt: string;
  withheldReason?: string;
  disclosures: string[];
}

export interface IssueFormInput {
  kind: 'B' | 'F';
  unitId: string;
  requestedAt: string;
  balanceBasis: number;
  arrearsBasis?: number;
  crfBasis?: number;
}

/** Issue a Form B/F certificate (returns the generated certificate). */
export async function issueForm(input: IssueFormInput): Promise<FormCertificate> {
  return apiFetch<FormCertificate>('/api/v1/forms', {
    method: 'POST',
    body: input,
    token: getToken()
  });
}

/** Printable certificate URL (GET /forms/b|f/:unitId renders the document). */
export function formUrl(kind: 'B' | 'F', unitId: string): string {
  const base =
    typeof localStorage !== 'undefined' && localStorage.getItem('openstrata-api-base')
      ? localStorage.getItem('openstrata-api-base')!.replace(/\/+$/, '')
      : '';
  return `${base}/api/v1/forms/${kind}/${encodeURIComponent(unitId)}`;
}

/** Statutory delivery window (calendar days) for Form B/F per SPA ss.256–258. */
export const FORM_DELIVERY_DAYS = 7;

/** Compute the statutory deliver-by date (N calendar days after request). */
export function formDeliverBy(requestedAt: string): string {
  const d = new Date(requestedAt);
  d.setDate(d.getDate() + FORM_DELIVERY_DAYS);
  return d.toISOString().slice(0, 10);
}

/** Whole days between today and a date string (negative = overdue). */
export function daysUntil(date: string, now = new Date()): number {
  const target = new Date(`${date}T00:00:00`);
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target.getTime() - start.getTime()) / 86_400_000);
}
