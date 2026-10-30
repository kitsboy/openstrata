/**
 * The fee schedule: every lot's monthly fee, read off the budget's own rates.
 *
 * The building's fee is one sentence on the units page — entitlement times the
 * rate — and a council approves it against the budget every year. This is the
 * page that shows all forty at once, so the total a council votes on is the same
 * total the budget carries.
 *
 * Four rules:
 *
 * 1. **The fee is the lot's points at the budget's rate**, never a per-lot
 *    figure. The operating and reserve parts are computed from their own rates
 *    and the fee is their sum, so the split can never fail to add back.
 * 2. **The annual column is the monthly fee twelve times.** The fiscal year is
 *    twelve monthly runs; a sheet that multiplied something else would disagree
 *    with the budget's fee line.
 * 3. **Every lot prints.** The tenanted lots sort first because the register is
 *    where a council starts, but the order does not change the total and the
 *    other thirty-two lots are not dropped.
 * 4. **The totals are the rows added up**, so a reader who adds the page lands on
 *    the budget's $27,000 a month and $324,000 a year.
 */

import {
	CRF_POINT_CENTS,
	FEE_POINT_CENTS,
	OP_POINT_CENTS,
	monthlyFeeCents,
	units,
	type Unit
} from './demo/building';

export interface FeeRates {
	/** What the lot pays for a point, in cents — 450 in the adopted budget. */
	monthlyCents: number;
	operatingCents: number;
	crfCents: number;
	/** Monthly runs in the fiscal year. */
	months: number;
}

export const BOOK_FEE_RATES: FeeRates = {
	monthlyCents: FEE_POINT_CENTS,
	operatingCents: OP_POINT_CENTS,
	crfCents: CRF_POINT_CENTS,
	months: 12
};

export interface FeeRow {
	unitId: string;
	owner: string;
	/** The lot's entitlement in points, the basis of its fee. */
	points: number;
	monthlyCents: number;
	operatingCents: number;
	crfCents: number;
	annualCents: number;
	/** True when a tenant is on file, which is where the register starts. */
	tenanted: boolean;
	tenant: string | null;
}

export interface FeeSchedule {
	/** Tenanted lots first, then by lot number. */
	rows: FeeRow[];
	lots: number;
	points: number;
	monthlyCents: number;
	operatingCents: number;
	crfCents: number;
	annualCents: number;
	tenanted: number;
	/** True when every row's parts add back and the rate is the two parts. */
	ok: boolean;
}

/** One lot's row, from its entitlement and the budget's rates. */
export function feeRow(unit: Unit, rates: FeeRates): FeeRow {
	const operatingCents = unit.entitlement * rates.operatingCents;
	const crfCents = unit.entitlement * rates.crfCents;
	const monthlyCents = operatingCents + crfCents;
	return {
		unitId: unit.id,
		owner: unit.owner,
		points: unit.entitlement,
		monthlyCents,
		operatingCents,
		crfCents,
		annualCents: monthlyCents * rates.months,
		tenanted: Boolean(unit.tenant && unit.tenantSince),
		tenant: unit.tenant ?? null
	};
}

/** The whole building's schedule. */
export function feeSchedule(
	unitRows: readonly Unit[],
	rates: FeeRates = BOOK_FEE_RATES
): FeeSchedule {
	const rows = unitRows
		.map((unit) => feeRow(unit, rates))
		.sort((a, b) => Number(b.tenanted) - Number(a.tenanted) || a.unitId.localeCompare(b.unitId));

	const total = (pick: (row: FeeRow) => number) => rows.reduce((sum, row) => sum + pick(row), 0);
	const points = total((row) => row.points);
	const monthlyCents = total((row) => row.monthlyCents);

	return {
		rows,
		lots: rows.length,
		points,
		monthlyCents,
		operatingCents: total((row) => row.operatingCents),
		crfCents: total((row) => row.crfCents),
		annualCents: total((row) => row.annualCents),
		tenanted: rows.filter((row) => row.tenanted).length,
		ok:
			rows.every(
				(row) =>
					row.operatingCents + row.crfCents === row.monthlyCents &&
					row.monthlyCents === monthlyFeeCents(row.points) &&
					row.annualCents === row.monthlyCents * rates.months
			) &&
			rates.monthlyCents === rates.operatingCents + rates.crfCents
	};
}

/** The sample building at the adopted budget. */
export function bookFeeSchedule(): FeeSchedule {
	return feeSchedule(units);
}

export const BOOK_FEE_SCHEDULE = bookFeeSchedule();
