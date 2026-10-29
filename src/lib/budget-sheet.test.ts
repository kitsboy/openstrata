import { describe, expect, it } from 'vitest';
import {
	MONTHS_IN_YEAR,
	budgetSheet,
	clampMonths,
	planToDateCents,
	varianceTone,
	type BudgetGroup,
	type BudgetSheet,
	type BudgetSource
} from './budget-sheet';
import { books } from './demo/books';

const source: BudgetSource = {
	monthsElapsed: books.monthsElapsed,
	income: [
		{ code: '4000', name: 'Strata fees', annualCents: books.feeAnnual, ytdCents: books.feesOperating + books.feesCrf },
		...books.incomeLines
	],
	expense: books.expenses,
	reserve: { code: '3500', name: 'CRF contribution', annualCents: books.crfContributionAnnual, ytdCents: books.feesCrf }
};

const sheet = budgetSheet(source);

const columns = [
	'annualCents',
	'ytdCents',
	'leftCents',
	'planToDateCents',
	'varianceCents'
] as const;

function expectGroupAdds(group: BudgetGroup) {
	for (const column of columns) {
		const sum = group.rows.reduce((total, row) => total + row[column], 0);
		expect(sum, `${group.id}.${column}`).toBe(group[column]);
	}
}

describe('plan to date', () => {
	it('is the annual figure pro-rated over the fiscal year', () => {
		expect(MONTHS_IN_YEAR).toBe(12);
		expect(planToDateCents(5_400_000, 6)).toBe(2_700_000);
		expect(planToDateCents(5_400_000, 1)).toBe(450_000);
		expect(planToDateCents(5_400_000, 12)).toBe(5_400_000);
	});

	it('holds a month count outside the year to the year', () => {
		expect(clampMonths(-4)).toBe(0);
		expect(clampMonths(13)).toBe(12);
		expect(clampMonths(6.9)).toBe(6);
		expect(clampMonths(Number.NaN)).toBe(0);
		expect(planToDateCents(120_000, 30)).toBe(120_000);
		expect(planToDateCents(120_000, 0)).toBe(0);
	});
});

describe('variance verdicts', () => {
	it('reads the sign the same way on both sides, the verdict by the side', () => {
		expect(varianceTone('expense', -500)).toBe('favourable');
		expect(varianceTone('expense', 500)).toBe('unfavourable');
		expect(varianceTone('income', 500)).toBe('favourable');
		expect(varianceTone('income', -500)).toBe('unfavourable');
		expect(varianceTone('income', 0)).toBe('on');
		expect(varianceTone('expense', 0)).toBe('on');
	});

	it('gives the reserve contribution no verdict', () => {
		// A fund ahead of its contribution is a decision, not a slip.
		expect(varianceTone('reserve', 400_000)).toBe('na');
		expect(varianceTone('reserve', -400_000)).toBe('na');
	});
});

describe('the budget sheet', () => {
	it('reads the books as three groups and a result', () => {
		expect(sheet.monthsElapsed).toBe(6);
		expect(sheet.monthsInYear).toBe(12);
		// The fee run plus the six other income codes; every budgeted expense.
		expect(sheet.income.rows).toHaveLength(1 + books.incomeLines.length);
		expect(sheet.expense.rows).toHaveLength(books.expenses.length);
		expect(sheet.reserve.rows).toHaveLength(1);
	});

	it('adds each group up, column by column', () => {
		expectGroupAdds(sheet.income);
		expectGroupAdds(sheet.expense);
		expectGroupAdds(sheet.reserve);
	});

	it('makes every row’s columns agree with each other', () => {
		for (const group of [sheet.income, sheet.expense, sheet.reserve]) {
			for (const row of group.rows) {
				expect(row.leftCents, row.code).toBe(row.annualCents - row.ytdCents);
				expect(row.varianceCents, row.code).toBe(row.ytdCents - row.planToDateCents);
			}
		}
	});

	it('lands the result on the groups, not on a division of its own', () => {
		expect(sheet.result.annualCents).toBe(
			sheet.income.annualCents - sheet.expense.annualCents - sheet.reserve.annualCents
		);
		expect(sheet.result.ytdCents).toBe(
			sheet.income.ytdCents - sheet.expense.ytdCents - sheet.reserve.ytdCents
		);
		expect(sheet.result.planToDateCents).toBe(
			sheet.income.planToDateCents -
				sheet.expense.planToDateCents -
				sheet.reserve.planToDateCents
		);
		expect(sheet.result.varianceCents).toBe(sheet.result.ytdCents - sheet.result.planToDateCents);
		expect(sheet.result.leftCents).toBe(sheet.result.annualCents - sheet.result.ytdCents);
	});

	it('closes on a balanced budget and a surplus ahead of plan', () => {
		// The approved budget balances: fee income plus other income, less the
		// expense lines and the reserve contribution, is zero for the full year.
		expect(sheet.result.annualCents).toBe(books.tie.budgetDelta);
		expect(sheet.result.annualCents).toBe(0);
		// Six months in, $15,878.32 more is left over than the straight-line plan.
		// The result is the books' own surplus, not a second computation of it.
		expect(sheet.result.ytdCents).toBe(books.surplusYtd);
		expect(sheet.result.ytdCents).toBe(1_587_832);
		expect(sheet.result.planToDateCents).toBe(0);
		expect(sheet.result.varianceCents).toBe(1_587_832);
		expect(sheet.result.tone).toBe('favourable');
	});

	it('states the year\u2019s real story line by line, not a flat comparison', () => {
		const byCode = new Map(sheet.expense.rows.map((row) => [row.code, row]));
		// Insurance is prepaid and expensed straight across the year: exactly half.
		expect(byCode.get('6100')?.planToDateCents).toBe(2_430_000);
		expect(byCode.get('6100')?.varianceCents).toBe(0);
		expect(byCode.get('6100')?.tone).toBe('on');
		// Hydro has run $720 past halfway.
		expect(byCode.get('6110')?.varianceCents).toBe(72_000);
		expect(byCode.get('6110')?.tone).toBe('unfavourable');
		// The concierge started on 1 September, so that line is far under plan.
		expect(byCode.get('6210')?.varianceCents).toBe(-744_000);
		expect(byCode.get('6210')?.tone).toBe('favourable');
		// The reserve contribution is neither: it is a decision.
		expect(sheet.reserve.rows[0].tone).toBe('na');
		expect(sheet.reserve.rows[0].varianceCents).toBe(0);
	});

	it('reports income under plan as unfavourable', () => {
		// Other income is $320 behind halfway; the fee run is exactly on it.
		expect(sheet.income.varianceCents).toBe(-32_000);
		expect(sheet.income.rows[0].varianceCents).toBe(0);
		expect(sheet.income.rows[0].tone).toBe('on');
	});

	it('keeps the order the budget was adopted in', () => {
		const codes = sheet.expense.rows.map((row) => row.code);
		expect(codes).toEqual(books.expenses.map((line) => line.code));
		expect(sheet.income.rows[0].code).toBe('4000');
	});
});

describe('a sheet built on nothing', () => {
	const empty: BudgetSheet = budgetSheet({
		monthsElapsed: 0,
		income: [],
		expense: [],
		reserve: { code: '3500', name: 'CRF contribution', annualCents: 0, ytdCents: 0 }
	});

	it('prints zeroes rather than a division by zero month', () => {
		expect(empty.result.annualCents).toBe(0);
		expect(empty.result.planToDateCents).toBe(0);
		expect(empty.result.tone).toBe('on');
		expect(empty.reserve.rows[0].tone).toBe('na');
	});
});
