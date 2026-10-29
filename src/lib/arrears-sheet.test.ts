import { describe, expect, it } from 'vitest';
import { BUCKETS, age, summarise } from './arrears';
import { charges } from './demo/arrears';
import { arrearsSheet, type SheetLot } from './arrears-sheet';
import { building, formF, units } from './demo/building';

/** The ladder as the page builds it: `age()`'s rows, plus the names the paper needs. */
function lotsOf(asOf = building.asOf): SheetLot[] {
	return age(charges(), asOf).map((row) => {
		const unit = units.find((candidate) => candidate.id === row.unitId)!;
		return {
			unitId: row.unitId,
			owner: unit.owner,
			buckets: row.buckets,
			total: row.total,
			pastDue: row.pastDue,
			planned: row.planned,
			oldest: row.oldest,
			oldestDays: row.oldestDays,
			withheld: formF(unit) === 'withheld'
		};
	});
}

const sheet = arrearsSheet({ lots: lotsOf(), asOf: building.asOf, totalLots: units.length });
const summary = summarise(age(charges(), building.asOf));

describe('the printed ladder', () => {
	it('prints the lots with money past due, oldest first', () => {
		// 207's levy is 322 days old, then 104 and 309. Every other lot owes only
		// next month's fee, and a row of next month's fee is not a ladder.
		expect(sheet.rows.map((row) => row.unitId)).toEqual(['207', '104', '309']);
		expect(sheet.rows[0].oldestDays).toBe(322);
		expect(sheet.rows.map((row) => row.unitId)).not.toContain('101');
		expect(sheet.rows).toHaveLength(3);
	});

	it('accounts for the rest of the book rather than printing it', () => {
		// Thirty-four lots owe the October fee and nothing else; three owe nothing
		// at all. The line under the table is where they live, with the standing
		// total a reader can carry back to the ledger.
		expect(sheet.notDueLots).toBe(34);
		expect(sheet.notDue).toBe(2_313_000);
		expect(sheet.standing).toBe(3_163_600);
		expect(sheet.standing).toBe(sheet.total + sheet.notDue);
		expect(sheet.clearLots).toBe(3);
	});

	it('adds every column to the printed total', () => {
		for (const bucket of BUCKETS) {
			const sum = sheet.rows.reduce((total, row) => total + row.buckets[bucket], 0);
			expect(sum, bucket).toBe(sheet.buckets[bucket]);
		}
		expect(sheet.rows.reduce((total, row) => total + row.total, 0)).toBe(sheet.total);
		// The past due is the book's own past due, not a paper-only figure.
		expect(sheet.pastDue).toBe(summary.pastDue);
		expect(sheet.pastDue).toBe(649_900);
		expect(sheet.total).toBe(850_600);
		expect(sheet.current).toBe(200_700);
		expect(sheet.current + sheet.pastDue).toBe(sheet.total);
	});

	it('counts every lot exactly once', () => {
		expect(sheet.lateLots).toBe(3);
		expect(sheet.lateLots + sheet.notDueLots + sheet.planOnlyLots + sheet.clearLots).toBe(
			sheet.lots
		);
		expect(sheet.lots).toBe(units.length);
	});

	it('keeps a plan balance off the ladder and in the book', () => {
		// Lots 108 and 403 are paying their levies down at $300 and $450 a month.
		// Their money is real and their schedule is being kept, so it is named under
		// the table — never aged into a column that reads “late”.
		expect(sheet.plans.map((plan) => plan.unitId)).toEqual(['108', '403']);
		expect(sheet.plans.map((plan) => plan.planned)).toEqual([180_000, 270_000]);
		expect(sheet.planned).toBe(450_000);
		expect(sheet.planned).toBe(summary.planned);
		expect(sheet.rows.some((row) => row.unitId === '108')).toBe(false);
		// No bucket holds a plan cent: the buckets add to the rows' total, the rows'
		// total excludes plans, and the standing total carries both.
		expect(BUCKETS.reduce((total, bucket) => total + sheet.buckets[bucket], 0)).toBe(sheet.total);
		expect(sheet.standing - sheet.total).toBe(sheet.notDue);
	});

	it('carries a late lot’s next fee in its own column', () => {
		const lot = sheet.rows.find((row) => row.unitId === '207')!;
		expect(lot.buckets.current).toBe(66_600);
		expect(lot.pastDue).toBe(570_000);
		expect(lot.total).toBe(636_600);
		expect(lot.buckets.current + lot.pastDue).toBe(lot.total);
		expect(lot.withheld).toBe(true);
	});

	it('names the oldest money and the share past 90 days', () => {
		expect(sheet.oldest).toEqual({ unitId: '207', days: 322 });
		expect(sheet.buckets.over90).toBe(421_800);
		expect(sheet.over90Share).toBeCloseTo(421_800 / 649_900, 10);
		expect(sheet.withheld).toBe(3);
	});

	it('keeps the order it was handed, because age() already sorted it', () => {
		const rows = lotsOf().filter((lot) => lot.pastDue > 0).reverse();
		const reversed = arrearsSheet({ lots: rows, asOf: building.asOf, totalLots: units.length });
		expect(reversed.rows.map((row) => row.unitId)).toEqual(['309', '104', '207']);
		expect(reversed.oldest).toEqual({ unitId: '207', days: 322 });
	});

	it('prints an empty book as zeroes, not a negative count', () => {
		const empty = arrearsSheet({ lots: [], asOf: building.asOf, totalLots: units.length });
		expect(empty.rows).toEqual([]);
		expect(empty.total).toBe(0);
		expect(empty.pastDue).toBe(0);
		expect(empty.oldest).toBeNull();
		expect(empty.over90Share).toBe(0);
		expect(empty.clearLots).toBe(units.length);
		expect(empty.lots).toBe(units.length);
	});

	it('counts a lot that owes only a plan balance under the plans', () => {
		const planOnly = arrearsSheet({
			lots: [
				{
					unitId: '101',
					owner: 'A. Owner',
					buckets: { current: 0, age30: 0, age60: 0, age90: 0, over90: 0 },
					total: 0,
					pastDue: 0,
					planned: 20_000,
					oldest: null,
					oldestDays: 0,
					withheld: false
				}
			],
			asOf: building.asOf,
			totalLots: 2
		});
		expect(planOnly.rows).toEqual([]);
		expect(planOnly.plans.map((plan) => plan.unitId)).toEqual(['101']);
		expect(planOnly.planOnlyLots).toBe(1);
		expect(planOnly.planned).toBe(20_000);
		expect(planOnly.total).toBe(0);
		expect(planOnly.clearLots).toBe(1);
	});
});
