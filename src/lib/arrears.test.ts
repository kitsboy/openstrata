import { describe, expect, it } from 'vitest';
import {
	BUCKETS,
	age,
	bucketOf,
	dayIn,
	daysBetween,
	daysPastDue,
	duePeriods,
	monthStart,
	nextPeriod,
	periodOf,
	previousPeriod,
	summarise,
	type Charge
} from './arrears';
import { charges, LEVY_PLAN_CENTS } from './demo/arrears';
import { balance, building, units } from './demo/building';

const AS_OF = building.asOf;

const charge = (unitId: string, due: string, cents: number, extra: Partial<Charge> = {}): Charge => ({
	unitId,
	kind: 'fee',
	due,
	cents,
	...extra
});

describe('daysBetween', () => {
	it('counts whole calendar days across a month and a leap day', () => {
		expect(daysBetween('2026-09-01', '2026-09-30')).toBe(29);
		expect(daysBetween('2026-07-01', '2026-09-30')).toBe(91);
		expect(daysBetween('2024-02-28', '2024-03-01')).toBe(2);
		expect(daysBetween('2026-09-30', '2026-09-30')).toBe(0);
	});

	it('is negative when the second day is earlier', () => {
		expect(daysBetween('2026-10-01', '2026-09-30')).toBe(-1);
	});
});

describe('bucketOf', () => {
	it('counts a charge due today as current, not as late', () => {
		expect(bucketOf(0)).toBe('current');
		expect(bucketOf(-3)).toBe('current');
	});

	it('puts each age in one column, with the boundary days in the younger one', () => {
		expect(bucketOf(1)).toBe('age30');
		expect(bucketOf(30)).toBe('age30');
		expect(bucketOf(31)).toBe('age60');
		expect(bucketOf(60)).toBe('age60');
		expect(bucketOf(61)).toBe('age90');
		expect(bucketOf(90)).toBe('age90');
		expect(bucketOf(91)).toBe('over90');
		expect(bucketOf(400)).toBe('over90');
	});
});

describe('periods', () => {
	it('steps a month at a time and wraps the year', () => {
		expect(previousPeriod('2026-01')).toBe('2025-12');
		expect(nextPeriod('2026-12')).toBe('2027-01');
		expect(periodOf('2026-09-30')).toBe('2026-09');
		expect(monthStart('2026-09')).toBe('2026-09-01');
	});

	it('clamps a day to the length of its month', () => {
		expect(dayIn('2026-09', 5)).toBe('2026-09-05');
		expect(dayIn('2026-02', 30)).toBe('2026-02-28');
	});

	it('counts back only through months that have come due', () => {
		expect(duePeriods('2026-09-30', 3)).toEqual(['2026-09', '2026-08', '2026-07']);
		// On the 1st that month has come due; on the day before, it has not.
		expect(duePeriods('2026-09-01', 2)).toEqual(['2026-09', '2026-08']);
		expect(duePeriods('2026-08-31', 2)).toEqual(['2026-08', '2026-07']);
	});
});

describe('age', () => {
	it('puts every charge in exactly one bucket, and the buckets add to the total', () => {
		const rows = age(charges(AS_OF), AS_OF);
		for (const row of rows) {
			const summed = BUCKETS.reduce((sum, bucket) => sum + row.buckets[bucket], 0);
			expect(summed, `${row.unitId} buckets`).toBe(row.total);
		}
	});

	it('keeps a plan balance out of every bucket', () => {
		const rows = age([charge('108', '2025-11-12', 180_000, { kind: 'levy', planCents: 30_000 })], AS_OF);
		expect(rows[0].buckets).toEqual({ current: 0, age30: 0, age60: 0, age90: 0, over90: 0 });
		expect(rows[0].planned).toBe(180_000);
		expect(rows[0].total).toBe(0);
		expect(rows[0].pastDue).toBe(0);
	});

	it('does not count the next fee as past due, but does count it in the total', () => {
		const rows = age([charge('101', '2026-10-01', 50_000)], AS_OF);
		expect(rows[0].buckets.current).toBe(50_000);
		expect(rows[0].pastDue).toBe(0);
		expect(rows[0].total).toBe(50_000);
	});

	it('sorts the lot where time has done the most damage first', () => {
		const rows = age(
			[
				charge('101', '2026-09-28', 500_000),
				charge('102', '2026-08-01', 60_000),
				charge('103', '2025-11-12', 1_000)
			],
			AS_OF
		);
		expect(rows.map((row) => row.unitId)).toEqual(['103', '102', '101']);
	});

	it('reports the oldest charge standing, not the largest', () => {
		const rows = age(
			[charge('101', '2026-09-01', 900_000), charge('101', '2026-07-01', 100)],
			AS_OF
		);
		expect(rows[0].oldest).toBe('2026-07-01');
		expect(rows[0].oldestDays).toBe(91);
	});
});

