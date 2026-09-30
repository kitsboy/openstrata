/**
 * Ziggy — Treasury state machine.
 *
 * Contract (framework doc: invoice → CRF cap → PSBT → multisig → reconcile);
 * execution rules:
 *   1. CRF HARD BLOCK: no capital spend from CRF below the mandatory reserve
 *      (default 10% of the annual operating budget). Never bypass it.
 *   2. EXPENSE VERIFY: every payout pairs to a PO/line item; side-by-side
 *      review is required before any signature (never auto-sign).
 *   3. RECONCILE-NO-GUESS: inbound e-transfers auto-post only when a reference
 *      is unique to ONE unit; ambiguous/unmatched go to a human (mirrors
 *      front-end src/lib/reconcile.ts so both layers agree).
 */

import { createHash } from 'node:crypto';

import { assertValidAmount } from '../ledger/model.js';

export interface Budget {
  fiscalYear: string;
  totalOperatingBasis: number; // annual operating budget in basis points
  crfMandatoryPct: number; // default 10
}

export interface SpendRequest {
  amountBasis: number; // positive
  fundCode: string; // 'crf' | 'operating' | `special_levy:${string}`
  poRef: string;
  category: string;
  description?: string;
}

export type SpendVerdict =
  | { allow: true; reason: string; pulledFrom: string; basis: number }
  | { allow: false; reason: string; blocked: 'crf-floor' | 'expense-unverified' | 'no-funds' };

export function crfFloor(req: Budget): number {
  if (!Number.isFinite(req.crfMandatoryPct) || req.crfMandatoryPct <= 0) {
    return 0;
  }
  assertValidAmount(req.totalOperatingBasis, 'credit');
  return Math.ceil((req.totalOperatingBasis * req.crfMandatoryPct) / 100);
}

export function checkCrfCap(
  budget: Budget,
  currentCrfBasis: number,
  spendBasis: number
): { breached: boolean; floorBasis: number; allowedPostBasis: number } {
  const floor = crfFloor(budget);
  const postCrf = currentCrfBasis - spendBasis;
  const breached = postCrf < floor;
  return { breached, floorBasis: floor, allowedPostBasis: breached ? Math.max(currentCrfBasis - floor, 0) : spendBasis };
}

/**
 * Treasury decision. NOTE: this is the authorization gate, not the final
 * execution. Allow = internally valid; the council still must approve via a
 * real multisig before Ziggy broadcasts (PSBT step is explicitly later).
 */
export function authorizeSpend(
  budget: Budget,
  accountBalances: Record<string, number>,
  request: SpendRequest
): SpendVerdict {
  if (!request.poRef) {
    return { allow: false, reason: 'No purchase-order reference — cannot verify', blocked: 'expense-unverified' };
  }
  if (!request.category) {
    return { allow: false, reason: 'Missing expense category', blocked: 'expense-unverified' };
  }
  assertValidAmount(request.amountBasis, 'credit');
  const fundBalance = accountBalances[request.fundCode] ?? 0;
  if (fundBalance < request.amountBasis) {
    return { allow: false, reason: 'Insufficient fund balance', blocked: 'no-funds' };
  }
  if (request.fundCode === 'crf') {
    const cap = checkCrfCap(budget, fundBalance, request.amountBasis);
    if (cap.breached) {
      return {
        allow: false,
        reason: `CRF hard block: posting would drop CRF below the mandatory floor (${cap.floorBasis} bp)`,
        blocked: 'crf-floor'
      };
    }
  }
  return {
    allow: true,
    reason: `Approved for internal review (PO ${request.poRef}); requires ${request.fundCode} signature`,
    pulledFrom: request.fundCode,
    basis: request.amountBasis
  };
}

/** Deterministic duplicate-detection fingerprint for an invoice. */
export function invoiceFingerprint(
  number: string,
  vendor: string,
  amountBasis: number
): string {
  return createHash('sha256')
    .update(JSON.stringify({ number, vendor, amountBasis }))
    .digest('hex')
    .slice(0, 16);
}

export interface PendingTransfer {
  id: string; // e.g. 'ET-1046'
  reference: string; // extracted reference-code token
}

/** Auto-post decision for a single inbound transfer (mirrors front-end). */
export function reconcileTransfer(
  reference: string,
  possibleUnitRefs: Array<{ unitId: string; refs: string[] }>,
  _pending: PendingTransfer
):
  | { status: 'auto'; unitId: string }
  | { status: 'ambiguous'; matches: string[] }
  | { status: 'unmatched' } {
  const yes = possibleUnitRefs.filter((u) => matchesRef(reference, u.refs));
  if (yes.length === 1) return { status: 'auto', unitId: yes[0].unitId };
  if (yes.length > 1) return { status: 'ambiguous', matches: yes.map((u) => u.unitId) };
  return { status: 'unmatched' };
}

function matchesRef(reference: string, refs: string[]): boolean {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const ref = norm(reference);
  if (!ref) return false;
  return refs.some((r) => r && ref.includes(norm(r)));
}