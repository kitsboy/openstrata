/**
 * The fiscal year as one wall chart.
 *
 * /calendar answers "what is on this month". A council pinning the year to the
 * wall needs the shape of the year instead: twelve months in one grid, the
 * statutory windows shaded so the long ones are visible beside the short ones,
 * and the dated items listed underneath so nothing is only a dot.
 *
 * Four rules keep it honest:
 *
 * 1. **The year is the fiscal year, and it is twelve real months.** April to
 *    March, each month as long as the calendar makes it — February 2027 has 28
 *    days — so the grid cannot imply a deadline on a day that does not exist.
 *
 * 2. **A window keeps its true dates even when the grid cannot draw all of it.**
 *    The energy performance report covers the calendar year, opening in January,
 *    so only 275 of its 365 days fall inside a fiscal year that starts in April.
 *    The sheet prints the window's own dates and the days of it this year holds,
 *    rather than shortening the rule to fit the page.
 *
 * 3. **The rhythm is not a deadline.** Fees due, the late fee, the council
 *    meeting, the bank reconciliation and the payroll remittance repeat every
 *    month; listing them forty times would bury the ten things a council has to
 *    do once. An item is rhythm when its title or its category-and-day-of-month
 *    repeats in six or more months of the year. Everything else is listed.
 *
 * 4. **Nothing dated is dropped.** Items after 31 March go in their own list
 *    below the AGM window — the meeting that approves the budget is the reason
 *    the year is being reviewed at all — instead of disappearing because the
 *    grid stops at the year end.
 *
 * Label-free by design: the caller supplies the translated window names, rules
 * and category labels, so this module is testable without a catalog.
 */

import { daysBetween } from './arrears';
import type { CalEvent } from './demo/schedule';

export const MONTHS_IN_FISCAL_YEAR = 12;
export const FISCAL_START_MONTH = 4;
/** A title or category-and-day repeated in this many months is the rhythm. */
export const RHYTHM_MONTHS = 6;

export type WindowId = 'payroll' | 'epr' | 't2' | 'svt' | 't4' | 'agm';

export interface StatutoryWindow {
	id: WindowId;
	/** First day the window is open. */
	from: string;
	/** Last lawful day. */
	to: string;
	/** Days in the window, both ends counted. */
	days: number;
}

export interface WindowGroup {
	id: WindowId;
	/** How many times the rule opens during the year: 12 for payroll. */
	count: number;
	/** The first opening and the last closing, as the rule itself states them. */
	from: string;
	to: string;
	/** Days in one window: 15 for payroll, 1 for a single-day deadline. */
	daysEach: number;
	/** Days of this rule that fall inside the fiscal year, all openings added. */
	days: number;
}

export interface FiscalMonth {
	year: number;
	month: number;
	days: number;
}

export interface DayCell {
	day: number;
	iso: string;
	/** The statutory windows open on this day, in group order. */
	windows: WindowId[];
	/** Dated items on this day, counted for the grid's mark. */
	items: number;
}

export interface CalendarRow {
	month: FiscalMonth;
	cells: DayCell[];
}

export interface YearCalendar {
	startYear: number;
	from: string;
	to: string;
	/** Days in the fiscal year. */
	days: number;
	rows: CalendarRow[];
	windows: WindowGroup[];
	afterWindows: WindowGroup[];
	/** The months the AGM window falls in, in the same shape as the year's rows. */
	afterRows: CalendarRow[];
	/** One-off dated items inside the year, in date order. */
	items: CalEvent[];
	/** One-off dated items after 31 March, in date order. */
	afterItems: CalEvent[];
	/** Days in the year carrying at least one listed item. */
	markedDays: number;
	/** Titles treated as the monthly rhythm and left out of the list. */
	rhythm: string[];
}

