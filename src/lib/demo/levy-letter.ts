/**
 * The parkade levy, as the letter one lot would be sent.
 *
 * The figures are the books' own: the assessment is the resolution's $216,000
 * divided by entitlement, what a lot still owes comes from its record, and the
 * trust position is the levy account on `/accounting`. Nothing here is typed
 * twice, so the letter cannot disagree with the statement the council reads.
 *
 * The deadline is the council meeting where a plan would be agreed — the
 * October 20 meeting the September minutes name for lot 207's lien vote. The
 * module drops a meeting that is not still ahead, so the letter never carries a
 * date that has passed.
 */

import { books } from './books';
import { building, units, LEVY_POINT_CENTS } from './building';
import { LEVY_DUE, LEVY_PLAN_CENTS } from './arrears';
import { levyLetter, type LevyLetter } from '../levy-letter';

/** The council meeting a plan is agreed at, as the September minutes leave it. */
export const LEVY_PLAN_MEETING = '2026-10-20';

const trust = {
	assessedCents: books.levy.assessed,
	collectedCents: books.levy.collected,
	paidCents: books.levy.spent,
	cashCents: books.levy.cash,
	remainingCents: books.levy.remaining
};

/**
 * One lot's letter, or null when the lot is not in the building.
 *
 * A settled lot still produces a letter object — the module reports it as
 * `settled` and refuses to issue — so a caller can tell "nothing owing" from
 * "no such lot".
 */
export function lotLevyLetter(
	unitId: string,
	asOf: string = building.asOf,
	meetingIso: string | null = LEVY_PLAN_MEETING
): LevyLetter | null {
	const unit = units.find((row) => row.id === unitId);
	if (!unit) return null;

	return levyLetter({
		unitId: unit.id,
		owner: unit.owner,
		points: unit.entitlement,
		pointCents: LEVY_POINT_CENTS,
		owingCents: unit.levyOwing,
		planCents: LEVY_PLAN_CENTS[unit.id] ?? null,
		dueIso: LEVY_DUE[unit.id] ?? asOf,
		asOf,
		approved: books.levy.approved,
		project: books.levy.project,
		trust,
		meetingIso
	});
}

/** Every lot a letter could be written to, in lot order. */
export function levyLetters(asOf: string = building.asOf): LevyLetter[] {
	return units
		.map((unit) => lotLevyLetter(unit.id, asOf))
		.filter((letter): letter is LevyLetter => letter !== null && letter.issuable);
}
