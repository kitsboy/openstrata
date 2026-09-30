/**
 * Treasury reconciliation — backend mirror of the Phase 2 front-end engine
 * (src/lib/reconcile.ts). Keeping the rule in both layers ensures the ledger
 * never auto-posts a guess: only a reference unique to one unit can auto-post.
 *
 * An inbound e-transfer that matches zero units -> unmatched (human review);
 * matches exactly one -> auto; matches more than one -> ambiguous (human).
 * Reconciliation never guesses: no reference, no match, or multi-match all
 * route back to a human.
 */

export interface UnitRefs {
  unitId: string;
  refs: string[];
}

export type ReconVerdict =
  | { status: 'auto'; unitId: string }
  | { status: 'ambiguous'; matches: string[] }
  | { status: 'unmatched' };

export type Reconciler = (reference: string, units: UnitRefs[]) => ReconVerdict;

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

export function reconcile(reference: string, units: UnitRefs[]): ReconVerdict {
  const ref = norm(reference);
  if (!ref) return { status: 'unmatched' };
  const hits = units.filter((u) =>
    u.refs.some((r) => r && ref.includes(norm(r)))
  );
  if (hits.length === 1) return { status: 'auto', unitId: hits[0].unitId };
  if (hits.length > 1) return { status: 'ambiguous', matches: hits.map((u) => u.unitId) };
  return { status: 'unmatched' };
}