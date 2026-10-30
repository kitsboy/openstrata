import { describe, expect, it } from 'vitest';
import { fireEvent, render } from '@testing-library/svelte';
import Calendar from './+page.svelte';

/**
 * The calendar page's printed artifact: the fiscal year on one sheet.
 *
 * The month view above it is the workspace, and it stays on screen. This test is
 * about the paper — twelve month rows, the windows shaded from real dates, the
 * rhythm left out of the item list, and the AGM window drawn after the year
 * rather than dropped because the grid stops on 31 March.
 */
function sheet_() {
	const { container } = render(Calendar);
	// The month view above is the workspace; every assertion here is about the
	// paper, so the text is read from the sheet alone.
	return { sheet: container.querySelector('.year-cal-doc') as HTMLElement, container };
}

describe('/calendar year sheet', () => {
	it('draws the fiscal year as twelve month rows of real days', () => {
		const { sheet } = sheet_();
		const rows = sheet.querySelectorAll('.year-grid tbody tr');
		// Twelve months on the year, plus the two-month AGM strip below it.
		expect(rows.length).toBe(14);
		const apr = rows[0].querySelectorAll('td');
		expect(apr.length).toBe(31);
		// April has 30 days, so the 31st column is blank rather than a 31st of April.
		expect(apr[29].textContent?.trim()).toBe('30');
		expect(apr[30].classList.contains('blank')).toBe(true);
		// February 2027 has 28 days, and the last three columns are blank.
		const feb = rows[10].querySelectorAll('td');
		expect(feb[27].textContent?.trim()).toBe('28');
		expect([...feb].slice(28).every((cell) => cell.classList.contains('blank'))).toBe(true);
	});

	it('shades the windows from their own dates, not from a status field', () => {
		const { sheet } = sheet_();
		const apr = [...sheet.querySelectorAll('.year-grid tbody tr')[0].querySelectorAll('td')];
		// The first payroll window runs 1–15 April; the 16th is already outside it.
		expect(apr[0].classList.contains('w-payroll')).toBe(true);
		expect(apr[14].classList.contains('w-payroll')).toBe(true);
		expect(apr[15].classList.contains('w-payroll')).toBe(false);
		// The EPR covers the calendar year, so April is inside it.
		expect(apr[0].classList.contains('w-epr')).toBe(true);
		// The T2's own day is the last of September, drawn as a deadline.
		const sep = [...sheet.querySelectorAll('.year-grid tbody tr')[5].querySelectorAll('td')];
		expect(sep[29].classList.contains('deadline')).toBe(true);
		expect(sep[28].classList.contains('deadline')).toBe(false);
	});

	it('states each window’s true span and the days of it this year holds', () => {
		const { sheet } = sheet_();
		const text = sheet.textContent ?? '';
		expect(text).toContain('Payroll remittance');
		expect(text).toContain('Apr 1, 2026 to Mar 15, 2027, 12 windows of 15 days each');
		// The EPR opened in January; only 275 of its 365 days fall in this year.
		expect(text).toContain('Jan 1, 2026 – Dec 31, 2026');
		expect(text).toContain('275 of 365 days in this year');
		// A window the year holds whole does not need a second count.
		expect(text).toContain('Jan 1, 2027 – Mar 31, 2027');
		expect(text).not.toContain('90 of 90');
	});

	it('draws the AGM window after the year instead of losing it', () => {
		const { sheet } = sheet_();
		const text = sheet.textContent ?? '';
		expect(text).toContain('After the year: the AGM window');
		expect(text).toContain('Apr 1, 2027 – May 31, 2027');
		expect(text).toContain('61 days');
		// Its dates are listed, not swallowed by the 31 March cut-off.
		expect(text).toContain('May 19, 2027');
		expect(text).toContain('Last day to hold the AGM');
		expect(text).toContain('Depreciation report still current');
	});

	it('lists the dated items and leaves the monthly rhythm out', () => {
		const { sheet } = sheet_();
		const text = sheet.textContent ?? '';
		expect(text).toContain('Dated items (18)');
		expect(text).toContain('Fire inspection');
		expect(text).toContain('Fiscal year end');
		expect(text).toContain('T2 and T1044');
		// The five monthly series are the grid's rhythm, not separate deadlines.
		expect(text).not.toContain('Council meeting');
		expect(text).not.toContain('strata fees due');
		expect(text).not.toContain('Bank reconciliation');
	});

	it('keeps the month view and the print control off the paper', () => {
		const { container } = sheet_();
		const controls = [...container.querySelectorAll('.no-print')].map(
			(node) => node.textContent ?? ''
		);
		expect(controls.some((text) => text.includes('Print this year'))).toBe(true);
		expect(controls.some((text) => text.includes('September 2026'))).toBe(true);
		// The sheet itself is not hidden from the printer.
		expect(container.querySelector('.year-cal-doc')?.closest('.no-print')).toBeNull();
	});

	it('prints the fiscal year the building reports, whatever month is open', () => {
		const { sheet } = sheet_();
		const text = sheet.textContent ?? '';
		expect(text).toContain('April 1, 2026 – March 31, 2027');
		expect(text).toContain('365 days');
	});
});

/**
 * The renewals the registers carry dates for, behind a button.
 *
 * The year sheet is the calendar's own paper, so opening the renewals takes it
 * off the page rather than printing two artifacts from one press. The dates are
 * the contracts register's and the insurance record's; the test reads them back
 * to prove the sheet is the register's arithmetic and not a second list.
 */
describe('/calendar renewals', () => {
	async function open(container: HTMLElement, label: string) {
		const button = [...container.querySelectorAll('button')].find(
			(node) => node.textContent?.trim() === label
		);
		expect(button).toBeTruthy();
		await fireEvent.click(button as HTMLElement);
	}

	it('opens on the eight dated renewals and closes the year sheet', async () => {
		const { container } = render(Calendar);
		await open(container, 'Renewals ahead');

		expect(container.querySelector('.year-cal-doc')).toBeNull();
		const sheet = container.querySelector('.renewal-cal-doc')!;
		expect(sheet).toBeTruthy();
		const text = sheet.textContent ?? '';
		expect(text).toContain('OS-RC-2026-09');
		expect(text).toContain('Coast Fire Protection');
		expect(text).toContain('Oct 8, 2026');
		expect(text).toContain('8 days');
		expect(text).toContain('Apr 1, 2027');
		expect(text).toContain('6 renewals and 2 dated steps');
	});

	it('lists the contracts with no day apart instead of inventing one', async () => {
		const { container } = render(Calendar);
		await open(container, 'Renewals ahead');
		const text = container.querySelector('.renewal-cal-doc')?.textContent ?? '';
		expect(text).toContain('No day in the register');
		expect(text).toContain('Harbour Janitorial');
		expect(text).toContain('Month to month');
		expect(text).toContain('Step');
	});

	it('goes back to the year', async () => {
		const { container } = render(Calendar);
		await open(container, 'Renewals ahead');
		await open(container, 'Back to the year');
		expect(container.querySelector('.renewal-cal-doc')).toBeNull();
		expect(container.querySelector('.year-cal-doc')).toBeTruthy();
	});
});
