import { describe, expect, it } from 'vitest';
import { insuranceSummary, type InsuranceInput } from './insurance-summary';
import { building } from './demo/building';
import { books } from './demo/books';

const insurance = building.insurance;
const line = books.expenses.find((expense) => expense.code === '6100')!;

const input: InsuranceInput = {
	policy: insurance.policy,
	broker: insurance.broker,
	termStart: insurance.termStart,
	termEnd: insurance.termEnd,
	fiscalEnd: building.fiscalEnd,
	premiumCents: insurance.premiumCents,
	budgetAnnualCents: line.annualCents,
	expensedYtdCents: line.ytdCents,
	monthsElapsed: books.monthsElapsed,
	waterDeductibleCents: insurance.waterDeductibleCents,
	quake: insurance.quake,
	appraisalIso: insurance.appraisalIso,
	renewalIso: insurance.renewalIso,
	asOf: building.asOf,
	lots: building.lots
};

describe('insuranceSummary', () => {
	it('reads the premium off the policy and finds the same line in the budget', () => {
		const summary = insuranceSummary(input);

		expect(summary.premiumCents).toBe(4_860_000);
		expect(summary.budgetAnnualCents).toBe(4_860_000);
		expect(summary.premiumMatchesBudget).toBe(true);
		expect(summary.monthlyCents).toBe(405_000);
	});

	it('checks the accrual against what the ledger has expensed', () => {
		const summary = insuranceSummary(input);

		expect(summary.accruedCents).toBe(2_430_000);
		expect(summary.expensedYtdCents).toBe(2_430_000);
		expect(summary.accrualMatches).toBe(true);
		expect(
			insuranceSummary({ ...input, expensedYtdCents: 2_025_000 }).accrualMatches
		).toBe(false);
	});

	it('carries the term through the fiscal year', () => {
		const summary = insuranceSummary(input);

		expect(summary.termDays).toBe(365);
		expect(summary.termEndsOnFiscalEnd).toBe(true);
		expect(insuranceSummary({ ...input, fiscalEnd: '2027-06-30' }).termEndsOnFiscalEnd).toBe(false);
	});

	it('keeps the earthquake deductible a rule while there is no insured value', () => {
		const summary = insuranceSummary(input);

		expect(summary.quakeRateBps).toBe(1000);
		expect(summary.quakeMinimumCents).toBe(10_000_000);
		expect(summary.insuredValueCents).toBeNull();
		expect(summary.quakeDeductibleCents).toBeNull();
	});

	it('works the quake deductible out once a value exists, floor and all', () => {
		const valued = insuranceSummary({
			...input,
			quake: { ...input.quake, insuredValueCents: 90_000_000_000 }
		});
		const underFloor = insuranceSummary({
			...input,
			quake: { ...input.quake, insuredValueCents: 50_000_000 }
		});

		expect(valued.quakeDeductibleCents).toBe(9_000_000_000);
		expect(underFloor.quakeDeductibleCents).toBe(10_000_000);
	});

	it('counts the days to the appraisal and the renewal, and keeps their order', () => {
		const summary = insuranceSummary(input);

		expect(summary.daysToAppraisal).toBe(22);
		expect(summary.daysToRenewal).toBe(183);
		expect(summary.appraisalBeforeRenewal).toBe(true);
		expect(
			insuranceSummary({ ...input, appraisalIso: '2027-05-01' }).appraisalBeforeRenewal
		).toBe(false);
	});

	it('states the premium a lot a month and balances only when every check holds', () => {
		const summary = insuranceSummary(input);

		expect(summary.perLotMonthCents).toBe(10_125);
		expect(summary.balanced).toBe(true);
		expect(insuranceSummary({ ...input, premiumCents: 4_800_000 }).balanced).toBe(false);
	});
});
