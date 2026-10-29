/**
 * The receivables ladder as one printed page.
 *
 * The Receivables tab answers "who owes what, and how late is it". At a council
 * table the question is the same, but there is no scrollbar, no toggle and no
 * second click: the page has to stand on its own. This module is that page.
 *
 * Five rules, and each one is a decision:
 *
 * 1. **The ladder is the lots past due, not every lot that owes.** On the close,
 *    thirty-three of the forty lots owe next month's fee. That fee is real money,
 *    but it is not arrears, and printing its rows would bury the four lots a
 *    council actually acts on. The page prints the lots with something past due
 *    and states the rest of the book in one line beneath the table.
 *
 * 2. **The page still accounts for the whole book.** Its columns add to the
 *    past-due ladder; the line beneath adds every lot that owes only the next
 *    fee, and names the standing total. A reader can reconcile the paper to the
 *    ledger without a second sheet.
 *
 * 3. **A payment plan is not a rung on the ladder.** A levy being paid down on an
 *    agreed schedule sits outside the aging buckets, exactly as `age()` holds it,
 *    and is listed under the table. Its money stays in the sheet's `planned`
 *    total — the book is the book — but not in any bucket.
 *
 * 4. **The columns add to the printed total.** The footer is the sum of the rows
 *    on the page, never a second computation, and "current" is carried as its own
 *    fact: a past-due lot may also owe next month, and money owed is not money
 *    overdue.
 *
 * 5. **The sheet is the book, not the screen.** The tab can be narrowed to "past
 *    due only" or widened to every lot; the paper is built from every lot, so a
 *    control on another surface cannot leave it printing a partial total.
 *
 * The order is the caller's — `age()` sorts oldest money first, and this module
 * deliberately does not sort again, so there is one comparator rather than two
 * that can drift apart.
 */

import { BUCKETS, type Bucket } from './arrears';

/** One lot, as the ladder already reads it, plus what the paper names it by. */
export interface SheetLot {
	unitId: string;
	owner: string;
	buckets: Record<Bucket, number>;
	/** Everything aged, the next fee included. */
	total: number;
	/** The part past its due date. */
	pastDue: number;
	/** A plan balance, held outside the buckets. */
	planned: number;
	/** The oldest charge still standing, and how many days old it is. */
	oldest: string | null;
	oldestDays: number;
	/** Form F withheld: something is already due on this lot. */
	withheld: boolean;
}

export interface ArrearsSheetSource {
	lots: readonly SheetLot[];
	/** The day every age is counted to. Printed, because an aged sheet without it is meaningless. */
	asOf: string;
	/** Every lot in the building, so a lot with nothing is counted rather than merely missing. */
	totalLots: number;
}

export interface ArrearsSheet {
	asOf: string;
	/** Lots with money past due — the rows on the page, oldest first. */
	rows: SheetLot[];
	/** Every lot carrying a plan balance, listed under the table. */
	plans: SheetLot[];
	/** The rows' bucket totals, and the rows' total. */
	buckets: Record<Bucket, number>;
	total: number;
	/** The rows' past due — the whole book's, since a late lot is a row. */
	pastDue: number;
	/** The rows' money owed but not yet due. */
	current: number;
	/** Everything standing on every lot, late or not. */
	standing: number;
	/** The part of `standing` on lots with nothing late: their next fee. */
	notDue: number;
	/** Plan balances on every lot, whether or not it also sits on the ladder. */
	planned: number;
	/** Lots with something past due. */
	lateLots: number;
	/** Lots owing only the next fee. */
	notDueLots: number;
	/** Lots owing only a plan balance. */
	planOnlyLots: number;
	/** Lots with nothing on the books at all. */
	clearLots: number;
	/** Every lot in the building. */
	lots: number;
	/** The oldest past-due money on the page, or null when nothing is late. */
	oldest: { unitId: string; days: number } | null;
	/** Past-due money more than 90 days old, as a share of what is past due. */
	over90Share: number;
	/** Lots on the page whose Form F is withheld. */
	withheld: number;
}

const emptyBuckets = (): Record<Bucket, number> => ({
	current: 0,
	age30: 0,
	age60: 0,
	age90: 0,
	over90: 0
});

export function arrearsSheet(source: ArrearsSheetSource): ArrearsSheet {
	// Rule 1: a row is a lot with something late. Rule 5: every lot is offered to
	// this filter, whatever the screen's toggle is showing.
	const rows = source.lots.filter((lot) => lot.pastDue > 0);
	const notDueLots = source.lots.filter((lot) => lot.pastDue === 0 && lot.total > 0).length;
	const planOnlyLots = source.lots.filter((lot) => lot.total <= 0 && lot.planned > 0).length;
	// Rule 3: listed whenever there is a plan balance, even if the lot is also a row.
	const plans = source.lots.filter((lot) => lot.planned > 0);

	// Rule 4: one pass, and the footer is what it sums.
	const buckets = emptyBuckets();
	let total = 0;
	let pastDue = 0;
	let planned = 0;
	let standing = 0;
	let withheld = 0;
	let oldest: ArrearsSheet['oldest'] = null;

	for (const lot of source.lots) {
		standing += lot.total;
		planned += lot.planned;
	}

	for (const row of rows) {
		for (const bucket of BUCKETS) buckets[bucket] += row.buckets[bucket];
		total += row.total;
		pastDue += row.pastDue;
		if (row.withheld) withheld += 1;
		if (oldest === null || row.oldestDays > oldest.days) {
			oldest = { unitId: row.unitId, days: row.oldestDays };
		}
	}

	// Every lot falls in exactly one of these four groups, so the counts can be
	// added up to the building. A lot that owes the next fee *and* is paying a
	// plan belongs to the first group: the plan is a note, not a fourth category.
	const lateLots = rows.length;
	const countedLots = lateLots + notDueLots + planOnlyLots;
	const lots = Math.max(source.totalLots, countedLots);

	return {
		asOf: source.asOf,
		rows,
		plans,
		buckets,
		total,
		pastDue,
		current: total - pastDue,
		standing,
		notDue: standing - total,
		planned,
		lateLots,
		notDueLots,
		planOnlyLots,
		clearLots: lots - countedLots,
		lots,
		oldest,
		over90Share: pastDue > 0 ? buckets.over90 / pastDue : 0,
		withheld
	};
}
