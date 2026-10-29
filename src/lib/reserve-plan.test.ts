import { describe, expect, it } from 'vitest';
import { reservePlan } from './reserve-plan';
import { reservePicture } from './demo/reserve';
import { books } from './demo/books';

const input = reservePicture.input;

describe('reservePlan', () => {
	it('draws five consecutive fiscal years from the year it starts', () => {
		const { rows } = reservePlan(input);
		expect(rows.map((row) => row.label)).toEqual([
			'2026–27',
			'2027–28',
			'2028–29',
			'2029–30',
			'2030–31'
		]);
	});

	it('starts on the fund the books report, not on an estimate', () => {
		const first = reservePlan(input).rows[0]!;
		expect(first.openingCents).toBe(books.crf.opening);
		expect(first.contributionCents).toBe(books.crfContributionAnnual);
		expect(first.spentCents).toBe(books.crf.spent);
		// $586,400 + $43,200 − $6,400 on the books, plus $4,476 of interest.
		expect(first.closingCents).toBe(62_767_552);
	});

	it('carries each closing balance into the next year', () => {
		const { rows } = reservePlan(input);
		for (const [index, row] of rows.entries()) {
			expect(row.closingCents).toBe(
				row.openingCents + row.contributionCents + row.interestCents - row.spentCents
			);
			if (index > 0) expect(row.openingCents).toBe(rows[index - 1]!.closingCents);
		}
	});

	it('pays each project in the fiscal year that ends in its calendar year', () => {
		const { rows } = reservePlan(input);
		const named = (label: string) =>
			rows.find((row) => row.label === label)?.projects.map((project) => project.year) ?? [];
		expect(named('2027–28')).toEqual([2028]);
		expect(named('2028–29')).toEqual([2029]);
		expect(named('2029–30')).toEqual([2030]);
		expect(named('2030–31')).toEqual([2031]);
		// And the first year has none of the report's projects in it.
		expect(rows[0]!.projects).toEqual([]);
	});

	it('runs past the fund at the roof and says which year', () => {
		const picture = reservePlan(input);
		const last = picture.rows.at(-1)!;
		expect(last.label).toBe('2030–31');
		expect(last.closingCents).toBe(-13_329_162);
		expect(last.short).toBe(true);
		expect(picture.firstShortfall?.label).toBe('2030–31');
		expect(picture.lowestCents).toBe(-13_329_162);
	});

	it('charges no interest on a year that ends below zero', () => {
		const last = reservePlan(input).rows.at(-1)!;
		expect(last.interestCents).toBe(0);
	});

	it('keeps the levy project out of the fund', () => {
		const picture = reservePlan(input);
		const labels = picture.rows.flatMap((row) => row.projects.map((project) => project.label));
		expect(labels).not.toContain('Parkade membrane');
		expect(picture.scheduledCents).toBe(94_500_000);
	});

	it('reports no shortfall over a window the fund covers', () => {
		const picture = reservePlan(input, 2);
		expect(picture.rows).toHaveLength(2);
		expect(picture.firstShortfall).toBeNull();
		expect(picture.lowestCents).toBeGreaterThan(0);
	});

	it('never returns an empty window', () => {
		expect(reservePlan(input, 0).rows).toHaveLength(1);
	});
});
