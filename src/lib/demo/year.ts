/**
 * The sample book's side of the annual page.
 *
 * Every figure here is an export from `demo/books`, `demo/health` or the
 * building, mapped into the shape `year-sheet.ts` expects — nothing is
 * calculated a second time. The health window is the exception, and it is
 * deliberately not in this file: the score follows a Form K recorded on a lot's
 * sheet, so the dashboard passes the six points it already computed rather than
 * letting a second copy of the score disagree with the gauge above it.
 */

import type { YearSheetInput } from '../year-sheet';
import { books } from './books';
import { building } from './building';
import { demoDeadlinesAt } from './health';

/**
 * The operating share of the fees is most of the year's income. The full-year
 * budget for it is the total fee budget less the reserve's share, because the two
 * are billed on one line to the owner and split in the books.
 */
const feesOperatingAnnual = books.feeAnnual - books.crfContributionAnnual;

export type YearBook = Omit<YearSheetInput, 'health'>;

export const yearBook: YearBook = {
	income: [
		{
			code: '7000',
			name: 'Strata fees — operating share',
			ytdCents: books.feesOperating,
			annualCents: feesOperatingAnnual
		},
		...books.incomeLines.map((line) => ({
			code: line.code,
			name: line.name,
			ytdCents: line.ytdCents,
			annualCents: line.annualCents
		}))
	],
	expense: books.expenses.map((line) => ({
		code: line.code,
		name: line.name,
		ytdCents: line.ytdCents,
		annualCents: line.annualCents
	})),
	funds: {
		operatingCents: books.operating.cash,
		reserveCents: books.crf.cash,
		levyCents: books.levy.cash
	},
	open: demoDeadlinesAt(building.asOf).map((item) => ({
		title: item.title,
		dueAt: item.dueAt,
		daysLeft: item.daysLeft
	}))
};
