/**
 * The bylaw hearing as the minute a lawyer, a CRT adjudicator or a buyer’s
 * notary asks for.
 *
 * The minutes on `/meetings` are prose; the fine register is a table. Neither is
 * the one-page extract that says *this complaint was heard, these members voted,
 * this is what was decided and this is what the lot’s account carries as a
 * result*. The extract is built from the register row and the meeting, so it
 * cannot disagree with either. Five rules:
 *
 * 1. **No minute before the hearing.** An extract dated before the hearing, or
 *    taken from a meeting that had not happened, is not a record of a decision.
 *
 * 2. **The vote is printed as cast, abstentions and all.** A majority is yes over
 *    no, so abstentions are outside the denominator; they still count towards the
 *    members present. The extract prints all four numbers, because a reader
 *    checking 4–0–1 against the minutes should not have to reconstruct them.
 *
 * 3. **A decision needs a quorum.** The council’s quorum is a majority of its
 *    seats. A vote taken without one is not a decision, so no fine is stated and
 *    the extract names the defect rather than dressing it as a resolution.
 *
 * 4. **A failed motion imposes nothing.** If the motion does not carry, the
 *    extract says no fine was imposed, and prints no amount, no posting and no
 *    Form F consequence — a record that showed a fine after a lost vote would be
 *    the most damaging kind of wrong.
 *
 * 5. **The money and the Form F state come from the records.** The fine, its
 *    posting and what the lot still owes are read from the fine register, and the
 *    Form F state from the lot’s own rule. The extract never recomputes either.
 *
 * The extract is not the minutes. The footer says so: the full minutes govern and
 * this page quotes them.
 */

import { daysBetween } from './arrears';
import { docReference } from './documents';
import type { FineDefect, FineRow } from './fine-register';

export interface HearingMinutesInput {
	row: FineRow;
	/** The council meeting the minute belongs to. */
	meetingIso: string;
	/** The day the extract is made. */
	asOf: string;
	/** Council seats, and the votes needed for quorum. */
	seats: number;
	quorum: number;
	chair: string;
	/** The lot’s Form F state, from `formF` on the lot’s own record. */
	formFWithheld: boolean;
}

/** Why an extract cannot be made. Null when it can. */
export type MinutesDefect = 'not-heard' | 'no-quorum' | 'vote' | 'process' | null;

export interface HearingMinutes {
	unitId: string;
	lot: string;
	bylaw: string;
	/** `OS-BM-2026-09`. */
	reference: string;
	meetingIso: string;
	hearingIso: string;
	noticeIso: string;
	windowCloses: string;
	chair: string;
	seats: number;
	quorum: number;
	/** Votes as recorded. */
	vote: { yes: number; no: number; abstain: number };
	/** Yes plus no: the denominator a majority is counted against. */
	denominator: number;
	/** Members present: yes, no and abstentions. */
	present: number;
	quorate: boolean;
	/** True when the motion carried and the meeting was quorate. */
	carried: boolean;
	/** The fine the meeting imposed, or null when nothing was imposed. */
	fineCents: number | null;
	postedIso: string | null;
	/** What the lot’s account still carries for the fine, at the books’ date. */
	owingCents: number;
	formFWithheld: boolean;
	/** True when the extract is a record of a valid decision. */
	valid: boolean;
	defect: MinutesDefect;
	/** The defect the fine register itself found, or null when the process holds. */
	processDefect: FineDefect;
}

/** The extract, from the register row and the meeting that heard it. */
export function hearingMinutes(input: HearingMinutesInput): HearingMinutes {
	const { row } = input;
	const { yes, no, abstain } = row.fine.votes;
	const denominator = yes + no;
	const present = yes + no + abstain;
	const meetingAfterHearing = daysBetween(row.fine.hearingIso, input.meetingIso) >= 0;
	const quorate = present >= input.quorum;
	const majority = yes > no;
	const processClean = row.defect === null;

	const carried = majority && quorate;
	let defect: MinutesDefect = null;
	if (!meetingAfterHearing) defect = 'not-heard';
	else if (!majority) defect = 'vote';
	else if (!quorate) defect = 'no-quorum';
	else if (!processClean) defect = 'process';

	const valid = defect === null;

	return {
		unitId: row.fine.lot,
		lot: row.fine.lot,
		bylaw: row.fine.bylaw,
		reference: docReference('OS-BM', input.meetingIso),
		meetingIso: input.meetingIso,
		hearingIso: row.fine.hearingIso,
		noticeIso: row.fine.noticeIso,
		windowCloses: row.windowCloses,
		chair: input.chair,
		seats: input.seats,
		quorum: input.quorum,
		vote: { yes, no, abstain },
		denominator,
		present,
		quorate,
		carried,
		fineCents: valid ? row.fine.cents : null,
		postedIso: valid ? row.fine.postedIso : null,
		owingCents: valid ? row.owingCents : 0,
		formFWithheld: valid ? input.formFWithheld : false,
		valid,
		defect,
		processDefect: row.defect
	};
}
