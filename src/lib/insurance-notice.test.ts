import { describe, expect, it } from 'vitest';
import { lotInsuranceNotice } from './demo/insurance-notice';
import { building } from './demo/building';

/**
 * The owner's insurance notice.
 *
 * The summary on `/accounting` answers a council; this answers an owner who has
 * had a leak and wants to know what the building covers. The term has to be
 * current at the letter's own date, the deductible has to stay the
 * corporation's while no bylaw says otherwise, and the earthquake figure has to
 * stay a formula while no insured value is on the books.
 */
describe('lotInsuranceNotice', () => {
	it('reads the policy and its term off the building record', () => {
		const notice = lotInsuranceNotice('207')!;

		expect(notice.policy).toBe('HH-2847-26');
		expect(notice.broker).toBe(building.insurance.broker);
		expect(notice.reference).toBe('OS-IN-2026-09-207');
		expect(notice.termStart).toBe('2026-04-01');
		expect(notice.termEnd).toBe('2027-03-31');
	});

	it('confirms cover only inside the term', () => {
		const inside = lotInsuranceNotice('207')!;
		const after = lotInsuranceNotice('207', '2027-04-02')!;

		expect(inside.coverCurrent).toBe(true);
		expect(inside.daysLeft).toBe(182);
		expect(after.coverCurrent).toBe(false);
		expect(after.daysLeft).toBe(-2);
	});

	it('quotes the bylaw’s two halves rather than retyping them', () => {
		const notice = lotInsuranceNotice('207')!;

		expect(notice.strataCover).toContain('building and common property');
		expect(notice.ownerCover).toContain('contents, liability');
	});

	it('keeps the earthquake deductible a rule while no insured value exists', () => {
		const notice = lotInsuranceNotice('207')!;

		expect(notice.quakeRateBps).toBe(1000);
		expect(notice.quakeMinimumCents).toBe(10_000_000);
		expect(notice.insuredValueCents).toBeNull();
		expect(notice.quakeDeductibleCents).toBeNull();
	});

	it('does not charge the corporation’s water deductible to the owner', () => {
		const notice = lotInsuranceNotice('207')!;

		expect(notice.waterDeductibleCents).toBe(2_500_000);
		expect(notice.deductibleCharge).toBe('none-on-file');
	});

	it('returns nothing for a lot that is not on the register', () => {
		expect(lotInsuranceNotice('999')).toBeNull();
	});
});
