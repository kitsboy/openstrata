/**
 * The sample book's health, month by month.
 *
 * Nothing here is stored: every point is recomputed from records the rest of the
 * app already shows. Deadlines come from the tracked list the gauge displays, AR
 * from the same dated charges the aging ladder reads, and Form K gaps from the
 * lot register's tenancy dates. A month end whose number nobody wrote down can
 * be rebuilt from the book at any time — which is what makes the trend checkable.
 *
 * Two consequences worth stating:
 *
 * 1. **A standing charge is aged from its own due date, so it is not overdue
 *    before then.** The parkade levy fell due in November 2025, months before
 *    this fiscal year, so it sits in the arrears term at every point — which is
 *    what happened.
 * 2. **Form K is counted from the two-week window, not from the missing flag
 *    alone.** A tenant who moved in on September 1 was not a gap in August; the
 *    lot 209 and 407 Ks only become overdue on September 15.
 */

import { age, daysBetween, periodOf, previousPeriod, summarise, type ChargeKind } from '../arrears';
import {
	FORM_K_DAYS,
	healthAt,
	trend,
	type HealthInputs,
	type HealthSnapshot,
	type TrendPoint
} from '../health';
import { charges } from './arrears';
import { building, units } from './building';
import type { DeadlineItem } from '../api/deadlines';

/**
 * The three deadlines the demo council tracks. Days left are computed from the
 * statement date rather than stored: the dates are the facts, and a count frozen
 * at build time is what let the old panel show 127 days for a date 92 days out.
 */
const TRACKED: Array<Pick<DeadlineItem, 'id' | 'kind' | 'title' | 'dueAt' | 'severity' | 'jurisdiction'>> = [
	{
		id: 'demo-epr',
		kind: 'epr',
		title: 'Energy Performance Report (EPR) filing',
		dueAt: '2026-12-31',
		severity: 'soon',
		jurisdiction: 'BC'
	},
	{
		id: 'demo-agm',
		kind: 'agm',
		title: 'Annual General Meeting',
		dueAt: '2026-10-31',
		severity: 'routine',
		jurisdiction: 'BC'
	},
	{
		id: 'demo-dep',
		kind: 'depreciation',
		title: 'Depreciation report renewal',
		dueAt: '2027-12-31',
		severity: 'routine',
		jurisdiction: 'BC'
	}
];

/** The tracked deadlines with days left counted to `asOf`. */
export function demoDeadlinesAt(asOf: string = building.asOf): DeadlineItem[] {
	return TRACKED.map((item) => ({ ...item, daysLeft: daysBetween(asOf, item.dueAt) }));
}

/** Money past its due date at `asOf`, with plan balances already excluded. */
export function arrearsAt(asOf: string = building.asOf): number {
	return summarise(age(charges(), asOf)).pastDue;
}

/** Lots whose Form K was already overdue at `asOf`. */
export function formKGapsAt(asOf: string = building.asOf): number {
	return units.filter(
		(unit) =>
			unit.formK === 'missing' && unit.tenantSince !== null && daysBetween(unit.tenantSince, asOf) >= FORM_K_DAYS
	).length;
}

/** The three inputs, read off the book at one statement date. */
export function inputsAt(asOf: string = building.asOf): HealthInputs {
	return {
		tracked: TRACKED,
		arPastDueCents: arrearsAt(asOf),
		formKGaps: formKGapsAt(asOf)
	};
}

/** The score at one statement date. */
export function healthNow(asOf: string = building.asOf): HealthSnapshot {
	return healthAt(inputsAt(asOf), asOf);
}

/** The last day of a period. */
function endOf(period: string): string {
	const [year, month] = period.split('-').map(Number);
	const last = new Date(Date.UTC(year, month, 0)).getUTCDate();
	return `${period}-${String(last).padStart(2, '0')}`;
}

/** The fiscal months already closed, oldest first, ending with the statement's own. */
export function trendPeriods(asOf: string = building.asOf, count = 6): string[] {
	const periods: string[] = [periodOf(asOf)];
	while (periods.length < count) periods.unshift(previousPeriod(periods[0]));
	return periods;
}

