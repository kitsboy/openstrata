import { describe, expect, it } from 'vitest';
import { arrearsLetter } from './arrears-letter';
import { charges } from './demo/arrears';
import { LATE_FEE_CENTS, balance, building, units } from './demo/building';

/**
 * The ladder as a letter to one owner.
 *
 * The figures here are the same money the lot's sheet and the receivables ladder
 * print — lot 207's $5,700 due before October's fee, lot 309's $200 fine, lot
 * 108's levy on a schedule — so the letter cannot be a second, softer account of
 * the same balance.
 */
const asOf = building.asOf;
const all = charges(asOf);

function letterFor(id: string) {
	return arrearsLetter(units.find((unit) => unit.id === id)!, all, asOf, LATE_FEE_CENTS);
}

describe('the owner’s arrears letter', () => {
	it('asks only for money that has fallen due', () => {
		const letter = letterFor('309');
		expect(letter.lines).toHaveLength(1);
		expect(letter.lines[0]).toMatchObject({ kind: 'fine', due: '2026-09-16', cents: 20_000 });
		expect(letter.dueNowCents).toBe(20_000);
		expect(letter.clearCents).toBe(20_000);
		expect(letter.arrearsCents).toBe(20_000);
		// October's $792 fee is printed, and is not part of what is asked for.
		expect(letter.next).toMatchObject({ kind: 'fee', due: '2026-10-01', cents: 79_200 });
		expect(letter.next!.daysLate).toBe(0);
	});

	it('ages each charge from its due date, and names the reference', () => {
		const letter = letterFor('309');
		expect(letter.reference).toBe('OS-AL-2026-09-309');
		expect(letter.oldestDays).toBe(14);
		const arrear = letterFor('207');
		// The parkade levy fell due 12 November 2025 — 322 days at this close.
		expect(arrear.oldestDays).toBe(322);
	});

	it('carries the whole standing balance, fee by fee', () => {
		const letter = letterFor('207');
		// July, August and September at $666, three $50 late fees, the $3,552 levy.
		expect(letter.lines).toHaveLength(7);
		expect(letter.arrearsCents).toBe(570_000);
		expect(letter.clearCents).toBe(570_000);
		expect(letter.next!.cents).toBe(66_600);
	});

	it('treats an agreed plan as a schedule rather than arrears', () => {
		const letter = letterFor('108');
		expect(letter.plannedCents).toBe(180_000);
		expect(letter.planMonthlyCents).toBe(30_000);
		expect(letter.arrearsCents).toBe(0);
		expect(letter.clearCents).toBe(0);
		expect(letter.oldestDays).toBe(0);
	});

	it('gives the day the building’s own bylaw adds money', () => {
		// The $50 late fee attaches on the 5th, so a plan must be agreed by then.
		expect(letterFor('207').deadline).toBe('2026-10-05');
		expect(letterFor('305').deadline).toBe('2026-10-05');
		const december = arrearsLetter(
			{ id: '207', owner: 'Chidi Okonkwo' },
			all,
			'2026-12-15',
			LATE_FEE_CENTS
		);
		expect(december.deadline).toBe('2027-01-05');
	});

	it('adds up to the lot’s own balance, every lot', () => {
		for (const unit of units) {
			const letter = letterFor(unit.id);
			expect(letter.dueNowCents + (letter.next?.cents ?? 0)).toBe(balance(unit).total);
		}
	});

	it('counts a charge due on the letter’s own day as zero days late', () => {
		const letter = arrearsLetter(
			{ id: '999', owner: 'Test Owner' },
			[{ unitId: '999', kind: 'fee', due: '2026-09-30', cents: 1000 }],
			'2026-09-30',
			LATE_FEE_CENTS
		);
		expect(letter.lines[0].daysLate).toBe(0);
		expect(letter.arrearsCents).toBe(0);
		expect(letter.clearCents).toBe(1000);
	});
});
