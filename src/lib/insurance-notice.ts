/**
 * The insurance notice an owner receives after a claim, or when they ask what
 * the building’s policy does and does not cover.
 *
 * The insurance summary is the council’s page. An owner needs a shorter, sharper
 * answer: what the strata insures, what they must insure themselves, and what the
 * deductible is. Four rules keep the notice from saying more than the records can
 * support:
 *
 * 1. **The cover has to be current at the notice’s own date.** A letter dated
 *    after the term ends cannot certify cover, so it prints the term and says it
 *    cannot confirm cover on that date. An owner who reads “insured” off an
 *    expired term would be relying on the one line that was wrong.
 *
 * 2. **The strata’s deductible is not the owner’s debt.** The policy carries a
 *    water deductible and a percentage quake deductible; nothing in the bylaws on
 *    file makes an owner pay them. The notice prints the deductible as the
 *    corporation’s and, where no bylaw says otherwise, states plainly that the
 *    records do not charge it to the owner. Telling an owner they owe $25,000
 *    because a pipe failed would be a demand this book cannot support.
 *
 * 3. **The quake deductible stays a formula.** It is a percentage of the insured
 *    value with a floor, and these books carry no insured value, so the notice
 *    prints the rule and no dollar figure.
 *
 * 4. **What each side insures is quoted, not retyped.** The two halves come from
 *    the bylaw on file — the strata insures the building and common property, the
 *    owner insures contents, liability and their own improvements — so the notice
 *    cannot drift from the bylaw the council adopted.
 *
 * The notice is information, not a coverage opinion; the footer says so.
 */

import { daysBetween } from './arrears';
import { docReference } from './documents';

/** Who the records say pays the corporation’s deductible. */
export type DeductibleCharge = 'none-on-file' | 'bylaw';

export interface OwnerInsuranceInput {
	unitId: string;
	owner: string;
	/** The day the notice is written. */
	asOf: string;
	policy: string;
	broker: string;
	termStart: string;
	termEnd: string;
	waterDeductibleCents: number;
	quake: { rateBps: number; minimumCents: number; insuredValueCents: number | null };
	/** What the bylaw says the strata insures. */
	strataCover: string;
	/** What the bylaw says the owner insures. */
	ownerCover: string;
	/** Whether a bylaw makes the owner pay the corporation’s deductible. */
	deductibleCharge: DeductibleCharge;
}

export interface OwnerInsuranceNotice {
	unitId: string;
	owner: string;
	asOf: string;
	/** `OS-IN-2026-09-207`. */
	reference: string;
	policy: string;
	broker: string;
	termStart: string;
	termEnd: string;
	/** True when the notice’s date falls inside the policy term. */
	coverCurrent: boolean;
	/** Whole days of cover left at the notice’s date; negative after the term. */
	daysLeft: number;
	strataCover: string;
	ownerCover: string;
	waterDeductibleCents: number;
	quakeRateBps: number;
	quakeMinimumCents: number;
	insuredValueCents: number | null;
	/** The quake deductible in dollars; null while no insured value is carried. */
	quakeDeductibleCents: number | null;
	deductibleCharge: DeductibleCharge;
}

/** The notice. Everything that decides a figure is read from the records. */
export function ownerInsuranceNotice(input: OwnerInsuranceInput): OwnerInsuranceNotice {
	const daysLeft = daysBetween(input.asOf, input.termEnd);
	const quakeDeductibleCents =
		input.quake.insuredValueCents === null
			? null
			: Math.max(
					Math.round((input.quake.insuredValueCents * input.quake.rateBps) / 10_000),
					input.quake.minimumCents
				);

	return {
		unitId: input.unitId,
		owner: input.owner,
		asOf: input.asOf,
		reference: docReference('OS-IN', input.asOf) + '-' + input.unitId,
		policy: input.policy,
		broker: input.broker,
		termStart: input.termStart,
		termEnd: input.termEnd,
		// Inclusive on both ends: the last day of the term is still cover.
		coverCurrent: daysBetween(input.termStart, input.asOf) >= 0 && daysLeft >= 0,
		daysLeft,
		strataCover: input.strataCover,
		ownerCover: input.ownerCover,
		waterDeductibleCents: input.waterDeductibleCents,
		quakeRateBps: input.quake.rateBps,
		quakeMinimumCents: input.quake.minimumCents,
		insuredValueCents: input.quake.insuredValueCents,
		quakeDeductibleCents,
		deductibleCharge: input.deductibleCharge
	};
}
