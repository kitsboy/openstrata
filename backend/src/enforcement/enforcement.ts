/**
 * BylawEnforcement — CRT-proof bylaw enforcement state machine.
 *
 * Mirrors the five-step workflow in src/lib/compliance.ts:
 *   1. Day 1        receive written complaint (evidence required)
 *   2. Day 2-5      issue Notice of Complaint (>= 14-day response window)
 *   3. >=14 days    REVIEW WINDOW — system must lock fine actions
 *                   (BLOCK_FINE_ACTIONS). Fining earlier = automatic CRT overturn.
 *   4. Decision     council decision + minutes required (QUORUM + MINUTES)
 *   5. Fine         <= $200 standard / <= $1,000 STR-Airbnb; posted to unit ledger
 *
 * Pure + deterministic; all enforcement rules (locks, caps) live here so both
 * the API and any future UI enforce the same law.
 */

export type BylawState =
  | 'received'
  | 'notice_issued'
  | 'reviewing'
  | 'decided_fine'
  | 'decided_no_fine'
  | 'fine_posted'
  | 'closed';

export type BreachKind = 'standard' | 'short_term_rental';

export interface Complaint {
  id: string;
  unitId: string;
  bylawRef: string;
  breachKind: BreachKind;
  receivedAt: string; // ISO date
  noticeIssuedAt?: string;
  noticeDeadline?: string; // noticeIssuedAt + 14 days
  councilMinutesRef?: string; // required before fine
  state: BylawState;
  fineAmountBasis?: number; // last imposed fine
}

/** Statutory fine caps in basis points. */
export const FINE_CAP_BP = {
  standard: 200 * 100, // $200.00
  short_term_rental: 1000 * 100 // $1,000.00 (per Standard Bylaws STR)
} as const;

export const MIN_REVIEW_DAYS = 14;

export function newComplaint(input: {
  id: string;
  unitId: string;
  bylawRef: string;
  breachKind: BreachKind;
  receivedAt: string;
  evidence: boolean;
}): Complaint {
  if (!input.evidence) {
    throw new Error('written complaint requires evidence (photo/audio/log)');
  }
  if (!input.unitId || !input.bylawRef) {
    throw new Error('complaint requires unit + breached bylaw reference');
  }
  return {
    id: input.id,
    unitId: input.unitId,
    bylawRef: input.bylawRef,
    breachKind: input.breachKind,
    receivedAt: input.receivedAt,
    state: 'received'
  };
}

export function issueNotice(c: Complaint, issuedAt: string): Complaint {
  if (c.state !== 'received') throw new Error(`cannot issue notice from '${c.state}'`);
  const d = new Date(issuedAt);
  d.setUTCDate(d.getUTCDate() + MIN_REVIEW_DAYS);
  return {
    ...c,
    state: 'notice_issued',
    noticeIssuedAt: issuedAt,
    noticeDeadline: d.toISOString().slice(0, 10)
  };
}

export function startReview(c: Complaint): Complaint {
  if (c.state !== 'notice_issued') throw new Error('notice must be issued first');
  return { ...c, state: 'reviewing' };
}

/** Invariant 3 — BLOCK_FINE_ACTIONS: fine is blocked until the review window passes. */
export function canImposeFine(c: Complaint, now: string): {
  allowed: boolean;
  blocked: 'BLOCK_FINE_ACTIONS' | 'no-notice' | 'already-decided' | null;
  inReviewWindow: boolean;
} {
  if (c.state === 'received') return { allowed: false, blocked: 'no-notice', inReviewWindow: false };
  const deadline = c.noticeDeadline ?? '';
  if (!deadline) return { allowed: false, blocked: 'no-notice', inReviewWindow: false };
  const expired = now >= deadline;
  if (!expired) return { allowed: false, blocked: 'BLOCK_FINE_ACTIONS', inReviewWindow: true };
  return { allowed: true, blocked: null, inReviewWindow: false };
}

/**
 * Invariants 4+5: a fine requires (a) the review window elapsed, (b) an explicit
 * council decision recorded in minutes, and (c) amount <= statutory cap.
 */
export function imposeFine(
  c: Complaint,
  now: string,
  input: { councilMinutesRef: string; amountBasis: number }
): { ok: true; complaint: Complaint } | { ok: false; reason: string } {
  if (!input.councilMinutesRef) {
    return { ok: false, reason: 'REQUIRE_QUORUM_AND_MINUTES: council decision must be in minutes' };
  }
  const window = canImposeFine(c, now);
  if (window.blocked === 'BLOCK_FINE_ACTIONS') {
    return { ok: false, reason: `BLOCK_FINE_ACTIONS until ${c.noticeDeadline}` };
  }
  if (window.blocked) return { ok: false, reason: `cannot fine in state '${c.state}'` };

  const cap = FINE_CAP_BP[c.breachKind];
  if (input.amountBasis > cap) {
    return { ok: false, reason: `fine exceeds statutory cap $${cap / 100} (${c.breachKind})` };
  }
  if (input.amountBasis <= 0) return { ok: false, reason: 'fine must be positive' };

  return {
    ok: true,
    complaint: {
      ...c,
      state: 'fine_posted',
      councilMinutesRef: input.councilMinutesRef,
      fineAmountBasis: input.amountBasis
    }
  };
}

/** Council votes not to fine -> record the decision and close the case. */
export function decideNoFine(c: Complaint, councilMinutesRef: string): Complaint {
  if (c.state !== 'reviewing') {
    throw new Error(`cannot decide no-fine from '${c.state}'`);
  }
  if (!councilMinutesRef) throw new Error('REQUIRE_MINUTES: no-fine decision must be in minutes');
  return { ...c, state: 'decided_no_fine', councilMinutesRef };
}