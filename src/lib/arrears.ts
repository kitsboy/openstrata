/**
 * Aged receivables — how old the money is, not just how much.
 *
 * A receivables total hides the only thing a council can act on: a $600 balance
 * that is four days old and a $600 balance that is four months old are different
 * problems, and only the second one belongs in a lien conversation. This module
 * ages every charge from the day it fell due.
 *
 * Three decisions carry the rules:
 *
 * 1. **Ages come from due dates, not from a status field.** A charge carries the
 *    day it fell due; the age is that day counted to the statement date. Nothing
 *    here reads "unpaid" — an unpaid charge is simply one that was handed in.
 * 2. **A payment plan is a schedule, not overdue debt.** A plan balance sits in
 *    `planned` and in no bucket. An instalment plan the council agreed to is not
 *    the same fact as a lot that stopped paying, and a ladder that mixed them
 *    would rank the owner who is keeping their word beside the one who is not.
 * 3. **"Current" means not yet due.** The next fee, due on the 1st, is real money
 *    owed and belongs in the total, but it is not aged — it is the one column a
 *    reader should find empty before the 1st.
 */

export type ChargeKind = 'fee' | 'late' | 'fine' | 'levy';

export interface Charge {
	unitId: string;
	kind: ChargeKind;
	/** The day the charge fell due. */
	due: string;
	cents: number;
	/** `YYYY-MM` for a monthly fee, or for the late fee that follows one. */
	period?: string;
	/** Cents a month when the balance is being paid on an agreed plan. */
	planCents?: number;
}

/** Oldest last, so a table reads the way the conversation about it does. */
export const BUCKETS = ['current', 'age30', 'age60', 'age90', 'over90'] as const;
export type Bucket = (typeof BUCKETS)[number];

/** The upper edge of each aging column, in days past due. */
export const BUCKET_LIMITS: Array<{ bucket: Exclude<Bucket, 'current'>; days: number }> = [
	{ bucket: 'age30', days: 30 },
	{ bucket: 'age60', days: 60 },
	{ bucket: 'age90', days: 90 }
];

/** Whole days from one calendar day to another. Both are `YYYY-MM-DD`. */
export function daysBetween(from: string, to: string): number {
	const start = Date.UTC(Number(from.slice(0, 4)), Number(from.slice(5, 7)) - 1, Number(from.slice(8, 10)));
	const end = Date.UTC(Number(to.slice(0, 4)), Number(to.slice(5, 7)) - 1, Number(to.slice(8, 10)));
	return Math.round((end - start) / 86_400_000);
}

/**
 * Days a charge is past its due date. A charge due today is 0, and one that is
 * not due yet is negative — the sign is kept so a caller can tell "due today"
 * from "not due", which a clamp to zero would hide.
 */
export function daysPastDue(due: string, asOf: string): number {
	return daysBetween(due, asOf);
}

/** Which column a charge falls in. Anything not yet due is current. */
export function bucketOf(daysLate: number): Bucket {
	if (daysLate <= 0) return 'current';
	for (const { bucket, days } of BUCKET_LIMITS) {
		if (daysLate <= days) return bucket;
	}
	return 'over90';
}

export interface AgedLot {
	unitId: string;
	buckets: Record<Bucket, number>;
	/** Everything aged, the next fee included. Plan balances are not in here. */
	total: number;
	/** The part past its due date. */
	pastDue: number;
	/** A plan balance, held outside the buckets. */
	planned: number;
	/** The oldest charge still standing, and how old it is. */
	oldest: string | null;
	oldestDays: number;
}

const emptyBuckets = (): Record<Bucket, number> => ({
	current: 0,
	age30: 0,
	age60: 0,
	age90: 0,
	over90: 0
});

/**
 * Roll charges up per lot.
 *
 * Sorted oldest money first, then by the largest past-due balance: the reader is
 * looking for the lot where time has done the most damage, so an 89-day charge
 * outranks a 3-day one even if the newer one is larger.
 */
