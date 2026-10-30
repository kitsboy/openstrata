import { describe, expect, it } from 'vitest';
import { BOOK_PAYABLES, payableRow, payablesSheet, type PayableBill } from './payables-sheet';

const bills: PayableBill[] = [
	{ vendor: 'Harbour Janitorial', memo: 'September clean', account: '6250', due: '2026-10-07', cents: 134_000 },
	{ vendor: 'Richmond Elevator', memo: 'Q3 maintenance', account: '6220', due: '2026-10-15', cents: 216_000 },
	{ vendor: 'CRA — source deductions', memo: 'September CPP and EI', account: '2100', due: '2026-10-15', cents: 11_710 },
	{ vendor: 'FortisBC', memo: 'September gas', account: '6120', due: '2026-10-20', cents: 28_000 }
];

describe('payables sheet', () => {
	it('counts each bill’s days from the close, not from today', () => {
		const row = payableRow(bills[0], '2026-09-30');
		expect(row.days).toBe(7);
		expect(row.overdue).toBe(false);
		// The same bill a week later is two days out, and the sheet never asks
		// the clock what day it is to work that out.
		expect(payableRow(bills[0], '2026-10-05').days).toBe(2);
	});

	it('prints a bill already past due as negative days, not as zero', () => {
		const late = payableRow({ ...bills[0], due: '2026-09-25' }, '2026-09-30');
		expect(late.days).toBe(-5);
		expect(late.overdue).toBe(true);

		const sheet = payablesSheet({ bills: [{ ...bills[0], due: '2026-09-25' }], asOf: '2026-09-30' });
		expect(sheet.overdueCount).toBe(1);
		expect(sheet.overdueCents).toBe(134_000);
		// An overdue bill is still inside the window: it is money that has already
		// come due, not money outside the thirty days.
		expect(sheet.within30Cents).toBe(134_000);
		expect(sheet.next).toBeNull();
	});

	it('makes the total the rows added up, and the windows cut from it', () => {
		const sheet = payablesSheet({ bills, asOf: '2026-09-30' });
		expect(sheet.totalCents).toBe(134_000 + 216_000 + 11_710 + 28_000);
		expect(sheet.totalCents).toBe(389_710);
		expect(sheet.within30Cents + sheet.beyondCents).toBe(sheet.totalCents);
		expect(sheet.ok).toBe(true);
	});

	it('cuts the window at the close plus thirty days and prints the date', () => {
		const far: PayableBill = { vendor: 'Insurance', memo: 'Renewal', account: '6100', due: '2026-11-02', cents: 486_000 };
		const sheet = payablesSheet({ bills: [...bills, far], asOf: '2026-09-30' });
		expect(sheet.windowEnd).toBe('2026-10-30');
		expect(sheet.within30Cents).toBe(389_710);
		expect(sheet.beyondCents).toBe(486_000);
		// A bill dated on the window's last day is inside it.
		const edge = payablesSheet({ bills: [{ ...far, due: '2026-10-30' }], asOf: '2026-09-30' });
		expect(edge.beyondCents).toBe(0);
		expect(edge.within30Cents).toBe(486_000);
	});

	it('reads earliest due first, and names the next bill that is not late', () => {
		const sheet = payablesSheet({ bills, asOf: '2026-09-30' });
		expect(sheet.rows.map((row) => row.vendor)).toEqual([
			'Harbour Janitorial',
			'CRA — source deductions',
			'Richmond Elevator',
			'FortisBC'
		]);
		expect(sheet.next?.vendor).toBe('Harbour Janitorial');
	});

	it('carries the book’s five bills and the CRA remittance, and they agree', () => {
		expect(BOOK_PAYABLES.rows).toHaveLength(6);
		expect(BOOK_PAYABLES.totalCents).toBe(650_000 + 11_710);
		expect(BOOK_PAYABLES.asOf).toBe('2026-09-30');
		expect(BOOK_PAYABLES.overdueCount).toBe(0);
		// The remittance is on 2100, and the sheet says so rather than treating
		// the CRA as one more vendor.
		expect(BOOK_PAYABLES.rows.find((row) => row.vendor.startsWith('CRA'))?.account).toBe('2100');
		expect(BOOK_PAYABLES.ok).toBe(true);
	});
});
