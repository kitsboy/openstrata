import { describe, expect, it } from 'vitest';
import { cashAt, cashRows, latestCash, openingTotal } from './fund-history';
import { openingCash } from './demo/cash';
import { books } from './demo/books';
import { dayIn } from './arrears';

describe('the funds, month by month', () => {
	it('holds one close per fiscal month, oldest first', () => {
		const rows = cashRows();
		expect(rows.map((row) => row.period)).toEqual([
			'2026-04',
			'2026-05',
			'2026-06',
			'2026-07',
			'2026-08',
			'2026-09'
		]);
		for (const row of rows) {
			// A month end is the month's own last day, not a label: February 2028 is
			// the 29th, and the table's dates come from the same rule as the trend's.
			expect(row.asOf).toBe(dayIn(row.period, 31));
		}
	});

	it('closes September on the cash the funds tab reports', () => {
		const sept = latestCash()!;
		expect(sept.operating).toBe(books.operating.cash);
		expect(sept.crf).toBe(books.crf.cash);
		expect(sept.levy).toBe(books.levy.cash);
		expect(sept.total).toBe(books.operating.cash + books.crf.cash + books.levy.cash);
	});

	it('adds the three accounts on every row', () => {
		for (const row of cashRows()) {
			expect(row.total).toBe(row.operating + row.crf + row.levy);
		}
	});

	it('measures each change against the close before it', () => {
		const rows = cashRows();
		const first = rows[0];
		expect(first.change).toBe(first.total - openingTotal());
		// The first change is April's own: the close less the 1 April opening.
		expect(first.change).toBe(
			first.total - (openingCash.operating + openingCash.crf + openingCash.levy)
		);
		for (let index = 1; index < rows.length; index += 1) {
			expect(rows[index].change).toBe(rows[index].total - rows[index - 1].total);
		}
		// Six changes add to what the year moved — the check a reader can do.
		const moved = rows.reduce((sum, row) => sum + row.change, 0);
		expect(moved).toBe(rows.at(-1)!.total - openingTotal());
	});

	it('runs the levy trust through its own money', () => {
		// Collected before the fiscal year began, so 1 April is the collection itself.
		expect(openingCash.levy).toBe(books.levy.collected);
		const close = latestCash()!;
		// What is left is the collection less everything billed and paid to the project.
		expect(openingCash.levy - close.levy).toBe(books.levy.spent);
		expect(close.levy).toBe(books.levy.remaining - books.levy.owing);
	});

	it('answers for a month it holds and for one it does not', () => {
		// April is the month the data note claims: fee income less the expenses the
		// budget chart allocates to it, on the 1 April opening.
		expect(cashAt('2026-04')?.operating).toBe(openingCash.operating + 2_700_000 - 1_784_184);
		expect(cashAt('2026-04')?.crf).toBe(openingCash.crf + 360_000);
		// October has not closed, and no statement invents one.
		expect(cashAt('2026-10')).toBeNull();
		expect(cashAt('2026-13')).toBeNull();
		expect(cashAt('2026-4')).toBeNull();
		expect(cashAt('')).toBeNull();
		expect(cashAt(null)).toBeNull();
		expect(cashAt(undefined)).toBeNull();
	});
});
