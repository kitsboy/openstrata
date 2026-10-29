import { describe, expect, it } from 'vitest';
import { events, type CalEvent } from './demo/schedule';
import {
	RHYTHM_MONTHS,
	afterWindows,
	daysInMonth,
	fiscalMonths,
	fiscalYear,
	rhythmTitles,
	statutoryWindows,
	windowsOn,
	yearCalendar
} from './year-calendar';

const cal = yearCalendar(2026, events);

const cell = (iso: string) => {
	const row = cal.rows.find((candidate) => candidate.cells.some((day) => day.iso === iso));
	return row?.cells.find((day) => day.iso === iso);
};

describe('the fiscal year', () => {
	it('runs April to March, and counts its own days', () => {
		const year = fiscalYear(2026);
		expect(year.from).toBe('2026-04-01');
		expect(year.to).toBe('2027-03-31');
		// 2027 is not a leap year, so this year has 365 days and February has 28.
		expect(year.days).toBe(365);
	});

	it('draws twelve months in order, each as long as the calendar makes it', () => {
		const months = fiscalMonths(2026);
		expect(months).toHaveLength(12);
		expect(months[0]).toMatchObject({ year: 2026, month: 4, days: 30 });
		expect(months[11]).toMatchObject({ year: 2027, month: 3, days: 31 });
		expect(months[10]).toMatchObject({ year: 2027, month: 2, days: 28 });
		expect(months.reduce((sum, month) => sum + month.days, 0)).toBe(365);
		expect(daysInMonth(2028, 2)).toBe(29);
	});
});

describe('the statutory windows', () => {
	it('opens a payroll window every month, fifteen days each', () => {
		const payroll = cal.windows.find((window) => window.id === 'payroll')!;
		expect(payroll.count).toBe(12);
		expect(payroll.daysEach).toBe(15);
		expect(payroll.days).toBe(180);
		expect(payroll.from).toBe('2026-04-01');
		expect(payroll.to).toBe('2027-03-15');
		// The 16th is the day after the last lawful day; it is not shaded.
		expect(windowsOn('2026-04-15', statutoryWindows(2026))).toContain('payroll');
		expect(windowsOn('2026-04-16', statutoryWindows(2026))).not.toContain('payroll');
	});

	it('keeps a window’s own dates when the year only holds part of it', () => {
		const epr = cal.windows.find((window) => window.id === 'epr')!;
		// The report covers the calendar year, which opened before this fiscal year.
		expect(epr.from).toBe('2026-01-01');
		expect(epr.to).toBe('2026-12-31');
		expect(epr.daysEach).toBe(365);
		// 1 April to 31 December: 275 of those 365 days fall in this year.
		expect(epr.days).toBe(275);
		expect(cell('2026-04-01')?.windows).toContain('epr');
		expect(cell('2027-01-01')?.windows).not.toContain('epr');
	});

	it('holds the declarations to the year end and the filings to their own day', () => {
		const svt = cal.windows.find((window) => window.id === 'svt')!;
		expect(svt.from).toBe('2027-01-01');
		expect(svt.to).toBe('2027-03-31');
		expect(svt.daysEach).toBe(90);
		expect(svt.days).toBe(90);

		const t2 = cal.windows.find((window) => window.id === 't2')!;
		expect(t2.from).toBe('2026-09-30');
		expect(t2.daysEach).toBe(1);

		const t4 = cal.windows.find((window) => window.id === 't4')!;
		expect(t4.from).toBe('2027-02-28');
		expect(t4.daysEach).toBe(1);
		// The T4 is due in February, not on the 28th of every month.
		expect(cell('2026-09-28')?.windows).not.toContain('t4');
		expect(cell('2027-02-28')?.windows).toContain('t4');
	});

	it('shades every window open on a day, in one order', () => {
		// The T2 falls on the last day of September, after that month's payroll
		// window has closed.
		expect(cell('2026-09-30')?.windows).toEqual(['epr', 't2']);
		expect(cell('2026-06-10')?.windows).toEqual(['payroll', 'epr']);
		expect(cell('2027-02-10')?.windows).toEqual(['payroll', 'svt']);
	});

	it('puts the AGM window after the year, not inside it', () => {
		const agm = afterWindows(2026)[0];
		expect(agm).toMatchObject({ id: 'agm', from: '2027-04-01', to: '2027-05-31', days: 61 });
		// A window that opens the day after the year ends contributes nothing to it.
		expect(cal.afterWindows.find((window) => window.id === 'agm')?.days).toBe(0);
		expect(cal.windows.some((window) => window.id === 'agm')).toBe(false);
		expect(cal.rows.every((row) => row.cells.every((day) => !day.windows.includes('agm')))).toBe(
			true
		);
		// It is drawn on the two months it covers instead.
		expect(cal.afterRows.map((row) => [row.month.year, row.month.month])).toEqual([
			[2027, 4],
			[2027, 5]
		]);
		expect(cal.afterRows.every((row) => row.cells.every((day) => day.windows.includes('agm')))).toBe(
			true
		);
	});
});

