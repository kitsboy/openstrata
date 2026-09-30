/**
 * E-Transfer auto-reconciliation prototype — pure matching logic.
 *
 * Domain: auto-match inbound Interac e-transfer notifications to unit accounts
 * by parsing the payment message/reference against known unit identifiers.
 * Mirrors the "Auto-match payments to units via reference codes" module in the
 * Strata Tool map, and the wishlist item "E-transfer auto-reconciliation
 * prototype" in the Phase 2 workplan.
 *
 * Design notes:
 * - A transfer is AUTO-confident when its reference uniquely matches exactly
 *   one unit. If a reference matches several units, or matches none, it is
 *   flagged for a human to resolve — reconciliation should never guess.
 * - Amounts are advisory, not authoritative, for identity: a unit can pay
 *   more (overpayment/credit) or less (partial) and still be the same unit.
 */

export type MatchMode = 'brief' | 'full';

export interface ETransfer {
  /** Unique transfer id, e.g. a deposit reference or bank record id. */
  id: string;
  /** Payer display name as sent by the bank (best-effort). */
  from: string;
  /** Payment message / reference the payer attached (the matcher input). */
  message: string;
  /** Amount in CAD. */
  amount: number;
  /** YYYY-MM-DD deposit date. */
  date: string;
}

export interface UnitRef {
  id: string;
  /** Payer / occupant name hints for reference matching. */
  names: string[];
  /** Alternate identifiers the payer may type, e.g. '302' or 'unit 302'. */
  aliases: string[];
}

export type MatchKind = 'auto' | 'ambiguous' | 'unmatched';

export interface ReconcileResult {
  transferId: string;
  unitId: string | null;
  kind: MatchKind;
  /** Human-readable clues that drove the decision (for review dumps). */
  reason: string;
}

export interface ReconcileOptions {
  mode?: MatchMode;
}

/** Normalize a reference string for comparison (lowercase, strip punctuation). */
export function normalizeReference(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function unitSearchKeys(unit: UnitRef): string[] {
  const out = new Set<string>();
  // Full unit id "302", then the numeric tail only "302" regardless of prefix.
  const cleanId = normalizeReference(unit.id);
  out.add(cleanId);
  for (const a of unit.aliases) out.add(normalizeReference(a));
  for (const n of unit.names) out.add(normalizeReference(n));
  return [...out].filter((k) => k.length >= 1);
}

function containsAny(ref: string, keys: string[]): boolean {
  return keys.some((k) => ref.length >= 1 && ref.includes(k));
}

/**
 * Match one inbound e-transfer to a unit.
 *
 * `mode: 'brief'` only reads the payment message; `full` also reads the payer
 * name (owner/occupant). Returns an `ambiguous` result when the reference
 * points at more than one unit or matches none.
 */
export function matchTransfer(tx: ETransfer, units: UnitRef[], options: ReconcileOptions = {}): ReconcileResult {
  const mode = options.mode ?? 'brief';
  const ref = normalizeReference(tx.message);
  const payer = normalizeReference(tx.from);

  const candidates: Array<{ unit: UnitRef; hits: number }> = [];

  for (const unit of units) {
    const keys = unitSearchKeys(unit);
    const refHit = ref.length >= 1 && containsAny(ref, keys);
    const payerHit = mode === 'full' && payer.length >= 1 && containsAny(payer, unit.names.map(normalizeReference));
    if (refHit || payerHit) {
      candidates.push({ unit, hits: (refHit ? 1 : 0) + (payerHit ? 1 : 0) });
    }
  }

  if (candidates.length === 0) {
    return { transferId: tx.id, unitId: null, kind: 'unmatched', reason: 'No unit matching the reference was found.' };
  }

  // Rank by the number of independent clues, then pick the top. A transfer is
  // only confident when the top candidate is strictly unique and unmistakable.
  candidates.sort((a, b) => b.hits - a.hits);

  if (candidates.length === 1 && candidates[0].hits >= 1) {
    return {
      transferId: tx.id,
      unitId: candidates[0].unit.id,
      kind: 'auto',
      reason: `Matched unit ${candidates[0].unit.id} by reference.`
    };
  }

  // Distinct references matched several different units, or the strongest
  // reference was not unique enough — hand this to a human.
  return {
    transferId: tx.id,
    unitId: null,
    kind: 'ambiguous',
    reason: `Reference matched ${candidates.length} units (${candidates.map((c) => c.unit.id).join(', ')}).`
  };
}

/**
 * Run a batch of transfers against the unit list and bucket them by how much
 * human attention they need. Pure — no side effects — so it is unit-testable.
 */
export function reconcileTransfers(
  transfers: ETransfer[],
  units: UnitRef[],
  options: ReconcileOptions = {}
): { auto: ReconcileResult[]; ambiguous: ReconcileResult[]; unmatched: ReconcileResult[] } {
  const auto: ReconcileResult[] = [];
  const ambiguous: ReconcileResult[] = [];
  const unmatched: ReconcileResult[] = [];

  for (const tx of transfers) {
    const result = matchTransfer(tx, units, options);
    if (result.kind === 'auto') auto.push(result);
    else if (result.kind === 'ambiguous') ambiguous.push(result);
    else unmatched.push(result);
  }

  return { auto, ambiguous, unmatched };
}