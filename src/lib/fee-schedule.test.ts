import { describe, expect, it } from 'vitest';
import { books } from './demo/books';
import { units } from './demo/building';
import { BOOK_FEE_RATES, BOOK_FEE_SCHEDULE, feeSchedule, feeRow } from './fee-schedule';

describe('fee schedule', () => {
	it('lists all forty lots and their six thousand points', () => {
		expect(BOOK_FEE_SCHEDULE.rows).toHaveLength(40);
		expect(BOOK_FEE_SCHEDULE.lots).toBe(40);
		expect(BOOK_FEE_SCHEDULE.points).toBe(6000);
	});

	it('adds to the budget’s own fee line, monthly and annually', () => {
		expect(BOOK_FEE_SCHEDULE.monthlyCents).toBe(books.feeAnnual / 12);
		expect(BOOK_FEE_SCHEDULE.monthlyCents).toBe(2_700_000);
		expect(BOOK_FEE_SCHEDULE.annualCents).toBe(books.feeAnnual);
		expect(BOOK_FEE_SCHEDULE.annualCents).toBe(32_400_000);
		expect(BOOK_FEE_SCHEDULE.ok).toBe(true);
	});

	it('splits every lot into operating and reserve that add back', () => {
		for (const row of BOOK_FEE_SCHEDULE.rows) {
			expect(row.operatingCents + row.crfCents).toBe(row.monthlyCents);
			expect(row.annualCents).toBe(row.monthlyCents * 12);
			expect(row.operatingCents).toBe(row.points * 390);
			expect(row.crfCents).toBe(row.points * 60);
		}
		// The reserve column is the budget's CRF contribution for the year.
		expect(BOOK_FEE_SCHEDULE.crfCents * 12).toBe(books.crfContributionAnnual);
		expect(BOOK_FEE_SCHEDULE.crfCents * 12).toBe(4_320_000);
	});

	it('puts the tenanted lots first without dropping the others', () => {
		const firstOwners = BOOK_FEE_SCHEDULE.rows.slice(0, BOOK_FEE_SCHEDULE.tenanted);
		expect(firstOwners.every((row) => row.tenanted)).toBe(true);
		expect(BOOK_FEE_SCHEDULE.rows.at(-1)?.tenanted).toBe(false);
		// Eight lots carry a tenant in the sample building; the schedule still
		// prints the other thirty-two.
		expect(BOOK_FEE_SCHEDULE.tenanted).toBe(8);
		expect(BOOK_FEE_SCHEDULE.rows.filter((row) => !row.tenanted)).toHaveLength(32);
	});

	it('names the tenant on a tenanted row and leaves an owner-occupied lot null', () => {
		const tenanted = BOOK_FEE_SCHEDULE.rows.find((row) => row.tenanted)!;
		expect(tenanted.tenant).toBeTruthy();
		const owned = BOOK_FEE_SCHEDULE.rows.find((row) => !row.tenanted)!;
		expect(owned.tenant).toBeNull();
	});

	it('fails its own check when the rate is not the two parts added', () => {
		const sheet = feeSchedule(units, { ...BOOK_FEE_RATES, monthlyCents: 451 });
		expect(sheet.ok).toBe(false);
		// The rows still add up to themselves; it is the rate that disagrees.
		expect(sheet.monthlyCents).toBe(sheet.operatingCents + sheet.crfCents);
	});

	it('computes a row from the entitlement alone', () => {
		const unit = units[0];
		const row = feeRow(unit, BOOK_FEE_RATES);
		expect(row.monthlyCents).toBe(unit.entitlement * 450);
		expect(row.annualCents).toBe(unit.entitlement * 450 * 12);
	});
});
