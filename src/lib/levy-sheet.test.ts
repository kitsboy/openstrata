import { describe, expect, it } from 'vitest';
import {
	BOOK_LEVY_SHEET,
	levyLots,
	levySheet,
	lotShare,
	type LevySource
} from './levy-sheet';
import { LEVY_POINT_CENTS, units } from './demo/building';
import { books } from './demo/books';
import { LEVY_PLAN_CENTS } from './demo/arrears';

/** One lot, one rate: a source small enough to reason about by hand. */
function source(over: Partial<LevySource> = {}): LevySource {
	return {
		approved: '12 November 2025',
		project: 'Parkade membrane',
		assessedCents: 360_000,
		spentCents: 260_000,
		cashCents: 100_000,
		remainingCents: 100_000,
		unitRows: [{ id: '101', entitlement: 100, levyOwing: 0 } as (typeof units)[number]],
		planCents: {},
		pointCents: 3_600,
		...over
	};
}

const sheet = BOOK_LEVY_SHEET;

describe('a lot’s share', () => {
	it('is its entitlement at the levy’s rate', () => {
		expect(lotShare(148, 3_600)).toBe(532_800);
		expect(lotShare(100, LEVY_POINT_CENTS)).toBe(360_000);
		expect(lotShare(0, 3_600)).toBe(0);
	});
});

describe('the lots that still owe', () => {
	it('are named, largest balance first, and the settled ones are not', () => {
		expect(sheet.lots.map((row) => row.unitId)).toEqual(['207', '403', '108']);
		for (const row of sheet.lots) expect(row.owingCents).toBeGreaterThan(0);
		// The page says "37 lots paid in full"; they are counted, not listed.
		expect(sheet.settledLots).toBe(units.length - sheet.lots.length);
		expect(sheet.settledLots).toBe(37);
	});

	it('add up to the owing figure the sheet prints', () => {
		expect(sheet.lots.reduce((sum, row) => sum + row.owingCents, 0)).toBe(sheet.owingCents);
		expect(sheet.owingCents).toBe(805_200);
	});

	it('carry their share, their payment, and their plan', () => {
		const byId = new Map(sheet.lots.map((row) => [row.unitId, row]));
		// Lot 207 paid a third of its share and stopped, with no schedule.
		expect(byId.get('207')).toMatchObject({
			points: 148,
			assessedCents: 532_800,
			paidCents: 177_600,
			owingCents: 355_200,
			planCents: null
		});
		// A lot on an agreed plan is still shown with its balance: a schedule is
		// not arrears, but it is also not a payment.
		expect(byId.get('403')?.planCents).toBe(45_000);
		expect(byId.get('403')?.owingCents).toBe(270_000);
	});

	it('never owe more than their own share', () => {
		const rows = levyLots(
			source({
				unitRows: [
					{ id: '900', entitlement: 10, levyOwing: 50_000 } as (typeof units)[number]
				]
			})
		);
		expect(rows[0].assessedCents).toBe(36_000);
		expect(rows[0].owingCents).toBe(36_000);
		expect(rows[0].paidCents).toBe(0);
	});

	it('tie-break on the lot number, so the order is the same every time', () => {
		const rows = levyLots(
			source({
				unitRows: [
					{ id: '402', entitlement: 10, levyOwing: 36_000 } as (typeof units)[number],
					{ id: '305', entitlement: 10, levyOwing: 36_000 } as (typeof units)[number]
				]
			})
		);
		expect(rows.map((row) => row.unitId)).toEqual(['305', '402']);
	});
});

describe('the levy sheet', () => {
	it('assesses the lots’ shares, not a typed total', () => {
		expect(sheet.assessedCents).toBe(21_600_000);
		expect(sheet.assessedCents).toBe(units.reduce((sum, unit) => sum + lotShare(unit.entitlement, LEVY_POINT_CENTS), 0));
		expect(sheet.assessedCents).toBe(books.levy.assessed);
	});

	it('collects the assessment less what is still owed', () => {
		expect(sheet.collectedCents).toBe(sheet.assessedCents - sheet.owingCents);
		expect(sheet.collectedCents).toBe(20_794_800);
		expect(sheet.collectedCents + sheet.owingCents).toBe(sheet.assessedCents);
	});

	it('states the settled money once rather than a row of zeroes', () => {
		expect(sheet.settledCents).toBe(19_922_400);
		expect(sheet.settledCents + sheet.lots.reduce((sum, row) => sum + row.paidCents, 0)).toBe(
			sheet.collectedCents
		);
	});

	it('comes out even, the two ways a reader can check it', () => {
		// Cash in the trust plus what owners still owe …
		expect(sheet.cashCents + sheet.owingCents).toBe(3_960_000);
		// … equals the assessment less what the contract has been paid.
		expect(sheet.assessedCents - sheet.paidCents).toBe(3_960_000);
		expect(sheet.differenceCents).toBe(0);
		expect(sheet.ok).toBe(true);
		expect(sheet.paidCents).toBe(books.levy.spent);
		expect(sheet.remainingCents).toBe(books.levy.remaining);
	});
});

describe('a trust that does not balance', () => {
	it('prints the difference instead of asserting it away', () => {
		const off = levySheet(source({ cashCents: 101_000 }));
		expect(off.differenceCents).toBe(1_000);
		expect(off.ok).toBe(false);
	});

	it('refuses a resolution total the lots cannot rebuild', () => {
		const wrongTotal = levySheet(source({ assessedCents: 360_001 }));
		// The lots still decide the figure; the mismatch is what fails.
		expect(wrongTotal.assessedCents).toBe(360_000);
		expect(wrongTotal.differenceCents).toBe(0);
		expect(wrongTotal.ok).toBe(false);
	});

	it('refuses a remaining figure that does not match assessment less spend', () => {
		const wrongRemaining = levySheet(source({ remainingCents: 99_000 }));
		expect(wrongRemaining.ok).toBe(false);
	});

	it('reads a clean source as even', () => {
		expect(levySheet(source()).ok).toBe(true);
		expect(levySheet(source()).differenceCents).toBe(0);
	});
});

describe('a building with nothing on levy', () => {
	const empty = levySheet({
		approved: '12 November 2025',
		project: 'Parkade membrane',
		assessedCents: 0,
		spentCents: 0,
		cashCents: 0,
		remainingCents: 0,
		unitRows: [],
		planCents: {},
		pointCents: 3_600
	});

	it('prints zeroes rather than a broken balance', () => {
		expect(empty.assessedCents).toBe(0);
		expect(empty.lots).toHaveLength(0);
		expect(empty.settledLots).toBe(0);
		expect(empty.differenceCents).toBe(0);
		expect(empty.ok).toBe(true);
	});
});

describe('the sample book’s levy plans', () => {
	it('matches the plans the arrears module carries', () => {
		for (const [unitId, plan] of Object.entries(LEVY_PLAN_CENTS)) {
			expect(BOOK_LEVY_SHEET.lots.find((row) => row.unitId === unitId)?.planCents).toBe(plan);
		}
	});
});
