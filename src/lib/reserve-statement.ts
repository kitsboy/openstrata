/**
 * The reserve contribution, owner by owner.
 *
 * The budget sets the CRF contribution as one line — $43,200 a year, $0.60 a
 * point a month. The depreciation report recommends $48,000. The reserve plan
 * projects both, and the AGM votes on the gap. What no page said is the sentence
 * an owner reads before voting: *my lot pays this much, the report says it should
 * pay that much*. This module is that statement, with four rules:
 *
 * 1. **A lot's share is its entitlement, never an equal split.** Forty lots hold
 *    6,000 points between them; a studio with 98 points does not owe what a
 *    three-bedroom with 270 does, and an equal split would misstate every row.
 *
 * 2. **The budget column is the rate the budget actually charges.** It is built
 *    from the lots and the CRF rate, not typed: the rows add to the budget's own
 *    line, so a change to the rate moves the sheet and the budget together.
 *
 * 3. **The recommendation is allocated without losing a cent.** Splitting
 *    $48,000 across 6,000 points is exact here ($8.00 a point a year), but the
 *    allocator rounds by largest remainder for any figure that is not, so the
 *    rows always add to the report's total rather than to a rounded approximation
 *    of it. A cent that goes missing is a cent a reader cannot find.
 *
 * 4. **What the fund has actually received is on the same page.** The statement
 *    prints the year to date, the CRF portion still in arrears and the first year
 *    the reserve plan runs short, so the vote is taken on the fund's real
 *    position and not on a rate alone.
 *
 * Label-free: names, points and the report's recommendation are supplied.
 */

export interface ReserveLot {
	id: string;
	owner: string;
	entitlement: number;
}

export interface ReserveRow {
	unitId: string;
	owner: string;
	entitlement: number;
	/** What this lot is budgeted to contribute this fiscal year. */
	budgetAnnualCents: number;
	/** Its share of the report's recommended contribution. */
	recommendedAnnualCents: number;
	/** Recommendation less budget: positive means the lot is under-contributing. */
	differenceCents: number;
}

export interface ReserveStatementInput {
	/** Every lot, in the order the register prints them. */
	lots: readonly ReserveLot[];
	/** The budget's CRF rate: cents a point a month. */
	crfPointCents: number;
	/** The depreciation report's recommended contribution for the year. */
	recommendedAnnualCents: number;
	/** Months of the fiscal year the books cover. */
	monthsElapsed: number;
	/** The CRF contributions the books have actually received. */
	receivedCents: number;
	/** The CRF portion of what owners still owe. */
	arrearsCents: number;
	report: { firm: string; dated: string; nextDue: string };
	/** The first year the reserve plan runs the fund past zero, if it does. */
	shortfall: { year: string; cents: number } | null;
}

export interface ReserveStatement {
	rows: ReserveRow[];
	points: number;
	budgetAnnualCents: number;
	recommendedAnnualCents: number;
	differenceCents: number;
	/** The two rates written as cents a point a year, for the basis sentence. */
	budgetPerPointAnnualCents: number;
	recommendedPerPointAnnualCents: number;
	monthsElapsed: number;
	receivedCents: number;
	arrearsCents: number;
	report: ReserveStatementInput['report'];
	shortfall: ReserveStatementInput['shortfall'];
	/** The recommendation is above what the budget funds. */
	underFunded: boolean;
}

/**
 * Split `totalCents` across lots by entitlement, largest remainder first.
 *
 * The remainder goes to the lots with the largest fractional share, ties broken
 * by lot id so the same books always produce the same row — a statement that
 * moved a cent between two lots on a re-render would be uncheckable. A building
 * with no points cannot divide, and returns zeroes rather than NaN.
 */
export function shareByEntitlement(
	totalCents: number,
	lots: readonly Pick<ReserveLot, 'id' | 'entitlement'>[]
): number[] {
	const points = lots.reduce((sum, lot) => sum + lot.entitlement, 0);
	if (points <= 0 || totalCents === 0) return lots.map(() => 0);

	const exact = lots.map((lot) => (totalCents * lot.entitlement) / points);
	const shares = exact.map((value) => Math.floor(value));
	let remainder = totalCents - shares.reduce((sum, value) => sum + value, 0);

	const order = exact
		.map((value, index) => ({ index, fraction: value - Math.floor(value) }))
		.sort(
			(a, b) =>
				b.fraction - a.fraction || lots[a.index].id.localeCompare(lots[b.index].id)
		);

	for (let index = 0; remainder > 0; index += 1) {
		shares[order[index % order.length].index] += 1;
		remainder -= 1;
	}

	return shares;
}

export function reserveStatement(input: ReserveStatementInput): ReserveStatement {
	const points = input.lots.reduce((sum, lot) => sum + lot.entitlement, 0);
	const recommended = shareByEntitlement(input.recommendedAnnualCents, input.lots);

	const rows: ReserveRow[] = input.lots.map((lot, index) => {
		// The budget's own arithmetic: points × the CRF rate × twelve months.
		const budgetAnnualCents = lot.entitlement * input.crfPointCents * 12;
		const recommendedAnnualCents = recommended[index] ?? 0;
		return {
			unitId: lot.id,
			owner: lot.owner,
			entitlement: lot.entitlement,
			budgetAnnualCents,
			recommendedAnnualCents,
			differenceCents: recommendedAnnualCents - budgetAnnualCents
		};
	});

	const budgetAnnualCents = rows.reduce((sum, row) => sum + row.budgetAnnualCents, 0);
	const recommendedAnnualCents = rows.reduce(
		(sum, row) => sum + row.recommendedAnnualCents,
		0
	);

	return {
		rows,
		points,
		budgetAnnualCents,
		recommendedAnnualCents,
		differenceCents: recommendedAnnualCents - budgetAnnualCents,
		budgetPerPointAnnualCents: input.crfPointCents * 12,
		recommendedPerPointAnnualCents:
			points > 0 ? Math.round(input.recommendedAnnualCents / points) : 0,
		monthsElapsed: input.monthsElapsed,
		receivedCents: input.receivedCents,
		arrearsCents: input.arrearsCents,
		report: input.report,
		shortfall: input.shortfall,
		// The comparison is the report's figure against the budget's, not the rows'
		// allocation: a building with no points cannot divide the recommendation,
		// but the gap between what is funded and what is recommended still exists.
		underFunded: input.recommendedAnnualCents > budgetAnnualCents
	};
}