describe('the tracked items', () => {
	it('leaves the monthly rhythm out of the list', () => {
		const rhythm = rhythmTitles(events);
		expect(RHYTHM_MONTHS).toBe(6);
		expect(rhythm).toContain('Council meeting');
		expect(rhythm).toContain('Bank reconciliation');
		expect(rhythm).toContain('Late fee attaches');
		// Fees due carry the month in their title, so the category-and-day
		// signature is what catches them.
		expect(rhythm).toContain('October 2026 strata fees due');
		expect(cal.items.some((item) => rhythm.includes(item.title))).toBe(false);
	});

	it('keeps a real one-off, with its date', () => {
		const fire = cal.items.find((item) => item.title === 'Fire inspection');
		expect(fire).toMatchObject({ date: '2026-10-08', category: 'maintenance' });
		// Listed once, not once per month it is not happening.
		expect(cal.items.filter((item) => item.title === 'Fire inspection')).toHaveLength(1);
	});

	it('lists the year in date order and stops at the year end', () => {
		expect(cal.items.length).toBeGreaterThan(10);
		const dates = cal.items.map((item) => item.date);
		expect([...dates].sort()).toEqual(dates);
		expect(cal.items.every((item) => item.date >= '2026-04-01' && item.date <= '2027-03-31')).toBe(
			true
		);
		expect(cal.items.map((item) => item.title)).toContain('Fiscal year end');
	});

	it('drops nothing dated: what is after the year is listed after it', () => {
		const oneOffs = events.filter((event) => !rhythmTitles(events).includes(event.title));
		expect(cal.items.length + cal.afterItems.length).toBe(oneOffs.length);
		// The meeting that approves this year's budget follows the year end.
		const agm = cal.afterItems.find((item) => item.title === 'AGM');
		expect(agm?.date).toBe('2027-05-19');
		expect(cal.afterItems.map((item) => item.date)).toEqual(
			[...cal.afterItems.map((item) => item.date)].sort()
		);
	});

	it('marks the days it lists, and only those', () => {
		const days = new Set(cal.items.map((item) => item.date));
		expect(cal.markedDays).toBe(days.size);
		expect(cal.rows.flatMap((row) => row.cells).filter((day) => day.items === 1)).toHaveLength(
			days.size
		);
		expect(cell('2026-10-08')?.items).toBe(1);
		expect(cell('2026-10-09')?.items).toBe(0);
	});
});

describe('a year with nothing on it', () => {
	const quiet = yearCalendar(2026, [] as CalEvent[]);

	it('still prints twelve months and the windows', () => {
		expect(quiet.rows).toHaveLength(12);
		expect(quiet.windows).toHaveLength(5);
		expect(quiet.items).toHaveLength(0);
		expect(quiet.markedDays).toBe(0);
	});
});
