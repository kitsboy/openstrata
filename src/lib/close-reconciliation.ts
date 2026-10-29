/**
 * The close, reconciled: every fund counted two ways.
 *
 * The overview states the tie in one line — "the books balance" — and the close
 * panel lists the checks. This is the arithmetic behind that line, on paper:
 *
 * 1. **Cash first.** The three balances the credit union reports are the only
 *    figures on the page that came from outside these books, so they are printed
 *    first and added up. The operating statement and the reserve's own page
 *    start from them.
 * 2. **Each fund twice.** The operating fund and the reserve are counted from
 *    their accounts (cash, receivables, prepaids, what is owed) and again from
 *    the year's activity (opening equity, income, spend). Two independent
 *    routes to the same fund balance, printed with the difference between them.
 *    A reconciliation that only printed one count would be an assertion.
 * 3. **The levy trust is not fund equity.** Its cash belongs to the membrane
 *    project until the work is done, so the sheet counts what is left to spend
 *    (assessed less spent) against cash plus what owners still owe. The two
 *    counts are the same money.
 * 4. **The budget has to come to zero**, and the journal has to balance, and
 *    the lots have to add to the schedule's entitlement. Those are the checks
 *    that have no amount to print — they are stated and marked, not totalled.
 *
 * What the page deliberately does not claim: board approval of the close. It is
 * the one item in the close panel that is not a number, and a printed sheet
 * cannot sign itself.
 */

import { books, type Books } from './demo/books';
import { TOTAL_ENTITLEMENT, units } from './demo/building';

export type ReconSectionId = 'cash' | 'operating' | 'crf' | 'levy' | 'budget';

/**
 * Every label the sheet prints. The component maps each to the catalog, so a
 * label with no translation is a type error rather than a blank cell.
 */
export type ReconLabel =
	// Section and group headings.
	| 'cashTitle'
	| 'operatingTitle'
	| 'crfTitle'
	| 'levyTitle'
	| 'budgetTitle'
	| 'accounts'
	| 'activity'
	| 'difference'
	// Cash on deposit, and the operating fund from its accounts.
	| 'operating'
	| 'receivables'
	| 'prepaidInsurance'
	| 'warChest'
	| 'bills'
	| 'prepaidFees'
	| 'payroll'
	// The operating fund from the year's activity.
	| 'openingEquity'
	| 'fees'
	| 'otherIncome'
	| 'expenses'
	// The contingency reserve, both counts.
	| 'crf'
	| 'crfReceivables'
	| 'crfPrepaid'
	| 'crfOpening'
	| 'crfContributions'
	| 'crfInterest'
	| 'crfStudy'
	// The levy trust, both counts.
	| 'levy'
	| 'levyCash'
	| 'levyOwing'
	| 'levyAssessed'
	| 'levySpent'
	| 'levyRemaining'
	// The budget, and the two totals that carry a fund.
	| 'budgetFees'
	| 'budgetReserve'
	| 'budgetOther'
	| 'budgetExpenses'
	| 'budgetResult'
	| 'cashTotal'
	| 'fundBalance';

export interface ReconLine {
	id: ReconLabel;
	/** Always positive: `side` says whether the line adds or subtracts. */
	cents: number;
	side: 'add' | 'less';
	/** The ledger accounts the figure came from, printed beside the label. */
	code?: string;
}

export interface ReconGroup {
	/** The heading the group prints under. */
	id: ReconLabel;
	/** What the group comes to — "Fund balance", "Work remaining". */
	totalId: ReconLabel;
	lines: ReconLine[];
	total: number;
}

export interface ReconSection {
	id: ReconSectionId;
	title: ReconLabel;
	groups: ReconGroup[];
	/**
	 * The first group's total less the second's. Zero when the section is
	 * counted once, and zero when the two counts agree.
	 */
	difference: number;
	ok: boolean;
}

/** A check with no amount in it: it holds or it does not. */
export interface ReconCheck {
	id: 'journal' | 'entitlement';
	ok: boolean;
}

export interface CloseReconciliation {
	/** The day the books stop, as the ledger writes it. */
	date: string;
	sections: ReconSection[];
	checks: ReconCheck[];
	/** Every count agreed and every check held. */
	ok: boolean;
}

/** Add the lines up, so a group's total can never be typed beside them. */
function group(
	id: ReconLabel,
	totalId: ReconLabel,
	lines: ReconLine[]
): ReconGroup {
	const total = lines.reduce(
		(sum, line) => sum + (line.side === 'less' ? -line.cents : line.cents),
		0
	);
	return { id, totalId, lines, total };
}

/**
 * Build the sheet from the books.
 *
 * The source is a parameter so a test can break one figure and watch the
 * difference appear on the same row the reader would check — a reconciliation
 * that cannot fail is not a reconciliation.
 */
