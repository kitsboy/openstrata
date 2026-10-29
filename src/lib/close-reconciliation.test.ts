import { describe, expect, it } from 'vitest';
import { books } from './demo/books';
import { BOOK_RECONCILIATION, closeReconciliation } from './close-reconciliation';

const section = (id: string) => {
	const found = BOOK_RECONCILIATION.sections.find((candidate) => candidate.id === id);
	expect(found, `no ${id} section`).toBeTruthy();
	return found!;
};

describe('the close on the sample books', () => {
	it('adds the three balances the credit union reports, and nothing else', () => {
		const cash = section('cash');
		expect(cash.groups).toHaveLength(1);
		expect(cash.groups[0].lines.map((line) => line.id)).toEqual(['operating', 'crf', 'levy']);
		expect(cash.groups[0].total).toBe(71_703_442);
		expect(cash.groups[0].total).toBe(books.operating.cash + books.crf.cash + books.levy.cash);
	});

	it('counts the operating fund from its accounts and again from the year', () => {
		const operating = section('operating');
		expect(operating.groups.map((group) => group.id)).toEqual(['accounts', 'activity']);
		// The same fund balance by two routes, and the books' own equity figure.
		expect(operating.groups[0].total).toBe(10_735_832);
		expect(operating.groups[1].total).toBe(10_735_832);
		expect(operating.groups[0].total).toBe(books.operating.equity);
		expect(operating.difference).toBe(0);
		expect(operating.ok).toBe(true);
	});

	it('takes what the fund owes off rather than netting it quietly', () => {
		const lines = section('operating').groups[0].lines;
		const line = (id: string) => lines.find((candidate) => candidate.id === id)!;
		expect(line('bills')).toMatchObject({ cents: books.operating.ap, side: 'less' });
		expect(line('prepaidFees')).toMatchObject({
			cents: books.operating.prepaidFees,
			side: 'less'
		});
		expect(line('payroll')).toMatchObject({
			cents: books.operating.payrollPayable,
			side: 'less'
		});
		// Every line on the asset side adds: the fund's cash is not netted against its bills.
		for (const id of ['operating', 'receivables', 'prepaidInsurance', 'warChest']) {
			expect(line(id).side).toBe('add');
		}
	});

	it('counts the reserve the same two ways', () => {
		const crf = section('crf');
		expect(crf.groups).toHaveLength(2);
		expect(crf.groups[0].total).toBe(60_378_000);
		expect(crf.groups[1].total).toBe(60_378_000);
		expect(crf.groups[1].total).toBe(books.crf.equity);
		expect(crf.difference).toBe(0);
		// The study is the spend named by the books, not a catalog label.
		expect(crf.groups[1].lines.at(-1)).toMatchObject({
			id: 'crfStudy',
			cents: books.crf.spent,
			side: 'less'
		});
	});

	it('counts the levy as work left, not as the trust’s cash', () => {
		const levy = section('levy');
		expect(levy.groups[0].lines.map((line) => line.id)).toEqual(['levyCash', 'levyOwing']);
		expect(levy.groups[0].total).toBe(books.levy.remaining);
		expect(levy.groups[1].lines.map((line) => line.id)).toEqual(['levyAssessed', 'levySpent']);
		expect(levy.groups[1].total).toBe(books.levy.remaining);
		expect(levy.groups[0].total).toBe(3_960_000);
		// The cash alone is not the fund: the owners still owe the difference.
		expect(levy.groups[0].total).not.toBe(books.levy.cash);
	});

	it('brings the budget to zero, with the reserve as a deduction', () => {
		const budget = section('budget');
		const reserve = budget.groups[0].lines.find((line) => line.id === 'budgetReserve')!;
		expect(reserve.side).toBe('less');
		expect(budget.groups[0].total).toBe(0);
		expect(budget.ok).toBe(true);
	});

	it('holds every check, and says so once', () => {
		expect(BOOK_RECONCILIATION.sections.every((item) => item.ok)).toBe(true);
		expect(BOOK_RECONCILIATION.checks).toHaveLength(2);
		expect(BOOK_RECONCILIATION.checks.every((check) => check.ok)).toBe(true);
		expect(BOOK_RECONCILIATION.ok).toBe(true);
		expect(BOOK_RECONCILIATION.date).toBe(books.asOfLabel);
	});
});

describe('when a figure moves', () => {
	it('prints the difference instead of hiding it', () => {
		const moved = closeReconciliation({
			...books,
			operating: { ...books.operating, cash: books.operating.cash + 100 }
		});
		const operating = moved.sections.find((item) => item.id === 'operating')!;
		expect(operating.groups[0].total).toBe(10_735_932);
		expect(operating.groups[1].total).toBe(10_735_832);
		expect(operating.difference).toBe(100);
		expect(operating.ok).toBe(false);
		expect(moved.ok).toBe(false);
	});

	it('keeps the cash section’s total in step with the balances', () => {
		const moved = closeReconciliation({
			...books,
			crf: { ...books.crf, cash: books.crf.cash - 50 }
		});
		const cash = moved.sections.find((item) => item.id === 'cash')!;
		expect(cash.groups[0].total).toBe(71_703_392);
	});

	it('fails the sheet when the journal does not balance', () => {
		const moved = closeReconciliation({ ...books, tie: { ...books.tie, journalOk: false } });
		expect(moved.checks.find((check) => check.id === 'journal')?.ok).toBe(false);
		expect(moved.ok).toBe(false);
		// The funds still tie: one failed check does not fabricate a difference.
		expect(moved.sections.every((item) => item.ok)).toBe(true);
	});

	it('fails the sheet when the budget no longer comes to zero', () => {
		const moved = closeReconciliation({ ...books, otherIncomeAnnual: books.otherIncomeAnnual + 500 });
		const budget = moved.sections.find((item) => item.id === 'budget')!;
		expect(budget.groups[0].total).toBe(500);
		expect(budget.ok).toBe(false);
		expect(moved.ok).toBe(false);
	});
});
