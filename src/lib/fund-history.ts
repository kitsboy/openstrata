/**
 * The funds, month by month — what was in the bank at each month end.
 *
 * The funds tab used to say one true thing about a date it could not follow:
 * the balances were the 30 September close, whatever month the reader had come
 * from, because there was no month-by-month ledger behind them. The statements
 * do exist (`demo/cash`), so the cash lines can now be read at the month end the
 * health trend opened, and the three figures land on the close the rest of the
 * books report.
 *
 * Two limits are stated rather than papered over:
 *
 * - **Only cash follows the month.** Receivables, prepaids and payables are
 *   balances at the close, and the demo holds no monthly detail for them; the
 *   page says which lines moved and which did not.
 * - **A month with no statement is not a month with a zero.** A period the
 *   statements do not cover returns null, so the page can fall back to the close
 *   instead of printing an interpolation nobody signed.
 *
 * The change column is arithmetic, not a second record: it is this close minus
 * the one before it, or the fiscal opening for the first month. Six changes add
 * to what the year moved, which is the check a reader can do with a pencil.
 */

import { cashMonths, openingCash, type CashMonth } from './demo/cash';

export interface CashRow extends CashMonth {
	/** The three accounts added together, in cents. */
	total: number;
	/** Movement since the previous month end, or since 1 April for the first. */
	change: number;
}

const withTotals = (month: CashMonth, previous: { operating: number; crf: number; levy: number }): CashRow => {
	const total = month.operating + month.crf + month.levy;
	const before = previous.operating + previous.crf + previous.levy;
	return { ...month, total, change: total - before };
};

/** The statements, oldest first, each with its total and its movement. */
export function cashRows(): CashRow[] {
	let previous: CashMonth | typeof openingCash = openingCash;
	return cashMonths.map((month) => {
		const row = withTotals(month, previous);
		previous = month;
		return row;
	});
}

/** The three accounts at 1 April, before a month closed. */
export function openingTotal(): number {
	return openingCash.operating + openingCash.crf + openingCash.levy;
}

/**
 * The close for one `YYYY-MM` month, or null when the statements do not cover
 * it. A caller passes a period that already came from `parsePeriod`, so this
 * only has to match it — not validate it a second time.
 */
export function cashAt(period: string | null | undefined): CashRow | null {
	if (!period) return null;
	return cashRows().find((row) => row.period === period) ?? null;
}

/** The last close the statements hold — the month the books are written at. */
export function latestCash(): CashRow | null {
	return cashRows().at(-1) ?? null;
}
