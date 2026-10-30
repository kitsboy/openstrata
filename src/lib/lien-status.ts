/**
 * Lot 207's lien file, as the one page a council can hand to a lawyer, a notary
 * or the owner.
 *
 * The evidence is spread over three places: the arrears ladder ages the money, the
 * September minutes record that the lawyer was told to draft an opinion, and the
 * October agenda carries the vote. No page puts them in order, and the order is
 * the point — a lien is not a balance, it is a sequence of steps that ends in a
 * registration only after the council has voted. Six rules keep the sheet honest:
 *
 * 1. **A lien exists only when a registration is recorded.** Money owing plus a
 *    vote is still not a lien, and the sheet says so rather than implying one is
 *    filed. `registered` is false until a registration date is on the file *and*
 *    the vote carried.
 *
 * 2. **The amount is money that has fallen due, and nothing else.** The next
 *    month's fee is real money owed and is printed apart, exactly as the Form F
 *    certificate prints it, because a lien secures a debt and not a bill nobody
 *    is late on.
 *
 * 3. **Legal spend is not added to the amount.** The books record what the lawyer
 *    has been paid against the legal budget; they record no recoverable costs and
 *    no registry fee. The sheet prints the spend and refuses to total a lien that
 *    includes it, because that total would be invented.
 *
 * 4. **The steps are in order or the sheet says they are not.** A vote dated
 *    before the demand that supports it is a defect and produces no page: this is
 *    the same rule the hearing notice applies to its own window.
 *
 * 5. **A step with no date is waiting, not scheduled.** The registration has no
 *    day until the council votes to file, so it prints as waiting; a date guessed
 *    for it would read as a decision already taken.
 *
 * 6. **No interest and no costs are charged.** The books record no interest on
 *    anyone's account, and no bylaw here adds a cost. The sheet says that instead
 *    of leaving a reader to assume the total will grow.
 *
 * Label-free: the caller supplies the wording and the seat count.
 */

import { daysBetween } from './arrears';
import { docReference } from './documents';

export type LienStepKey = 'demand' | 'opinion' | 'vote' | 'registration';
export type LienStepState = 'done' | 'ahead' | 'waiting';

export interface LienStep {
	key: LienStepKey;
	/** The day the step happened or is booked. Null while the step has no day. */
	dateIso: string | null;
	/** `done` when the day has come, `ahead` when it is booked, `waiting` without one. */
	state: LienStepState;
	/** Days from the statement date to a booked step; null when none is booked. */
	days: number | null;
}

/** The lot's balance split by what it is, with the part not yet due named apart. */
export interface LienParts {
	feesCents: number;
	lateCents: number;
	levyCents: number;
	fineCents: number;
	/** The next fee, dated after the statement date. Never part of the lien. */
	notYetDueCents: number;
	/** The day the first not-yet-due charge falls due, or null when there is none. */
	notYetDueIso: string | null;
}

export interface LienInput {
	unitId: string;
	owner: string;
	/** The day the page is written; every count is to it. */
	asOf: string;
	/** The day the demand letter went to the owner. */
	demandIso: string;
	/** The day council directed the lawyer to draft the opinion, or null. */
	opinionIso: string | null;
	/** The day council votes, or null when none is booked. */
	voteIso: string | null;
	/** What the recorded vote decided; null until it is held. */
	voteOutcome: 'file' | 'decline' | null;
	/** The day the lien was registered at the land title office, or null. */
	registrationIso: string | null;
	parts: LienParts;
	legal: { spentCents: number; budgetCents: number };
	/** Withheld while anything is owing — the building's own Form F rule. */
	formFWithheld: boolean;
	/** Council seats and the majority that decisions need, from the meeting data. */
	seats: number;
	quorum: number;
}

/** Why no page can be written. Null when one can. */
export type LienDefect = 'settled' | 'sequence' | null;