describe('the demo book', () => {
	it('adds up to the balance the rest of the app asks for, lot by lot', () => {
		const byLot = new Map<string, number>();
		for (const item of charges(AS_OF)) {
			byLot.set(item.unitId, (byLot.get(item.unitId) ?? 0) + item.cents);
		}
		for (const unit of units) {
			expect(byLot.get(unit.id) ?? 0, `lot ${unit.id}`).toBe(balance(unit).total);
		}
	});

	it('ages lot 104 by 29 days, not by the month it is behind', () => {
		const row = age(charges(AS_OF), AS_OF).find((entry) => entry.unitId === '104')!;
		expect(row.buckets.age30).toBe(54_900 + 5_000);
		expect(row.buckets.current).toBe(54_900);
		expect(row.oldest).toBe('2026-09-01');
		expect(row.oldestDays).toBe(29);
	});

	it('spreads lot 207 across four columns and the levy into 90+', () => {
		const row = age(charges(AS_OF), AS_OF).find((entry) => entry.unitId === '207')!;
		expect(row.buckets).toEqual({
			current: 66_600,
			age30: 66_600 + 5_000,
			age60: 66_600 + 5_000,
			age90: 5_000,
			over90: 66_600 + 355_200
		});
		expect(row.total).toBe(balance(units.find((unit) => unit.id === '207')!).total);
	});

	it('holds the two plan balances outside the ladder by their own amounts', () => {
		const rows = age(charges(AS_OF), AS_OF);
		for (const [unitId, monthly] of Object.entries(LEVY_PLAN_CENTS)) {
			const row = rows.find((entry) => entry.unitId === unitId)!;
			expect(row.planned, `lot ${unitId}`).toBe(
				units.find((unit) => unit.id === unitId)!.levyOwing
			);
			expect(monthly).toBeGreaterThan(0);
			expect(row.buckets.over90).toBe(0);
		}
	});
});

describe('summarise', () => {
	it('counts past-due lots separately from lots with a plan', () => {
		const rows = age(charges(AS_OF), AS_OF);
		const summary = summarise(rows);
		const pastDueLots = rows.filter((row) => row.pastDue > 0).map((row) => row.unitId);
		expect(summary.pastDueLots).toBe(pastDueLots.length);
		expect(summary.lots).toBe(rows.length);
		expect(summary.planned).toBe(
			Object.values(LEVY_PLAN_CENTS).length > 0
				? units
						.filter((unit) => unit.id in LEVY_PLAN_CENTS)
						.reduce((sum, unit) => sum + unit.levyOwing, 0)
				: 0
		);
	});

	it('names the oldest lot and the 90+ share of what is past due', () => {
		const summary = summarise(age(charges(AS_OF), AS_OF));
		expect(summary.oldest?.unitId).toBe('207');
		expect(summary.over90Share).toBeCloseTo(summary.buckets.over90 / summary.pastDue, 10);
		// Most of what is overdue is over three months old, but not all of it: the
		// September fee is 29 days late and the ladder has to keep that distinction.
		expect(summary.over90Share).toBeGreaterThan(0.6);
		expect(summary.over90Share).toBeLessThan(1);
	});

	it('reports nothing past due on an empty book rather than dividing by zero', () => {
		const summary = summarise([]);
		expect(summary.pastDue).toBe(0);
		expect(summary.oldest).toBeNull();
		expect(summary.over90Share).toBe(0);
	});
});
