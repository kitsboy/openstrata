/**
 * The inputs to the reserve fund's five-year picture.
 *
 * Every figure here is read off something the demo already says, so the
 * projection cannot quietly become a wish:
 *
 * - the opening balance, the annual contribution and this year's spend come from
 *   the fund statement in `books`;
 * - the interest rate comes from the six months the credit union actually paid,
 *   measured against the opening balance and doubled to a year;
 * - the projects come from the depreciation report in `building`, with the
 *   membrane kept out because the parkade levy paid for it;
 * - the recommended contribution is the report's own figure, so the page can
 *   state the gap against what the budget funds.
 *
 * The report labels its projects by calendar year ("2029 — elevator
 * modernization"). `reserve-plan` pays each one in the fiscal year that ends in
 * that calendar year, which is the only mapping that does not pay early.
 */

import { books } from './books';
import { building, depreciation } from './building';

/** The report's calendar-year projects. Its `2025–26` membrane is the levy's. */
const projects = depreciation.projects
	.filter((project) => /^\d{4}$/.test(project.year))
	.map((project) => ({
		year: Number(project.year),
		label: project.item,
		cents: project.cents
	}));

const levyProject = depreciation.projects.find((project) => project.year === '2025–26');

/**
 * Interest in basis points a year, from the half-year the statements cover:
 * `$2,180 / $586,400 × 2` is 0.7435%, rounded to 74 bps (0.74%). Measured against
 * the opening balance rather than an average, because that is the figure the
 * statement itself states.
 */
const annualRateBps = Math.round((books.crf.interest / books.crf.opening) * 2 * 10_000);

export const reservePicture = {
	input: {
		openingCents: books.crf.opening,
		annualContributionCents: books.crfContributionAnnual,
		spentThisYearCents: books.crf.spent,
		annualRateBps,
		startsAt: 2026,
		projects
	},
	/** The fund the statements were read at, for the interest note's date. */
	statementDate: building.asOf,
	report: {
		firm: depreciation.firm,
		dated: depreciation.dated,
		nextDue: depreciation.nextDue
	},
	recommendedAnnualCents: depreciation.recommendedAnnualCents,
	/** The levy's own project, deliberately outside the CRF projection. */
	levy: {
		label: levyProject?.item ?? 'Parkade membrane',
		cents: levyProject?.cents ?? 0
	}
};