export interface LienStatus {
	unitId: string;
	owner: string;
	asOf: string;
	/** `OS-LN-2026-09-207`. */
	reference: string;
	/** Fees, late fees, the levy and any fine that have fallen due. */
	securedCents: number;
	/** The next fee and anything else dated after the statement date. */
	notYetDueCents: number;
	notYetDueIso: string | null;
	parts: LienParts;
	/** Days since the demand went out — the only age this page claims. */
	daysSinceDemand: number;
	steps: LienStep[];
	voteIso: string | null;
	voteOutcome: 'file' | 'decline' | null;
	/** Days until a booked vote, or null when it has been held or none is booked. */
	voteAheadDays: number | null;
	voteHeld: boolean;
	registered: boolean;
	registrationIso: string | null;
	legal: { spentCents: number; budgetCents: number };
	formFWithheld: boolean;
	seats: number;
	quorum: number;
	/** True while every dated step is in the order the Act's process requires. */
	inOrder: boolean;
	/** The next step a reader is waiting on, or null once the file is closed. */
	nextStep: LienStepKey | null;
	issuable: boolean;
	defect: LienDefect;
}

/** Steps that carry a day, in the order the process runs them. */
function sequenceOf(input: LienInput): Array<{ key: LienStepKey; dateIso: string }> {
	const pairs: Array<[LienStepKey, string | null]> = [
		['demand', input.demandIso],
		['opinion', input.opinionIso],
		['vote', input.voteIso],
		['registration', input.registrationIso]
	];
	return pairs
		.filter((pair): pair is [LienStepKey, string] => pair[1] !== null)
		.map(([key, dateIso]) => ({ key, dateIso }));
}

export function lienStatus(input: LienInput): LienStatus {
	const securedCents =
		input.parts.feesCents +
		input.parts.lateCents +
		input.parts.levyCents +
		input.parts.fineCents;

	// The sequence is read in process order, so a vote dated before the demand it
	// rests on is a defect even if every other date is fine.
	const sequence = sequenceOf(input);
	const inOrder = sequence.every(
		(step, index) => index === 0 || step.dateIso >= sequence[index - 1].dateIso
	);

	const voteHeld =
		input.voteIso !== null && daysBetween(input.voteIso, input.asOf) >= 0;
	const voteAheadDays =
		input.voteIso !== null && daysBetween(input.asOf, input.voteIso) > 0
			? daysBetween(input.asOf, input.voteIso)
			: null;
	// A registration recorded without a carried vote is not a lien.
	const registered = input.registrationIso !== null && input.voteOutcome === 'file';

	const step = (
		key: LienStepKey,
		dateIso: string | null
	): LienStep => {
		if (dateIso === null) return { key, dateIso, state: 'waiting', days: null };
		const days = daysBetween(input.asOf, dateIso);
		return {
			key,
			dateIso,
			state: days > 0 ? 'ahead' : 'done',
			days
		};
	};

	const steps: LienStep[] = [
		step('demand', input.demandIso),
		step('opinion', input.opinionIso),
		step('vote', input.voteIso),
		step('registration', registered ? input.registrationIso : null)
	];

	const pending = steps.find((entry) => entry.state !== 'done');
	const defect: LienDefect =
		securedCents === 0 ? 'settled' : !inOrder ? 'sequence' : null;

	return {
		unitId: input.unitId,
		owner: input.owner,
		asOf: input.asOf,
		reference: `${docReference('OS-LN', input.asOf)}-${input.unitId}`,
		securedCents,
		notYetDueCents: input.parts.notYetDueCents,
		notYetDueIso: input.parts.notYetDueIso,
		parts: input.parts,
		daysSinceDemand: Math.max(0, daysBetween(input.demandIso, input.asOf)),
		steps,
		voteIso: input.voteIso,
		voteOutcome: input.voteOutcome,
		voteAheadDays,
		voteHeld,
		registered,
		registrationIso: registered ? input.registrationIso : null,
		legal: input.legal,
		formFWithheld: input.formFWithheld,
		seats: input.seats,
		quorum: input.quorum,
		inOrder,
		nextStep: pending?.key ?? null,
		issuable: defect === null,
		defect
	};
}
