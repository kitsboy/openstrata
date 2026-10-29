import { describe, expect, it } from 'vitest';
import { buildYearSheet, categorise, EXPENSE_RULES, INCOME_RULES } from './year-sheet';
import { yearBook } from './demo/year';
import { books } from './demo/books';

const sheet = buildYearSheet({
	...yearBook,
	health: {
		from: { label: 'April 2026', score: 82 },
		to: { label: 'September 2026', score: 56 }
	}
});

describe('buildYearSheet', () => {
	it('adds the categories to the income the books report', () => {
		// Fee income that belongs to operating plus every other income line.
		expect(sheet.income.ytdCents).toBe(books.feesOperating + books.otherIncome);
		// The full-year budget is the operating share of the fee budget, not the
		// whole fee: the reserve's 15% is not operating income.
		expect(sheet.income.annualCents).toBe(
			books.feeAnnual - books.crfContributionAnnual + books.otherIncomeAnnual
		);
	});

	it('adds the categories to the spend the books report', () => {
		expect(sheet.expense.ytdCents).toBe(books.expenseTotal);
		expect(sheet.expense.annualCents).toBe(books.expenseAnnual);
	});

	it('leaves no ledger code unclaimed on either side', () => {
		expect(sheet.income.unmatched).toEqual([]);
		expect(sheet.expense.unmatched).toEqual([]);
	});

	it('claims each code exactly once', () => {
		const codes = [...INCOME_RULES, ...EXPENSE_RULES].flatMap((rule) => rule.codes);
		expect(new Set(codes).size).toBe(codes.length);
	});

	it('carries the books’ own surplus, not a second subtraction', () => {
		expect(sheet.surplusCents).toBe(books.surplusYtd);
		// And the budget column subtracts the same way.
		expect(sheet.budgetSurplusCents).toBe(sheet.income.annualCents - sheet.expense.annualCents);
	});

	it('totals the three funds at the close', () => {
		expect(sheet.fundsTotalCents).toBe(
			books.operating.cash + books.crf.cash + books.levy.cash
		);
		expect(sheet.funds.map((fund) => fund.id)).toEqual([
			'operatingCents',
			'reserveCents',
			'levyCents'
		]);
	});

	it('reads the score as a movement between two points', () => {
		expect(sheet.health.delta).toBe(-26);
		expect(sheet.health.from.label).toBe('April 2026');
		expect(sheet.health.to.label).toBe('September 2026');
	});

	it('keeps every tracked item, and counts the overdue ones', () => {
		expect(sheet.open).toHaveLength(3);
		expect(sheet.openOverdue).toBe(0);
		expect(sheet.open.map((item) => item.title)).toContain('Annual General Meeting');
	});

	it('reports a code no category claims instead of dropping it', () => {
		const summary = categorise(
			[{ code: '9999', name: 'A new account', ytdCents: 12_300, annualCents: 24_600 }],
			EXPENSE_RULES
		);
		expect(summary.unmatched).toEqual(['9999']);
		expect(summary.ytdCents).toBe(0);
	});
});