export interface MonthCharge {
	unitId: string;
	kind: ChargeKind;
	/** The day it fell due. */
	due: string;
	cents: number;
	/** `YYYY-MM` for a monthly fee, or for the late fee that follows one. */
	period?: string;
	daysLate: number;
}

export interface MonthFormK {
	unitId: string;
	tenantSince: string;
	/** Days past the bylaw's two-week window, never negative here. */
	daysPastWindow: number;
}

export interface MonthDetail {
	asOf: string;
	/** Every charge past its due date, oldest money first. Plan balances are out. */
	charges: MonthCharge[];
	/**
	 * The charges above that carry a due date inside the month itself — the second
	 * cut of the same list. In April this is empty and says something: every dollar
	 * the point counted was already owing before April opened.
	 */
	datedInMonth: MonthCharge[];
	/** The `datedInMonth` total, in cents. */
	datedInMonthCents: number;
	formK: MonthFormK[];
	/** The charges' own total, which is the arrears term the score read. */
	pastDueCents: number;
}

/**
 * What the score was reading at one statement date.
 *
 * The panel's whole claim is that its points can be checked, so a clicked month
 * has to show the records behind it: the dated charges that were past due and
 * the lots whose Form K window had closed. Both lists come from the same
 * functions the score used — `charges()` aged at this date, and the lot
 * register's own tenancy dates — so the detail and the number cannot drift.
 *
 * A charge on an agreed plan is not listed, for the same reason it is not in
 * the arrears term: it is a schedule, not a debt in default.
 *
 * The charge set is the book as the statement date holds it (`charges()`), aged
 * at this month end — the exact call `arrearsAt` makes. Building April's charges
 * from April's own records instead would list money that September's book does
 * not know about, and the detail would total differently from the point above
 * it. A charge dated after the month is not past due then, so it costs nothing
 * and is not listed.
 */
export function monthDetail(asOf: string = building.asOf): MonthDetail {
	const pastDue = charges()
		.filter((charge) => !charge.planCents && daysBetween(charge.due, asOf) > 0)
		.map((charge) => ({
			unitId: charge.unitId,
			kind: charge.kind,
			due: charge.due,
			cents: charge.cents,
			period: charge.period,
			daysLate: daysBetween(charge.due, asOf)
		}))
		.sort((a, b) => b.daysLate - a.daysLate || a.unitId.localeCompare(b.unitId));

	const formK = units
		.filter(
			(unit) =>
				unit.formK === 'missing' &&
				unit.tenantSince !== null &&
				daysBetween(unit.tenantSince, asOf) >= FORM_K_DAYS
		)
		.map((unit) => {
			const since = unit.tenantSince as string;
			return {
				unitId: unit.id,
				tenantSince: since,
				daysPastWindow: daysBetween(since, asOf) - FORM_K_DAYS
			};
		})
		.sort((a, b) => b.daysPastWindow - a.daysPastWindow || a.unitId.localeCompare(b.unitId));

	// A second cut of the same list, not a second book: the charges whose own date
	// falls in this month. A charge dated on the month end itself is in the list
	// only if it was already past due then, so the cut can never total more than
	// the number above it.
	const month = asOf.slice(0, 7);
	const datedInMonth = pastDue.filter((charge) => charge.due.slice(0, 7) === month);

	return {
		asOf,
		charges: pastDue,
		datedInMonth,
		datedInMonthCents: datedInMonth.reduce((sum, charge) => sum + charge.cents, 0),
		formK,
		pastDueCents: pastDue.reduce((sum, charge) => sum + charge.cents, 0)
	};
}

/** Six fiscal months of the sample book, oldest first. */
export function healthTrend(asOf: string = building.asOf, count = 6): TrendPoint[] {
	return trend(
		trendPeriods(asOf, count).map((period) => {
			const day = endOf(period);
			return { period, asOf: day, inputs: inputsAt(day) };
		})
	);
}
