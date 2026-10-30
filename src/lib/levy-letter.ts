/**
 * The special levy as a letter to the owner who still owes it.
 *
 * The levy statement is the council’s page: every lot, the trust, the contract
 * and the work left. An owner who owes part of $216,000 has never been sent the
 * part that is theirs, and a demand that says “pay $3,552” without saying what
 * for, what has been done and what a schedule would look like is the letter
 * councils get wrong. Five rules keep this one honest:
 *
 * 1. **Only a lot that owes anything is written to.** A settled lot gets no
 *    letter; a module that produced one would be sending a demand for zero.
 *
 * 2. **The share is points at the resolution’s rate, and it is a ceiling.** The
 *    assessment is rebuilt from the lot’s entitlement, never typed, and a record
 *    owing more than its own share cannot be demanded: the letter caps at the
 *    share and reports the excess as a defect rather than collecting it.
 *
 * 3. **A plan is a schedule, and the ask is the instalment.** A lot paying
 *    $450 a month is asked for $450 and shown the balance it is working down;
 *    asking it for the whole balance would punish the owner keeping their word.
 *    A plan lot is therefore not aged — the same rule the arrears ladder applies.
 *
 * 4. **The trust is printed from the books.** Assessed, collected, paid to the
 *    contractor, cash in the trust and work left, with the two-route check. If
 *    the trust does not balance, the gap prints instead of a reassurance.
 *
 * 5. **No interest, no lien, no invented deadline.** The books record no interest
 *    on the levy, so the letter charges none. A lien is a council decision and is
 *    not threatened here. The day a plan must be agreed is the council’s next
 *    meeting, and a meeting that has already passed leaves the letter with no
 *    deadline rather than a date in the past.
 */

import { daysBetween } from './arrears';
import { docReference } from './documents';

export interface LevyTrustPosition {
	assessedCents: number;
	collectedCents: number;
	paidCents: number;
	cashCents: number;
	remainingCents: number;
}

export interface LevyLetterInput {
	unitId: string;
	owner: string;
	/** The lot’s entitlement, the basis of its share. */
	points: number;
	/** The levy per entitlement point, in cents. */
	pointCents: number;
	/** What the lot’s record says it still owes. */
	owingCents: number;
	/** The agreed monthly instalment, or null. */
	planCents: number | null;
	/** The day the levy became payable for this lot. */
	dueIso: string;
	/** The day the letter is written; every age is counted to it. */
	asOf: string;
	/** The resolution that created the levy. */
	approved: string;
	/** The contract the money is for. */
	project: string;
	trust: LevyTrustPosition;
	/** The council meeting by which a plan should be agreed, or null. */
	meetingIso: string | null;
}

/** Why a lot cannot be written to. Null when it can. */
export type LevyLetterDefect = 'settled' | 'exceeds' | null;

export interface LevyLetter {
	unitId: string;
	owner: string;
	asOf: string;
	/** `OS-LV-2026-09-207`. */
	reference: string;
	approved: string;
	project: string;
	/** The day the levy became payable for this lot. */
	dueIso: string;
	points: number;
	pointCents: number;
	/** Points × the rate: this lot’s whole share. */
	assessedCents: number;
	/** Assessed less what is still owed, capped at the share. */
	paidCents: number;
	/** What the lot owes, capped at its own share. */
	owingCents: number;
	/** What this letter asks for: the instalment, or the balance. */
	askCents: number;
	planCents: number | null;
	/**
	 * Days since the levy fell due. Null for a lot on a plan, because a schedule
	 * is not arrears and the letter does not age it.
	 */
	daysLate: number | null;
	/** The day a plan should be agreed, when the council has a meeting coming. */
	deadline: string | null;
	trust: LevyTrustPosition;
	/** `cash + owing` less `assessed less paid`; zero when the trust balances. */
	differenceCents: number;
	trustBalanced: boolean;
	/** True when the letter can be written at all. */
	issuable: boolean;
	defect: LevyLetterDefect;
}

/**
 * The letter. The assessment is points at the rate; the owing figure is capped at
 * that share, so a bad record cannot become a demand for more than the resolution
 * charged.
 */
export function levyLetter(input: LevyLetterInput): LevyLetter {
	const assessedCents = input.points * input.pointCents;
	const rawOwing = Math.max(0, input.owingCents);
	const overCharged = rawOwing > assessedCents;
	const owingCents = Math.min(assessedCents, rawOwing);
	const defect: LevyLetterDefect =
		owingCents === 0 ? 'settled' : overCharged ? 'exceeds' : null;

	const planCents = input.planCents !== null && input.planCents > 0 ? input.planCents : null;
	const askCents = planCents === null ? owingCents : Math.min(planCents, owingCents);

	// Two routes to the same trust balance, the check the levy statement makes:
	// what is in the bank plus what owners still owe, against the assessment less
	// what the contract has been paid.
	const stillOwed = input.trust.assessedCents - input.trust.collectedCents;
	const differenceCents =
		input.trust.cashCents + stillOwed - (input.trust.assessedCents - input.trust.paidCents);

	const meetingAfter = input.meetingIso !== null && daysBetween(input.asOf, input.meetingIso) > 0;

	return {
		unitId: input.unitId,
		owner: input.owner,
		asOf: input.asOf,
		reference: docReference('OS-LV', input.asOf) + '-' + input.unitId,
		approved: input.approved,
		project: input.project,
		dueIso: input.dueIso,
		points: input.points,
		pointCents: input.pointCents,
		assessedCents,
		paidCents: assessedCents - owingCents,
		owingCents,
		askCents,
		planCents,
		// A schedule is not arrears: a plan lot's age is not printed at all.
		daysLate: planCents === null ? Math.max(0, daysBetween(input.dueIso, input.asOf)) : null,
		deadline: meetingAfter ? input.meetingIso : null,
		trust: input.trust,
		differenceCents,
		trustBalanced: differenceCents === 0,
		issuable: defect === null,
		defect
	};
}
