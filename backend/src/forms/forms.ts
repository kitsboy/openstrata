/**
 * Conveyancing forms — Form B (Information Certificate) and Form F (Certificate
 * of Payment), per the framework doc and the compliance KB:
 *   - Form B: deliver within 7 days of request (SPA s.256); discloses fees,
 *     arrears, pending CRT/court cases, CRF balance, EPR disclosure.
 *   - Form F: certifies $0 balance; if unit balance > $0 the certificate is
 *     WITHHELD and the sale is blocked until cleared (SPA s.257).
 *
 * Pure + deterministic: given unit ledger records + a request date, compute the
 * due date, the certificate STATE, and the disclosure payload. Deadline tracking
 * is exposed so a scheduler/API can raise alerts.
 */

export type FormKind = 'B' | 'F';

export type CertificateState =
  | 'issued'
  | 'withheld'; // only Form F: balance > 0

export type DeadlineStatus = 'due' | 'overdue' | 'ok';

export const FORM_B_DAYS = 7;

export interface UnitLedgerView {
  unitId: string;
  /** Outstanding balance in basis points (>0 = owes money). */
  balanceBasis: number;
  arrearsBasis: number;
  crfBasis?: number;
  pendingCases?: string[];
  eprDisclosed?: boolean; // Form B requires EPR disclosure if applicable
}

export interface FormRequest {
  kind: FormKind;
  unitId: string;
  requestedAt: string; // ISO date
  requester?: string; // lawyer / owner
}

export interface FormCertificate {
  kind: FormKind;
  unitId: string;
  state: CertificateState;
  dueDate: string; // requestedAt + 7 days (Form B) ; n/a for Form F
  status: DeadlineStatus;
  balanceBasis: number;
  issuedAt: string;
  withheldReason?: string;
  disclosures: string[];
}

const iso = (d: Date): string => d.toISOString().slice(0, 10);

/** Legal delivery deadline = request date + 7 days (Form B only). */
export function deliveryDeadline(requestedAt: string, days = FORM_B_DAYS): string {
  const d = new Date(requestedAt);
  d.setUTCDate(d.getUTCDate() + days);
  return iso(d);
}

export function deadlineStatus(dueDate: string, now: string): DeadlineStatus {
  if (now > dueDate) return 'overdue';
  const timeLeft = Date.parse(dueDate) - Date.parse(now.slice(0, 10));
  return timeLeft === 0 ? 'due' : 'ok';
}

function buildDisclosures(
  kind: FormKind,
  ledger: UnitLedgerView,
  state: CertificateState
): string[] {
  if (kind === 'B') {
    const list = [
      `Balance: $${(ledger.balanceBasis / 100).toFixed(2)}`,
      `Arrears: $${(ledger.arrearsBasis / 100).toFixed(2)}`
    ];
    if (ledger.crfBasis !== undefined) list.push(`CRF balance: $${(ledger.crfBasis / 100).toFixed(2)}`);
    if (ledger.pendingCases?.length) list.push(`Pending CRT/court cases: ${ledger.pendingCases.join(', ')}`);
    if (ledger.eprDisclosed === false) list.push('EPR 2026: not yet disclosed (Form B note)');
    return list;
  }
  // Form F
  return state === 'withheld'
    ? [`Balance > $0 — certificate WITHHELD, sale blocked`, `Amount owing: $${(ledger.balanceBasis / 100).toFixed(2)}`]
    : ['Balance $0.00 — certificate issued'];
}

/**
 * Generate a Form B or F for a unit. Form F returns `withheld` when the unit
 * ledger balance is > 0 (sale blocked). Form B computes the 7-day due date.
 */
export function generateForm(
  request: FormRequest,
  ledger: UnitLedgerView,
  now: string
): FormCertificate {
  if (request.kind === 'F' && request.unitId !== ledger.unitId) {
    // caller passes matching unit; defensive check for type safety only
    throw new Error('unitId mismatch between request and ledger view');
  }

  const state: CertificateState =
    request.kind === 'F' && ledger.balanceBasis > 0 ? 'withheld' : 'issued';
  const dueDate = request.kind === 'B' ? deliveryDeadline(request.requestedAt) : '';
  const status = request.kind === 'B' ? deadlineStatus(dueDate, now) : 'ok';

  return {
    kind: request.kind,
    unitId: request.unitId,
    state,
    dueDate,
    status,
    balanceBasis: ledger.balanceBasis,
    issuedAt: now,
    withheldReason:
      state === 'withheld' ? 'Unit balance greater than $0' : undefined,
    disclosures: buildDisclosures(request.kind, ledger, state)
  };
}