function iso(year: number, month: number, day: number): string {
	return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function daysInMonth(year: number, month: number): number {
	return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

/** April to March, in order, with each month's real length. */
export function fiscalMonths(startYear: number): FiscalMonth[] {
	const months: FiscalMonth[] = [];
	for (let index = 0; index < MONTHS_IN_FISCAL_YEAR; index += 1) {
		const offset = FISCAL_START_MONTH - 1 + index;
		const year = startYear + Math.floor(offset / 12);
		const month = (offset % 12) + 1;
		months.push({ year, month, days: daysInMonth(year, month) });
	}
	return months;
}

export function fiscalYear(startYear: number): { startYear: number; from: string; to: string; days: number } {
	const from = iso(startYear, 4, 1);
	const to = iso(startYear + 1, 3, 31);
	return { startYear, from, to, days: daysBetween(from, to) + 1 };
}

/**
 * The statutory windows the fiscal year opens. Payroll is one window a month;
 * the rest are the filings and declarations that hang off the year end.
 */
export function statutoryWindows(startYear: number): StatutoryWindow[] {
	const windows: StatutoryWindow[] = [];
	for (const month of fiscalMonths(startYear)) {
		const from = iso(month.year, month.month, 1);
		const to = iso(month.year, month.month, 15);
		windows.push({ id: 'payroll', from, to, days: daysBetween(from, to) + 1 });
	}
	// The report covers the calendar year, which opens before the fiscal year does.
	const eprFrom = iso(startYear, 1, 1);
	const eprTo = iso(startYear, 12, 31);
	windows.push({ id: 'epr', from: eprFrom, to: eprTo, days: daysBetween(eprFrom, eprTo) + 1 });
	// Six months after the 31 March year end this fiscal year is closing.
	const t2 = iso(startYear, 9, 30);
	windows.push({ id: 't2', from: t2, to: t2, days: 1 });
	// Declarations for the calendar year close at the end of the fiscal year.
	const svtFrom = iso(startYear + 1, 1, 1);
	const svtTo = iso(startYear + 1, 3, 31);
	windows.push({ id: 'svt', from: svtFrom, to: svtTo, days: daysBetween(svtFrom, svtTo) + 1 });
	const t4 = iso(startYear + 1, 2, 28);
	windows.push({ id: 't4', from: t4, to: t4, days: 1 });
	return windows;
}

/** The AGM window opens the day after the year ends and closes two months on. */
export function afterWindows(startYear: number): StatutoryWindow[] {
	const from = iso(startYear + 1, 4, 1);
	const to = iso(startYear + 1, 5, 31);
	return [{ id: 'agm', from, to, days: daysBetween(from, to) + 1 }];
}

const GROUP_ORDER: WindowId[] = ['payroll', 'epr', 't2', 'svt', 't4', 'agm'];

/** Overlap of a window with the fiscal year, both ends counted. */
export function daysInYear(window: StatutoryWindow, from: string, to: string): number {
	const start = window.from > from ? window.from : from;
	const end = window.to < to ? window.to : to;
	if (start > end) return 0;
	return daysBetween(start, end) + 1;
}

function groupWindows(
	windows: StatutoryWindow[],
	yearFrom: string,
	yearTo: string
): WindowGroup[] {
	const groups = new Map<WindowId, StatutoryWindow[]>();
	for (const window of windows) {
		const list = groups.get(window.id) ?? [];
		list.push(window);
		groups.set(window.id, list);
	}
	return GROUP_ORDER.filter((id) => groups.has(id)).map((id) => {
		const list = groups.get(id)!;
		const sorted = [...list].sort((a, b) => a.from.localeCompare(b.from));
		return {
			id,
			count: sorted.length,
			from: sorted[0].from,
			to: sorted[sorted.length - 1].to,
			daysEach: sorted[0].days,
			days: sorted.reduce((total, window) => total + daysInYear(window, yearFrom, yearTo), 0)
		};
	});
}

/** The windows open on a given day, in display order. */
export function windowsOn(date: string, windows: StatutoryWindow[]): WindowId[] {
	const ids = new Set<WindowId>();
	for (const window of windows) {
		if (date >= window.from && date <= window.to) ids.add(window.id);
	}
	return GROUP_ORDER.filter((id) => ids.has(id));
}

/**
 * The titles and category-day signatures that repeat every month. Fees due and
 * the late fee carry the month in their own title, so the signature catches
 * them; the council meeting and the reconciliation keep one title all year.
 */
export function rhythmTitles(events: readonly CalEvent[]): string[] {
	const byTitle = new Map<string, Set<string>>();
	const bySignature = new Map<string, Set<string>>();
	const remember = (map: Map<string, Set<string>>, key: string, month: string) => {
		const months = map.get(key) ?? new Set<string>();
		months.add(month);
		map.set(key, months);
	};
	for (const event of events) {
		const month = event.date.slice(0, 7);
		remember(byTitle, event.title, month);
		remember(bySignature, `${event.category}|${event.date.slice(8, 10)}`, month);
	}
	const rhythm = new Set<string>();
	for (const event of events) {
		const titleMonths = byTitle.get(event.title)?.size ?? 0;
		const signatureMonths = bySignature.get(`${event.category}|${event.date.slice(8, 10)}`)?.size ?? 0;
		if (titleMonths >= RHYTHM_MONTHS || signatureMonths >= RHYTHM_MONTHS) rhythm.add(event.title);
	}
	return [...rhythm].sort();
}

function monthRows(
	months: FiscalMonth[],
	windows: StatutoryWindow[],
	itemDays: Set<string>
): CalendarRow[] {
	return months.map((month) => {
		const cells: DayCell[] = [];
		for (let day = 1; day <= month.days; day += 1) {
			const date = iso(month.year, month.month, day);
			cells.push({
				day,
				iso: date,
				windows: windowsOn(date, windows),
				items: itemDays.has(date) ? 1 : 0
			});
		}
		return { month, cells };
	});
}

export function yearCalendar(startYear: number, events: readonly CalEvent[]): YearCalendar {
	const year = fiscalYear(startYear);
	const windows = statutoryWindows(startYear);
	const after = afterWindows(startYear);
	const rhythm = rhythmTitles(events);

	const oneOffs = events
		.filter((event) => !rhythm.includes(event.title))
		.slice()
		.sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title));

	const items = oneOffs.filter((event) => event.date >= year.from && event.date <= year.to);
	const afterItems = oneOffs.filter((event) => event.date > year.to);
	const itemDays = new Set(items.map((event) => event.date));

	const rows = monthRows(fiscalMonths(startYear), windows, itemDays);
	// The two months the AGM window covers, drawn under the year for the same reason.
	const afterMonths: FiscalMonth[] = [4, 5].map((month) => ({
		year: startYear + 1,
		month,
		days: daysInMonth(startYear + 1, month)
	}));

	return {
		startYear,
		from: year.from,
		to: year.to,
		days: year.days,
		rows,
		windows: groupWindows(windows, year.from, year.to),
		afterWindows: groupWindows(after, year.from, year.to),
		afterRows: monthRows(afterMonths, after, new Set()),
		items,
		afterItems,
		markedDays: itemDays.size,
		rhythm
	};
}
