/**
 * The building’s insurance, on one page, with the dates a council has to act on.
 *
 * The policy lives in the building’s record and the premium lives in the budget,
 * and the two are never shown together: a treasurer answers a broker’s question
 * from memory and a reader cannot tell what the deductible is beyond “high”. This
 * module joins them, and five rules keep the page honest:
 *
 * 1. **The premium is the budget’s own line.** A certificate that quotes a
 *    premium the budget does not carry is a number nobody can tie out, so the
 *    policy’s premium is checked against account 6100 and a difference prints on
 *    the sheet rather than being smoothed away.
 *
 * 2. **What has been expensed is the ledger’s, and the accrual is checked
 *    against it.** The premium is spread evenly across the term; the months
 *    elapsed should reach the year-to-date figure, and a month that does not
 *    prints as a defect instead of an average.
 *
 * 3. **A deductible written as a formula stays a formula.** The earthquake
 *    deductible is a percentage of the insured value with a floor. The books
 *    carry no insured value — the appraisal is booked, not done — so the page
 *    prints the rate and the floor and says plainly that the dollar figure is
 *    not available. Inventing an insured value to produce a number would be the
 *    one dishonest line on the page.
 *
 * 4. **The appraisal precedes the renewal marketing.** The broker markets the
 *    renewal in January for an April 1 start, and an appraisal booked after that
 *    leaves the renewal priced off an old value. The page prints the days to each
 *    and names the order.
 *
 * 5. **The term runs with the fiscal year.** A policy that ends away from the
 *    fiscal year end leaves months of cover the budget does not carry, so the
 *    mismatch is printed rather than assumed impossible.
 */

import { daysBetween } from './arrears';

export interface QuakeDeductible {
	/** The percentage of the insured value, in basis points (1000 = 10%). */
	rateBps: number;
	/** The floor the policy puts under the percentage, in cents. */
	minimumCents: number;
	/** The insured value, when the records carry one. Usually null. */
	insuredValueCents: number | null;
}

export interface InsuranceInput {
	policy: string;
	broker: string;
	/** First day of cover. */
	termStart: string;
	/** Last day of cover. */
	termEnd: string;
	/** The fiscal year end the budget closes on, for the term check. */
	fiscalEnd: string;
	/** The premium the policy states. */
	premiumCents: number;
	/** Account 6100’s annual budget. */
	budgetAnnualCents: number;
	/** Account 6100’s year to date. */
	expensedYtdCents: number;
	/** Whole months the books cover since the fiscal year started. */
	monthsElapsed: number;
	waterDeductibleCents: number;
	quake: QuakeDeductible;
	appraisalIso: string;
	renewalIso: string;
	/** The statement date the day counts are taken from. */
	asOf: string;
	lots: number;
}

export interface InsuranceSummary {
	policy: string;
	broker: string;
	termStart: string;
	termEnd: string;
	/** Days of cover, inclusive of both ends. */
	termDays: number;
	termEndsOnFiscalEnd: boolean;
	premiumCents: number;
	budgetAnnualCents: number;
	premiumMatchesBudget: boolean;
	/** The premium spread evenly across twelve months. */
	monthlyCents: number;
	expensedYtdCents: number;
	/** What the elapsed months of the term should have expensed. */
	accruedCents: number;
	accrualMatches: boolean;
	waterDeductibleCents: number;
	quakeRateBps: number;
	quakeMinimumCents: number;
	insuredValueCents: number | null;
	/**
	 * The earthquake deductible in dollars. Null when the books carry no insured
	 * value, because a percentage of an unknown is not a number.
	 */
	quakeDeductibleCents: number | null;
	appraisalIso: string;
	daysToAppraisal: number;
	renewalIso: string;
	daysToRenewal: number;
	appraisalBeforeRenewal: boolean;
	/** The premium per lot per month, the figure an owner can compare with a fee. */
	perLotMonthCents: number;
	/** Every check passed. */
	balanced: boolean;
}

/** The summary. Days are counted from the statement date, the way the books are read. */
export function insuranceSummary(input: InsuranceInput): InsuranceSummary {
	const termDays = daysBetween(input.termStart, input.termEnd) + 1;
	const monthlyCents = Math.round(input.premiumCents / 12);
	const accruedCents = monthlyCents * input.monthsElapsed;

	const quakeDeductibleCents =
		input.quake.insuredValueCents === null
			? null
			: Math.max(
					Math.round((input.quake.insuredValueCents * input.quake.rateBps) / 10_000),
					input.quake.minimumCents
				);

	const premiumMatchesBudget = input.premiumCents === input.budgetAnnualCents;
	const accrualMatches = accruedCents === input.expensedYtdCents;
	const termEndsOnFiscalEnd = input.termEnd === input.fiscalEnd;
	const appraisalBeforeRenewal = daysBetween(input.appraisalIso, input.renewalIso) > 0;

	return {
		policy: input.policy,
		broker: input.broker,
		termStart: input.termStart,
		termEnd: input.termEnd,
		termDays,
		termEndsOnFiscalEnd,
		premiumCents: input.premiumCents,
		budgetAnnualCents: input.budgetAnnualCents,
		premiumMatchesBudget,
		monthlyCents,
		expensedYtdCents: input.expensedYtdCents,
		accruedCents,
		accrualMatches,
		waterDeductibleCents: input.waterDeductibleCents,
		quakeRateBps: input.quake.rateBps,
		quakeMinimumCents: input.quake.minimumCents,
		insuredValueCents: input.quake.insuredValueCents,
		quakeDeductibleCents,
		appraisalIso: input.appraisalIso,
		daysToAppraisal: daysBetween(input.asOf, input.appraisalIso),
		renewalIso: input.renewalIso,
		daysToRenewal: daysBetween(input.asOf, input.renewalIso),
		appraisalBeforeRenewal,
		perLotMonthCents: Math.round(input.premiumCents / 12 / Math.max(1, input.lots)),
		balanced:
			premiumMatchesBudget &&
			accrualMatches &&
			termEndsOnFiscalEnd &&
			appraisalBeforeRenewal
	};
}
