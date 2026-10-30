/**
 * The parkade levy as its own page.
 *
 * The levy is a trust, not a fund: the special general meeting of 12 November
 * 2025 assessed $216,000 at three-quarters, the money was collected and spent on
 * one contract, and whatever is left belongs to that contract until the work is
 * done. On the funds tab it is a single card, which is enough for a glance and
 * not enough for a council answering an owner who asks where their share went.
 *
 * Four rules decide what the sheet may say:
 *
 * 1. **Assessed is points, not a typed total.** Every lot's share is its
 *    entitlement at $36 a point, and the sheet adds those shares up. A levy that
 *    printed a total nobody could rebuild from the lots would be a demand, not a
 *    statement.
 * 2. **Collected is assessed less what is still owed.** The owing figure comes
 *    from the lot records; the sheet never subtracts a "collected" field from
 *    anywhere else, so the two halves always add back.
 * 3. **The lots that still owe are named; the rest are counted.** Thirty-seven
 *    lots paid in full, and one line states their money rather than printing
 *    thirty-seven rows of zero. A lot on an agreed plan is named with its plan
 *    beside the balance, because a schedule is not arrears.
 * 4. **The trust has to come out even.** Cash in the trust plus what owners
 *    still owe is the work remaining, and the assessment less what has been paid
 *    to the contractor is the same figure. The sheet prints the difference, so a
 *    broken balance shows up on the page instead of being asserted away.
 *
 * What it does not print: a holdback. A holdback is withheld from a payment, and
 * these books record none — the basis says so rather than inventing a retention
 * the ledger cannot support.
 */

import { units, LEVY_POINT_CENTS, type Unit } from './demo/building';
import { books } from './demo/books';
import { LEVY_PLAN_CENTS } from './demo/arrears';

export interface LevyLotRow {
	unitId: string;
	owner: string;
	/** The lot's entitlement, the basis of its share. */
	points: number;
	/** The lot's share of the assessment, in cents. */
	assessedCents: number;
	/** What the lot has paid towards it. */
	paidCents: number;
	/** What is still owed. Zero for a settled lot. */
	owingCents: number;
	/** The agreed monthly amount, when the lot is on a plan. */
	planCents: number | null;
}

export interface LevySheet {
	/** The resolution that created the levy. */
	approved: string;
	/** The contract the trust exists to pay for. */
	project: string;
	/** The levy per entitlement point, in cents. */
	pointCents: number;
	assessedCents: number;
	collectedCents: number;
	owingCents: number;
	/** Paid to the contractor so far. */
	paidCents: number;
	cashCents: number;
	remainingCents: number;
	/** The lots that still owe anything, largest balance first. */
	lots: LevyLotRow[];
	/** Lots that have paid their share in full, and the money they paid. */
	settledLots: number;
	settledCents: number;
	/** `cash + owing` less `assessed less paid`; zero when the trust comes out even. */
	differenceCents: number;
	ok: boolean;
}

export interface LevySource {
	approved: string;
	project: string;
	assessedCents: number;
	spentCents: number;
	cashCents: number;
	remainingCents: number;
	unitRows: readonly Unit[];
	planCents: Readonly<Record<string, number>>;
	pointCents: number;
}

/** A lot's share: its entitlement at the levy's rate, in whole cents. */
export function lotShare(points: number, pointCents: number): number {
	return points * pointCents;
}

/** Every lot's share and payment, with the owing ones first. */
export function levyLots(source: LevySource): LevyLotRow[] {
	const rows = source.unitRows.map((unit) => {
		const assessed = lotShare(unit.entitlement, source.pointCents);
		const owing = Math.min(assessed, Math.max(0, unit.levyOwing));
		return {
			unitId: unit.id,
			owner: unit.owner,
			points: unit.entitlement,
			assessedCents: assessed,
			paidCents: assessed - owing,
			owingCents: owing,
			planCents: source.planCents[unit.id] ?? null
		};
	});
	// A page a council works from puts the money still owed at the top.
	return rows.sort(
		(a, b) => b.owingCents - a.owingCents || a.unitId.localeCompare(b.unitId)
	);
}

/**
 * The sheet, from the books as they stand.
 *
 * `assessed` is the sum of the lots' shares, never a separate total: the
 * resolution's $216,000 has to be the lots' arithmetic or the page is wrong. The
 * source's own figure is checked against it, and the difference the sheet prints
 * is the relation a reader would check with a calculator.
 */
export function levySheet(source: LevySource): LevySheet {
	const lots = levyLots(source);
	const assessedCents = lots.reduce((sum, row) => sum + row.assessedCents, 0);
	const owingCents = lots.reduce((sum, row) => sum + row.owingCents, 0);
	const collectedCents = assessedCents - owingCents;
	const owingLots = lots.filter((row) => row.owingCents > 0);
	const settled = lots.filter((row) => row.owingCents === 0);

	// Two routes to the same trust balance: what is in the bank plus what owners
	// still owe, against the assessment less what the contract has been paid.
	const inAndOwed = source.cashCents + owingCents;
	const assessedLessPaid = assessedCents - source.spentCents;

	return {
		approved: source.approved,
		project: source.project,
		pointCents: source.pointCents,
		assessedCents,
		collectedCents,
		owingCents,
		paidCents: source.spentCents,
		cashCents: source.cashCents,
		remainingCents: source.remainingCents,
		lots: owingLots,
		settledLots: settled.length,
		settledCents: settled.reduce((sum, row) => sum + row.paidCents, 0),
		differenceCents: inAndOwed - assessedLessPaid,
		ok:
			inAndOwed === assessedLessPaid &&
			assessedCents === source.assessedCents &&
			source.remainingCents === assessedCents - source.spentCents
	};
}

/** The sample book's levy, for the page and the tests. */
export function bookLevySheet(): LevySheet {
	return levySheet({
		approved: books.levy.approved,
		project: books.levy.project,
		assessedCents: books.levy.assessed,
		spentCents: books.levy.spent,
		cashCents: books.levy.cash,
		remainingCents: books.levy.remaining,
		unitRows: units,
		planCents: LEVY_PLAN_CENTS,
		pointCents: LEVY_POINT_CENTS
	});
}

export const BOOK_LEVY_SHEET = bookLevySheet();