export function closeReconciliation(source: Books = books): CloseReconciliation {
	const { operating, crf, levy } = source;

	const cash = group('accounts', 'cashTotal', [
		{ id: 'operating', code: '1010', cents: operating.cash, side: 'add' },
		{ id: 'crf', code: '1020', cents: crf.cash, side: 'add' },
		{ id: 'levy', cents: levy.cash, side: 'add' }
	]);

	const operatingSheet = group('accounts', 'fundBalance', [
		{ id: 'operating', code: '1010', cents: operating.cash, side: 'add' },
		{ id: 'receivables', code: '1200 · 1210 · 1220', cents: operating.ar, side: 'add' },
		{ id: 'prepaidInsurance', code: '1300', cents: operating.prepaidInsurance, side: 'add' },
		{ id: 'warChest', code: '1080', cents: operating.warChest, side: 'add' },
		{ id: 'bills', code: '2200', cents: operating.ap, side: 'less' },
		{ id: 'prepaidFees', code: '2030', cents: operating.prepaidFees, side: 'less' },
		{ id: 'payroll', code: '2100', cents: operating.payrollPayable, side: 'less' }
	]);

	const operatingActivity = group('activity', 'fundBalance', [
		{ id: 'openingEquity', cents: source.openingEquity, side: 'add' },
		{ id: 'fees', code: '4010', cents: source.feesOperating, side: 'add' },
		{ id: 'otherIncome', code: '7010 – 7060', cents: source.otherIncome, side: 'add' },
		{ id: 'expenses', code: '6100 – 6490', cents: source.expenseTotal, side: 'less' }
	]);

	const crfSheet = group('accounts', 'fundBalance', [
		{ id: 'crf', code: '1020', cents: crf.cash, side: 'add' },
		{ id: 'crfReceivables', code: '1200', cents: crf.ar, side: 'add' },
		{ id: 'crfPrepaid', code: '2035', cents: crf.prepaidFees, side: 'less' }
	]);

	const crfActivity = group('activity', 'fundBalance', [
		{ id: 'crfOpening', cents: crf.opening, side: 'add' },
		{ id: 'crfContributions', code: '4020', cents: crf.contributions, side: 'add' },
		{ id: 'crfInterest', code: '7100', cents: crf.interest, side: 'add' },
		{ id: 'crfStudy', cents: crf.spent, side: 'less' }
	]);

	const levySheet = group('accounts', 'levyRemaining', [
		{ id: 'levyCash', cents: levy.cash, side: 'add' },
		{ id: 'levyOwing', cents: levy.owing, side: 'add' }
	]);

	const levyActivity = group('activity', 'levyRemaining', [
		{ id: 'levyAssessed', cents: levy.assessed, side: 'add' },
		{ id: 'levySpent', cents: levy.spent, side: 'less' }
	]);

	const budget = group('accounts', 'budgetResult', [
		// The label already names 4010 and 4020, so the row carries no second code.
		{ id: 'budgetFees', cents: source.feeAnnual, side: 'add' },
		{ id: 'budgetOther', code: '7010 – 7060', cents: source.otherIncomeAnnual, side: 'add' },
		// The reserve contribution is a transfer to a separate fund, not income and
		// not an operating expense: the plan balances income against spend plus it.
		{ id: 'budgetReserve', code: '3500', cents: source.crfContributionAnnual, side: 'less' },
		{ id: 'budgetExpenses', code: '6100 – 6490', cents: source.expenseAnnual, side: 'less' }
	]);

	const sections: ReconSection[] = [
		// Cash is counted once: it has no second route, so its total is the sum
		// of the three balances and nothing else is claimed for it.
		{ id: 'cash', title: 'cashTitle', groups: [cash], difference: 0, ok: true },
		{
			id: 'operating',
			title: 'operatingTitle',
			groups: [operatingSheet, operatingActivity],
			difference: operatingSheet.total - operatingActivity.total,
			ok: operatingSheet.total === operatingActivity.total
		},
		{
			id: 'crf',
			title: 'crfTitle',
			groups: [crfSheet, crfActivity],
			difference: crfSheet.total - crfActivity.total,
			ok: crfSheet.total === crfActivity.total
		},
		{
			id: 'levy',
			title: 'levyTitle',
			groups: [levySheet, levyActivity],
			difference: levySheet.total - levyActivity.total,
			ok: levySheet.total === levyActivity.total
		},
		{
			id: 'budget',
			title: 'budgetTitle',
			groups: [budget],
			difference: budget.total,
			ok: budget.total === 0
		}
	];

	const checks: ReconCheck[] = [
		{ id: 'journal', ok: source.tie.journalOk },
		{
			id: 'entitlement',
			ok: units.reduce((sum, unit) => sum + unit.entitlement, 0) === TOTAL_ENTITLEMENT
		}
	];

	return {
		date: source.asOfLabel,
		sections,
		checks,
		ok: sections.every((section) => section.ok) && checks.every((check) => check.ok)
	};
}

/** The sample books' close, for the page and the tests. */
export const BOOK_RECONCILIATION = closeReconciliation(books);