export function age(charges: Charge[], asOf: string): AgedLot[] {
	const lots = new Map<string, AgedLot>();

	for (const charge of charges) {
		const lot =
			lots.get(charge.unitId) ??
			({
				unitId: charge.unitId,
				buckets: emptyBuckets(),
				total: 0,
				pastDue: 0,
				planned: 0,
				oldest: null,
				oldestDays: 0
			} satisfies AgedLot);

		if (charge.planCents) {
			lot.planned += charge.cents;
			lots.set(charge.unitId, lot);
			continue;
		}

		const daysLate = daysPastDue(charge.due, asOf);
		const bucket = bucketOf(daysLate);
		lot.buckets[bucket] += charge.cents;
		lot.total += charge.cents;
		if (daysLate > 0) lot.pastDue += charge.cents;
		if (lot.oldest === null || charge.due < lot.oldest) {
			lot.oldest = charge.due;
			lot.oldestDays = Math.max(lot.oldestDays, daysLate);
		}
		lots.set(charge.unitId, lot);
	}

	for (const lot of lots.values()) {
		if (lot.oldest !== null) lot.oldestDays = daysPastDue(lot.oldest, asOf);
	}

	return [...lots.values()].sort(
		(a, b) => b.oldestDays - a.oldestDays || b.pastDue - a.pastDue || a.unitId.localeCompare(b.unitId)
	);
}

export interface AgingSummary {
	buckets: Record<Bucket, number>;
	total: number;
	pastDue: number;
	planned: number;
	/** Lots with anything standing, on a plan or not. */
	lots: number;
	/** Lots with something past its due date. */
	pastDueLots: number;
	/** The oldest charge in the book, or null when nothing is past due. */
	oldest: AgedLot | null;
	/** Past-due money that is more than 90 days old, as a share of past due. */
	over90Share: number;
}

export function summarise(rows: AgedLot[]): AgingSummary {
	const buckets = emptyBuckets();
	let total = 0;
	let pastDue = 0;
	let planned = 0;
	let pastDueLots = 0;
	let oldest: AgedLot | null = null;

	for (const row of rows) {
		for (const bucket of BUCKETS) buckets[bucket] += row.buckets[bucket];
		total += row.total;
		pastDue += row.pastDue;
		planned += row.planned;
		if (row.pastDue > 0) pastDueLots += 1;
		if (row.pastDue > 0 && (oldest === null || row.oldestDays > oldest.oldestDays)) oldest = row;
	}

	return {
		buckets,
		total,
		pastDue,
		planned,
		lots: rows.length,
		pastDueLots,
		oldest,
		over90Share: pastDue > 0 ? buckets.over90 / pastDue : 0
	};
}

/** `YYYY-MM` for a day string. */
export function periodOf(day: string): string {
	return day.slice(0, 7);
}

/** The 1st of a period, as a day string. */
export function monthStart(period: string): string {
	return `${period}-01`;
}

/** A day inside a period, clamped to what that month has. */
export function dayIn(period: string, day: number): string {
	const [year, month] = period.split('-').map(Number);
	const last = new Date(Date.UTC(year, month, 0)).getUTCDate();
	return `${period}-${String(Math.min(day, last)).padStart(2, '0')}`;
}

/** The period before this one. */
export function previousPeriod(period: string): string {
	const [year, month] = period.split('-').map(Number);
	return month === 1 ? `${year - 1}-12` : `${year}-${String(month - 1).padStart(2, '0')}`;
}

/** The period after this one. */
export function nextPeriod(period: string): string {
	const [year, month] = period.split('-').map(Number);
	return month === 12 ? `${year + 1}-01` : `${year}-${String(month + 1).padStart(2, '0')}`;
}

/**
 * The billed months that have come due by `asOf`, newest first — the window an
 * arrears count is counting backwards through.
 */
export function duePeriods(asOf: string, count: number): string[] {
	const periods: string[] = [];
	let period = periodOf(asOf);
	while (periods.length < count) {
		if (monthStart(period) <= asOf) periods.push(period);
		period = previousPeriod(period);
	}
	return periods;
}
