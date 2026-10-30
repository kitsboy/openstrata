import { describe, expect, it } from 'vitest';
import { books } from './demo/books';
import { usedPercent, vendorSpend, type VendorContract } from './vendor-spend';

/**
 * The join between the contracts register and the expense budget.
 *
 * The sheet's whole value is that it cannot invent a figure: each vendor's money
 * is the books' own line for the year to date. These tests hold the four rules —
 * the line is the spend, one account belongs to one vendor, the rows plus the
 * unclaimed block are the budget, and levy money stays out of operating spend.
 */
const lines = books.expenses.map((line) => ({
	code: line.code,
	name: line.name,
	annualCents: line.annualCents,
	ytdCents: line.ytdCents,
	reason: line.reason
}));

const contracts: VendorContract[] = books.contracts.map((contract) => ({ ...contract }));

const spend = vendorSpend({
	lines,
	contracts,
	outsidePaid: { 'Seawall Membrane Co.': books.levy.spent }
});

describe('vendor spend', () => {
	it('pays every vendor from the books, not from the contract note', () => {
		const caretaker = spend.rows.find((row) => row.vendor === 'Bill Hargreaves')!;
		// The note says $3,000 a month; the line says six months of it.
		expect(caretaker.annualCents).toBe(3_600_000);
		expect(caretaker.ytdCents).toBe(1_800_000);
		expect(caretaker.leftCents).toBe(1_800_000);
		expect(usedPercent(caretaker)).toBe(50);
	});

	it('adds a vendor’s several codes into one employment', () => {
		const concierge = spend.rows.find((row) => row.vendor === 'Samira El-Masri')!;
		expect(concierge.lines.map((line) => line.code)).toEqual(['6210', '6215']);
		expect(concierge.annualCents).toBe(1_932_000);
		expect(concierge.ytdCents).toBe(102_168);
		// The books' reason travels with the row, so the page can say why.
		expect(concierge.reason).toBe('Started 1 September');
	});

	it('adds the contracted rows and the unclaimed lines back to the budget', () => {
		expect(spend.total.annualCents).toBe(books.expenseAnnual);
		expect(spend.total.ytdCents).toBe(books.expenseTotal);
		expect(spend.difference).toEqual({ annualCents: 0, ytdCents: 0, leftCents: 0 });
		// Eleven vendors have an operating line; the membrane contractor does not.
		expect(spend.rows).toHaveLength(11);
		expect(spend.unclaimedLines.length).toBeGreaterThan(0);
	});

	it('keeps the levy contractor outside the operating totals', () => {
		const membrane = spend.outside.find((row) => row.vendor === 'Seawall Membrane Co.')!;
		expect(membrane.fund).toBe('levy');
		expect(membrane.paidCents).toBe(books.levy.spent);
		expect(spend.rows.some((row) => row.vendor === 'Seawall Membrane Co.')).toBe(false);
		// Nothing on the operating page doubles-counts the levy's $176,400.
		expect(spend.total.ytdCents).toBe(books.expenseTotal);
	});

	it('refuses to pay one line to two vendors', () => {
		const doubled = vendorSpend({
			lines,
			contracts: [
				...contracts,
				{
					vendor: 'Second Caretaker Ltd.',
					service: 'Same line',
					renewal: 'Never',
					accounts: ['6200']
				}
			]
		});
		expect(doubled.duplicates).toEqual(['6200']);
		expect(doubled.rows.some((row) => row.vendor === 'Bill Hargreaves')).toBe(false);
		expect(doubled.rows.some((row) => row.vendor === 'Second Caretaker Ltd.')).toBe(false);
		// The contested line moves to the unclaimed block, so it prints once and the
		// page still balances — the defect is named, not counted twice.
		expect(doubled.unclaimedLines.map((line) => line.code)).toContain('6200');
		expect(doubled.difference).toEqual({ annualCents: 0, ytdCents: 0, leftCents: 0 });
	});

	it('names a contracted code the budget does not carry', () => {
		const missing = vendorSpend({
			lines,
			contracts: [
				...contracts,
				{ vendor: 'Ghost Co.', service: 'Nothing', renewal: 'Never', accounts: ['9999'] }
			]
		});
		expect(missing.missing).toEqual(['9999']);
		expect(missing.rows.some((row) => row.vendor === 'Ghost Co.')).toBe(false);
		expect(missing.difference.annualCents).toBe(0);
	});

	it('does not divide by a line with no budget', () => {
		const unbudgeted = vendorSpend({
			lines: [{ code: '6999', name: 'One-off', annualCents: 0, ytdCents: 5000 }],
			contracts: [
				{ vendor: 'One-off Co.', service: 'One job', renewal: 'None', accounts: ['6999'] }
			]
		});
		expect(unbudgeted.rows[0].usedShare).toBeNull();
		expect(usedPercent(unbudgeted.rows[0])).toBeNull();
		expect(unbudgeted.difference.ytdCents).toBe(0);
	});
});
