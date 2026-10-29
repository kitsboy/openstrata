/**
 * The budget as one printed page.
 *
 * The Budget tab on /accounting shows the annual figure, the year to date and
 * what is left. A council reviewing the plan against the actuals needs a fourth
 * number — how far the year has run from the plan — and needs it on paper, at
 * the meeting, where the books are not open. This module is that page, with four
 * rules that keep it honest:
 *
 * 1. **The plan to date is the annual budget pro-rated over the fiscal year, not
 *    the whole annual figure.** The books stop six months into a twelve-month
 *    year, so every line's plan is six twelfths of its budget. Comparing nine
 *    months of actuals to twelve months of plan would make every line look
 *    under, and a variance nobody can trust is worse than no column at all.
 *
 * 2. **Variance is always year to date less plan to date**, and its sign means
 *    the same thing on every row; only the verdict changes with the side of the
 *    page. Spending over plan is unfavourable, income over plan is favourable,
 *    and exactly on plan is stated as such rather than printed as `$0.00`.
 *
 * 3. **The reserve contribution carries no verdict.** It sits with the expenses
 *    because that is where the budget puts it, but a fund ahead of its
 *    contribution is a council decision, not a slip — so the row is marked `na`
 *    instead of being called favourable or unfavourable.
 *
 * 4. **The groups add up to the result.** Every column of every group totals its
 *    own rows, and the result is the sum of the three group totals rather than a
 *    fresh division — so a reader who adds the page up lands on the number the
 *    page prints, to the cent.
 *
 * 5. **A reason belongs to a variance that exists.** The books carry a phrase for
 *    some lines — the concierge's September start, the inspection still ahead —
 *    and the sheet prints it beside the variance, because "how much" without "why"
 *    is the half of the story a council ends up arguing about. A line exactly on
 *    plan drops its reason: printing one there would suggest a move that did not
 *    happen. The reserve contribution drops it too, for the same reason it carries
 *    no verdict — it is a decision, not a variance.
 *
 * Label-free by design: the caller supplies the translated account names and the
 * fiscal year, so this module is testable without a catalog.
 */

import type { LedgerLine } from './demo/books';

/** The fiscal year is twelve months, whatever the calendar says. */
export const MONTHS_IN_YEAR = 12;

export type BudgetSide = 'income' | 'expense' | 'reserve';

/**
 * `na` is not a fourth verdict: it says this row is a decision rather than a
 * plan to be measured. Only the reserve contribution uses it today.
 */
export type VarianceTone = 'favourable' | 'unfavourable' | 'on' | 'na';

export interface BudgetSheetRow {
	code: string;
	name: string;
	/** The approved budget for the full year. */
	annualCents: number;
	/** Actual for the year to date. */
	ytdCents: number;
	/** Annual less actual; negative when the line has run past its budget. */
	leftCents: number;
	/** The annual budget pro-rated to the months the books cover. */
	planToDateCents: number;
	/** Year to date less plan to date. */
	varianceCents: number;
	tone: VarianceTone;
	/** Why the line sits where it does, when the books say and the line moved. */
	reason?: string;
}

export interface BudgetGroup {
	id: BudgetSide;
	rows: BudgetSheetRow[];
	annualCents: number;
	ytdCents: number;
	leftCents: number;
	planToDateCents: number;
	varianceCents: number;
}

export interface BudgetResult {
	annualCents: number;
	ytdCents: number;
	leftCents: number;
	planToDateCents: number;
	varianceCents: number;
	tone: VarianceTone;
}

export interface BudgetSheet {
	monthsElapsed: number;
	monthsInYear: number;
	income: BudgetGroup;
	expense: BudgetGroup;
	reserve: BudgetGroup;
	result: BudgetResult;
}

export interface BudgetSource {
	/** Months of the fiscal year the books cover, 0–12. */
	monthsElapsed: number;
	income: readonly LedgerLine[];
	expense: readonly LedgerLine[];
	reserve: LedgerLine;
}

