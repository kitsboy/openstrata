import { describe, expect, it } from 'vitest';
import { reserveStatement, shareByEntitlement } from './reserve-statement';
import { books } from './demo/books';
import { CRF_POINT_CENTS, depreciation, units } from './demo/building';
import { reservePlan } from './reserve-plan';
import { reservePicture } from './demo/reserve';

/**
 * The reserve contribution, owner by owner.
 *
 * Three things must be true of the sheet or it is misleading: the budget column
 * adds to the $43,200 the budget actually sets, the recommendation adds to the
 * report's $48,000 to the cent, and a lot's share follows its points rather than
 * an equal split.
 */
const plan = reservePlan(reservePicture.input);
const shortfall = plan.firstShortfall
	? { year: plan.firstShortfall.label, cents: -plan.firstShortfall.closingCents }
	: null;

const statement = reserveStatement({
	lots: units,
	crfPointCents: CRF_POINT_CENTS,
	recommendedAnnualCents: depreciation.recommendedAnnualCents,
	monthsElapsed: books.monthsElapsed,
	receivedCents: books.crf.contributions,
	arrearsCents: books.crf.ar,
	report: reservePicture.report,
	shortfall
});

describe('the reserve contribution statement', () => {
	it('builds the budget column from the rate the budget charges', () => {
		expect(statement.budgetAnnualCents).toBe(books.crfContributionAnnual);
		expect(statement.budgetAnnualCents).toBe(4_320_000);
		expect(statement.budgetPerPointAnnualCents).toBe(720);
	});

	it('allocates the report’s recommendation without losing a cent', () => {
		expect(statement.recommendedAnnualCents).toBe(depreciation.recommendedAnnualCents);
		expect(statement.recommendedAnnualCents).toBe(4_800_000);
		expect(statement.differenceCents).toBe(480_000);
		expect(statement.recommendedPerPointAnnualCents).toBe(800);
		expect(statement.underFunded).toBe(true);
	});

	it('gives a lot its own share by entitlement, not an equal split', () => {
		const studio = statement.rows.find((row) => row.unitId === '101')!;
		const corner = statement.rows.find((row) => row.unitId === '410')!;
		expect(studio.recommendedAnnualCents).toBe(studio.entitlement * 800);
		expect(corner.recommendedAnnualCents).toBe(corner.entitlement * 800);
		expect(corner.recommendedAnnualCents).toBeGreaterThan(studio.recommendedAnnualCents);
		// The per-row difference follows from the two annual figures.
		expect(studio.differenceCents).toBe(studio.recommendedAnnualCents - studio.budgetAnnualCents);
	});

	it('carries the fund’s real position beside the rate', () => {
		expect(statement.receivedCents).toBe(books.crf.contributions);
		expect(statement.arrearsCents).toBe(books.crf.ar);
		expect(statement.monthsElapsed).toBe(books.monthsElapsed);
		expect(statement.report).toEqual(reservePicture.report);
		// The sentence the AGM votes on: the plan first runs short in 2030–31.
		expect(statement.shortfall).toEqual({ year: '2030–31', cents: 13_329_162 });
	});

	it('allocates a total that does not divide, and keeps the same cent in place', () => {
		const lots = [
			{ id: 'a', entitlement: 1 },
			{ id: 'b', entitlement: 1 },
			{ id: 'c', entitlement: 1 }
		];
		const shares = shareByEntitlement(100, lots);
		expect(shares.reduce((sum, value) => sum + value, 0)).toBe(100);
		// The remainder goes to the first lot on a tie, every time.
		expect(shareByEntitlement(100, lots)).toEqual(shares);
		expect(shares).toEqual([34, 33, 33]);
	});

	it('does not divide a building with no points', () => {
		expect(shareByEntitlement(1000, [{ id: 'a', entitlement: 0 }])).toEqual([0]);
		const empty = reserveStatement({
			lots: [{ id: 'a', owner: 'A', entitlement: 0 }],
			crfPointCents: CRF_POINT_CENTS,
			recommendedAnnualCents: 1000,
			monthsElapsed: 0,
			receivedCents: 0,
			arrearsCents: 0,
			report: reservePicture.report,
			shortfall: null
		});
		expect(empty.rows[0].recommendedAnnualCents).toBe(0);
		expect(empty.underFunded).toBe(true);
	});
});
