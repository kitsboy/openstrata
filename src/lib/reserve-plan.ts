/**
 * The reserve fund, five years out.
 *
 * The funds tab reports this fiscal year: what came in, what was paid, what is
 * left. That answers a reader's question about today. It does not answer the one
 * a council is actually accountable for — whether the fund can pay for what the
 * depreciation report says the building needs. This module is that second
 * question, as arithmetic a reader can follow:
 *
 *   opening + contributions + interest − what the report schedules = the balance
 *
 * Four rules, each of them a decision rather than a formula:
 *
 * 1. **The contribution is the budget's, not the report's recommendation.** The
 *    council set $43,200 a year; the report recommends $48,000. Projecting the
 *    recommended figure would draw a fund the building does not have, so the
 *    table shows what the budget actually funds and the page states the gap.
 * 2. **Interest is the rate the credit union paid, on the average balance.** The
 *    rate arrives in basis points, derived from the six months of statements
 *    already in `demo/cash`; it is not a hope about future rates. A year that
 *    ends below zero earns nothing — a fund cannot collect interest it does not
 *    have.
 * 3. **A project named for a calendar year is spent in the fiscal year that ends
 *    in it.** The report says "2029 — elevator modernization"; the fiscal year
 *    ending 31 March 2029 is 2028–29, and that is the row it lands in. The
 *    alternative — matching the label's four digits to the row's first year —
 *    would pay for the elevator twelve months early.
 * 4. **The levy's project stays out of the fund.** The parkade membrane is the
 *    special levy's, collected and spent in a separate trust. Sweeping it into
 *    the CRF would double-count money that never entered it, so the membrane is
 *    excluded here and named in a note instead.
 *
 * The result is allowed to be negative. A five-year picture whose whole job is
 * to show whether the fund covers the plan must be able to say "no", and the
 * first year that turns is returned separately so the page can lead with it.
 */

/** One project the depreciation report schedules, in the calendar year it names. */
export interface PlannedProject {
	/** Calendar year the report names the project for. */
	year: number;
	label: string;
	cents: number;
}

export interface ReserveInput {
	/** The fund's balance at the start of the first fiscal year. */
	openingCents: number;
	/** What the budget puts in each year. */
	annualContributionCents: number;
	/** What this fiscal year has already paid out, from the books. */
	spentThisYearCents: number;
	/** Annual interest rate in basis points, as the statements actually paid it. */
	annualRateBps: number;
	/** The fiscal year the picture starts, e.g. 2026 for 2026–27. */
	startsAt: number;
	projects: PlannedProject[];
}

export interface ReserveYear {
	/** First calendar year of the fiscal year, e.g. 2026. */
	startYear: number;
	/** `2026–27`. */
	label: string;
	openingCents: number;
	contributionCents: number;
	interestCents: number;
	/** Projects from the report paid in this fiscal year. */
	projects: PlannedProject[];
	/** The project spend alone, so the row can show what left and why. */
	projectCents: number;
	/** Everything paid out this year, project spend plus what the books already paid. */
	spentCents: number;
	closingCents: number;
	/** The year ends below zero. */
	short: boolean;
}

export interface ReservePicture {
	/** Oldest first. */
	rows: ReserveYear[];
	/** The first year the plan runs the fund past zero, or null when it never does. */
	firstShortfall: ReserveYear | null;
	/** The lowest closing balance in the window; negative when the plan runs short. */
	lowestCents: number;
	/** What the report schedules inside the window, all projects. */
	scheduledCents: number;
}

const label = (startYear: number): string => `${startYear}–${String(startYear + 1).slice(-2)}`;

/** The picture, oldest fiscal year first. `years` is floored at one. */
export function reservePlan(input: ReserveInput, years = 5): ReservePicture {
	const count = Math.max(1, Math.floor(years));
	const rate = input.annualRateBps / 10_000;
	const rows: ReserveYear[] = [];
	let opening = input.openingCents;

	for (let index = 0; index < count; index += 1) {
		const startYear = input.startsAt + index;
		// A project for calendar year Y is paid in the fiscal year ending in Y.
		const projects = input.projects.filter((project) => project.year === startYear + 1);
		const projectCents = projects.reduce((sum, project) => sum + project.cents, 0);
		const spentCents = projectCents + (index === 0 ? input.spentThisYearCents : 0);
		const contributionCents = input.annualContributionCents;

		const beforeInterest = opening + contributionCents - spentCents;
		const interestCents =
			beforeInterest > 0 ? Math.round(((opening + beforeInterest) / 2) * rate) : 0;
		const closingCents = beforeInterest + interestCents;

		rows.push({
			startYear,
			label: label(startYear),
			openingCents: opening,
			contributionCents,
			interestCents,
			projects,
			projectCents,
			spentCents,
			closingCents,
			short: closingCents < 0
		});

		opening = closingCents;
	}

	return {
		rows,
		firstShortfall: rows.find((row) => row.short) ?? null,
		lowestCents: Math.min(...rows.map((row) => row.closingCents)),
		scheduledCents: rows.reduce((sum, row) => sum + row.projectCents, 0)
	};
}
