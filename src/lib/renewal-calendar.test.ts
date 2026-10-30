import { describe, expect, it } from 'vitest';
import { addDays } from './arrears';
import { contracts } from './demo/books';
import { building } from './demo/building';
import { INSURANCE_STEPS, renewalItems, renewalYear } from './demo/renewals';
import { events } from './demo/schedule';
import { renewalCalendar, type RenewalItem } from './renewal-calendar';

const asOf = '2026-09-30';
const year = renewalYear(asOf);

/** One item, so a rule can be watched on its own without the register around it. */
const item = (over: Partial<RenewalItem> = {}): RenewalItem => ({
	id: 'x',
	vendor: 'Test Vendor',
	service: 'Test service',
	dateIso: '2027-01-15',
	kind: 'renewal',
	line: '6100',
	...over
});

const monthNames = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December'
];

function longDate(iso: string): string {
	const month = monthNames[Number(iso.slice(5, 7)) - 1];
	return `${month} ${Number(iso.slice(8, 10))}, ${iso.slice(0, 4)}`;
}

describe('renewalCalendar', () => {
	it('runs twelve months from the statement date, both ends counted', () => {
		expect(year.asOf).toBe(asOf);
		expect(year.windowEnd).toBe('2027-09-30');
		expect(year.windowDays).toBe(365);
	});

	it('puts the next twelve months in date order, with the days each has left', () => {
		expect(year.rows.map((row) => [row.dateIso, row.daysLeft])).toEqual([
			['2026-10-08', 8],
			['2026-10-22', 22],
			['2026-11-30', 61],
			['2026-12-31', 92],
			['2027-01-20', 112],
			['2027-01-31', 123],
			['2027-03-31', 182],
			['2027-04-01', 183]
		]);
		expect(year.next?.vendor).toBe('Coast Fire Protection');
		expect(year.next?.daysLeft).toBe(8);
	});

	it('keeps a step apart from a renewal that renews a contract', () => {
		expect(year.renewals).toBe(6);
		expect(year.steps).toBe(INSURANCE_STEPS.length);
		expect(year.rows.filter((row) => row.kind === 'step').map((row) => row.dateIso)).toEqual([
			'2026-10-22',
			'2027-01-20'
		]);
	});

	it('gives no date to a contract the register leaves open', () => {
		const open = contracts
			.filter((contract) => contract.renewalIso === null)
			.map((contract) => contract.vendor)
			.sort((a, b) => a.localeCompare(b));
		expect(year.continuing.map((row) => row.vendor).sort((a, b) => a.localeCompare(b))).toEqual(
			open
		);
		// Nothing without a day ever appears in the countdown.
		expect(year.rows.every((row) => row.dateIso !== null)).toBe(true);
		expect(year.continuing).toHaveLength(6);
	});

	it('counts a renewal due on the statement date as due today, not late', () => {
		const today = renewalCalendar([item({ dateIso: asOf })], asOf);

		expect(today.rows).toHaveLength(1);
		expect(today.rows[0].daysLeft).toBe(0);
		expect(today.passed).toHaveLength(0);
	});

	it('moves a date that has gone by out of the countdown', () => {
		const stale = renewalCalendar([item({ dateIso: '2026-09-24' })], asOf);

		expect(stale.rows).toHaveLength(0);
		expect(stale.next).toBeNull();
		expect(stale.passed).toEqual([{ ...item({ dateIso: '2026-09-24' }), daysAgo: 6 }]);
	});

	it('carries a renewal beyond the window instead of dropping it', () => {
		const inside = renewalCalendar([item({ dateIso: '2027-09-30' })], asOf);
		const beyond = renewalCalendar(
			[item({ dateIso: addDays('2027-09-30', 1) }), item({ id: 'y', dateIso: '2028-04-01' })],
			asOf
		);

		expect(inside.rows).toHaveLength(1);
		expect(beyond.rows).toHaveLength(0);
		expect(beyond.later).toHaveLength(2);
	});

	it('prints a row with no account and counts it as unfunded', () => {
		const one = renewalCalendar([item({ line: null })], asOf);

		expect(one.rows).toHaveLength(1);
		expect(one.unfunded).toBe(1);
	});

	it('orders a renewal before a step that falls on the same day', () => {
		const sameDay = renewalCalendar(
			[
				item({ id: 'step', vendor: 'A Vendor', kind: 'step' }),
				item({ id: 'renewal', vendor: 'Z Vendor', kind: 'renewal' })
			],
			asOf
		);

		expect(sameDay.rows.map((row) => row.id)).toEqual(['renewal', 'step']);
	});

	it('reads the same day the register wrote in prose', () => {
		for (const contract of contracts) {
			if (contract.renewalIso === null) continue;
			expect(contract.renewal).toContain(longDate(contract.renewalIso));
		}
	});

	it('keeps the marketing step on the calendar the reader already has', () => {
		const marketing = INSURANCE_STEPS.find((step) => step.id.startsWith('marketing'));
		expect(marketing?.dateIso).toBe('2027-01-20');
		expect(events.some((event) => event.date === marketing?.dateIso)).toBe(true);
	});

	it('accounts for every item exactly once', () => {
		const total =
			year.rows.length + year.continuing.length + year.passed.length + year.later.length;
		expect(total).toBe(renewalItems.length);
		expect(renewalItems).toHaveLength(contracts.length + INSURANCE_STEPS.length);
		expect(building.insurance.renewalIso).toBe('2027-04-01');
	});
});
