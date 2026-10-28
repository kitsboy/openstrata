/**
 * The link between a month on the health trend and the books.
 *
 * The trend panel's points are statement dates, so a click-through has to carry
 * a date and not a label: `/accounting?period=2026-09` means "the ladder as it
 * stood on 30 September", which is the same book the September point aged. Both
 * sides read this module, so the link the panel writes and the date the page
 * reads cannot disagree — a hard-coded `?month=` on one side and `?period=` on
 * the other would fail silently as an unfiltered page.
 *
 * Anything that is not a `YYYY-MM` month is rejected rather than guessed at. A
 * mistyped link opens the ordinary ladder, which is true, instead of a partial
 * month that would not be.
 */

import { dayIn } from './arrears';

/** The query parameter that carries a month into the books. */
export const PERIOD_PARAM = 'period';

export interface PeriodPoint {
	/** `YYYY-MM`. */
	period: string;
	/** The last day of that month — the statement date the books are aged at. */
	asOf: string;
}

/** A `YYYY-MM` query value as a statement date, or null when it is not a month. */
export function parsePeriod(value: string | null | undefined): PeriodPoint | null {
	if (!value) return null;
	const period = value.trim();
	if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(period)) return null;
	return { period, asOf: dayIn(period, 31) };
}

/** The accounting link for a month: the receipts ladder at that month end. */
export function accountingHref(period: string): string {
	return `/accounting?${PERIOD_PARAM}=${period}`;
}