/** A source with a month count outside the fiscal year is held to it. */
export function clampMonths(months: number): number {
	if (!Number.isFinite(months)) return 0;
	return Math.min(MONTHS_IN_YEAR, Math.max(0, Math.trunc(months)));
}

/** The annual figure pro-rated to the months the books cover, in whole cents. */
export function planToDateCents(annualCents: number, monthsElapsed: number): number {
	return Math.round((annualCents * clampMonths(monthsElapsed)) / MONTHS_IN_YEAR);
}

/**
 * The verdict on a variance, given which side of the page the line sits on.
 * `varianceCents` is year to date less plan to date, so more spend than planned
 * is positive on the expense side and that is the unfavourable direction.
 */
export function varianceTone(side: BudgetSide, varianceCents: number): VarianceTone {
	if (side === 'reserve') return 'na';
	if (varianceCents === 0) return 'on';
	if (side === 'expense') return varianceCents < 0 ? 'favourable' : 'unfavourable';
	return varianceCents > 0 ? 'favourable' : 'unfavourable';
}

function sheetRow(side: BudgetSide, line: LedgerLine, monthsElapsed: number): BudgetSheetRow {
	const plan = planToDateCents(line.annualCents, monthsElapsed);
	const variance = line.ytdCents - plan;
	const tone = varianceTone(side, variance);
	// A reason is printed only where there is a move to explain: an on-plan line
	// and the reserve contribution keep their silence rather than implying one.
	const reason =
		(tone === 'favourable' || tone === 'unfavourable') && line.reason?.trim()
			? line.reason.trim()
			: undefined;
	return {
		code: line.code,
		name: line.name,
		annualCents: line.annualCents,
		ytdCents: line.ytdCents,
		leftCents: line.annualCents - line.ytdCents,
		planToDateCents: plan,
		varianceCents: variance,
		tone,
		reason
	};
}

function group(id: BudgetSide, rows: BudgetSheetRow[]): BudgetGroup {
	return {
		id,
		rows,
		annualCents: rows.reduce((sum, row) => sum + row.annualCents, 0),
		ytdCents: rows.reduce((sum, row) => sum + row.ytdCents, 0),
		leftCents: rows.reduce((sum, row) => sum + row.leftCents, 0),
		planToDateCents: rows.reduce((sum, row) => sum + row.planToDateCents, 0),
		varianceCents: rows.reduce((sum, row) => sum + row.varianceCents, 0)
	};
}

/**
 * The printed sheet. Rows keep the order the caller supplies, because that is
 * the order the budget was adopted in; the sheets here are statement order, not
 * alphabetical.
 */
export function budgetSheet(source: BudgetSource): BudgetSheet {
	const months = clampMonths(source.monthsElapsed);
	const income = group(
		'income',
		source.income.map((line) => sheetRow('income', line, months))
	);
	const expense = group(
		'expense',
		source.expense.map((line) => sheetRow('expense', line, months))
	);
	const reserve = group('reserve', [sheetRow('reserve', source.reserve, months)]);

	// The result is the three groups added, never a fourth division of its own:
	// a reader who adds the page up must land on this row.
	const annualCents = income.annualCents - expense.annualCents - reserve.annualCents;
	const ytdCents = income.ytdCents - expense.ytdCents - reserve.ytdCents;
	const planToDate = income.planToDateCents - expense.planToDateCents - reserve.planToDateCents;
	const variance = ytdCents - planToDate;

	return {
		monthsElapsed: months,
		monthsInYear: MONTHS_IN_YEAR,
		income,
		expense,
		reserve,
		result: {
			annualCents,
			ytdCents,
			leftCents: annualCents - ytdCents,
			planToDateCents: planToDate,
			varianceCents: variance,
			// A surplus above plan is the favourable direction, which is the
			// income side's rule; the result is an inflow, not an outflow.
			tone: varianceTone('income', variance)
		}
	};
}
