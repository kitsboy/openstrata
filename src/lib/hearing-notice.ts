/**
 * The notice of a bylaw complaint, as a letter to the owner it is about.
 *
 * A fine starts with a letter, and the letter is where enforcement usually goes
 * wrong: it names the wrong dates, it asks for money nobody has decided, or it
 * tells the whole building who complained. This module writes the notice from
 * the complaint record and the bylaw's own ceiling, and five rules keep it
 * honest:
 *
 * 1. **The window and the hearing come from the records.** The response window
 *    is the fine register's fourteen days from the day the notice is served, and
 *    the hearing date is the council's. The letter subtracts nothing itself, so
 *    the letter, the register and the minutes cannot disagree about a date.
 *
 * 2. **A hearing before the window closes is not a hearing.** The owner has not
 *    had their time yet, so the letter prints both dates and says the hearing
 *    cannot proceed that day. That defect stays on the paper rather than being
 *    quietly fixed, because the owner is the person entitled to know.
 *
 * 3. **No fine before the hearing.** At the notice stage the most the bylaw
 *    allows is `days × the ceiling`; that is a maximum exposure, not a debt, and
 *    the letter says so. Once a fine has been decided (on or before the day the
 *    letter is issued) the amount prints as levied instead, with its date.
 *
 * 4. **The notice names the bylaw, the dates and the evidence — not the
 *    complainant.** The person who complained is not the one on trial, so the
 *    letter describes them by their relationship to the building. Their name
 *    stays in the register.
 *
 * 5. **A notice with nothing behind it is not issued.** A complaint with no
 *    evidence, no days of contravention, or a date after the notice cannot
 *    support a notice at all; the letter is withheld and says which part failed
 *    rather than being handed to an owner as if it were complete.
 */

import { addDays, daysBetween } from './arrears';
import { docReference } from './documents';
import { BYLAW_WINDOW_DAYS } from './fine-register';

/** One piece of evidence, dated the way the complaint dated it. */
export interface ComplaintEvidence {
	/** The day the evidence is about. */
	date: string;
	what: string;
}

export interface BylawComplaint {
	lot: string;
	/** The bylaw and the rule it enforces, as the register names it. */
	bylaw: string;
	/** The day the written complaint arrived. */
	receivedIso: string;
	/** What came with it. An empty list cannot support a notice. */
	evidence: ComplaintEvidence[];
	/** The complainant as the letter may describe them, never by name. */
	complainantRole: string;
}

export interface HearingNoticeInput {
	complaint: BylawComplaint;
	/** The day the notice of complaint was served; starts the fourteen days. */
	noticeIso: string;
	/** The day the council hears it. */
	hearingIso: string;
	hearingTime: string;
	hearingPlace: string;
	/** Days of contravention the notice covers. */
	days: number;
	/** The bylaw’s own ceiling per proven day, in cents. */
	ceilingPerDayCents: number;
	/** A fine already decided by the issue date, or null. */
	leviedCents?: number | null;
	/** The day that fine was decided, when there is one. */
	leviedIso?: string | null;
}

/** Why a notice cannot be issued. Null when it can. */
export type NoticeDefect = 'evidence' | 'sequence' | null;

export interface HearingNotice {
	/** `OS-BHN-YYYY-MM`, dated from the day it is served. */
	reference: string;
	lot: string;
	bylaw: string;
	/** How the letter describes the complainant. */
	complainantRole: string;
	receivedIso: string;
	noticeIso: string;
	/** The day the fourteen-day response window closes. */
	windowCloses: string;
	/** Whole days from service to the close of the window. */
	windowDays: number;
	hearingIso: string;
	hearingTime: string;
	hearingPlace: string;
	/** True when the hearing is on or after the day the window closes. */
	inOrder: boolean;
	evidence: ComplaintEvidence[];
	/** Days of contravention in the notice. */
	days: number;
	ceilingPerDayCents: number;
	/**
	 * The money the letter states. A maximum is what the bylaw could impose on
	 * the days noticed; a levied amount is a decision already made.
	 */
	amount: { kind: 'maximum'; cents: number } | { kind: 'levied'; cents: number; date: string };
	/** True when the notice can be served. */
	issuable: boolean;
	defect: NoticeDefect;
}

/**
 * The notice. The window is added once, from the service date, and the amount is
 * either the ceiling on the days noticed or a fine the council has already set —
 * never both, because an owner reading a letter should not have to work out
 * which number they are being asked about.
 */
export function hearingNotice(input: HearingNoticeInput): HearingNotice {
	const windowCloses = addDays(input.noticeIso, BYLAW_WINDOW_DAYS);
	const windowDays = daysBetween(input.noticeIso, windowCloses);
	const inOrder = daysBetween(windowCloses, input.hearingIso) >= 0;

	const enoughEvidence = input.complaint.evidence.length > 0 && input.days > 0;
	const inSequence = daysBetween(input.complaint.receivedIso, input.noticeIso) >= 0;
	const defect: NoticeDefect = !enoughEvidence ? 'evidence' : !inSequence ? 'sequence' : null;

	const levied = input.leviedCents ?? null;
	const leviedDate = input.leviedIso ?? null;
	const decided =
		levied !== null &&
		leviedDate !== null &&
		daysBetween(leviedDate, input.noticeIso) >= 0;

	return {
		reference: docReference('OS-BHN', input.noticeIso),
		lot: input.complaint.lot,
		bylaw: input.complaint.bylaw,
		complainantRole: input.complaint.complainantRole,
		receivedIso: input.complaint.receivedIso,
		noticeIso: input.noticeIso,
		windowCloses,
		windowDays,
		hearingIso: input.hearingIso,
		hearingTime: input.hearingTime,
		hearingPlace: input.hearingPlace,
		inOrder,
		evidence: input.complaint.evidence,
		days: input.days,
		ceilingPerDayCents: input.ceilingPerDayCents,
		amount:
			decided && levied !== null && leviedDate !== null
				? { kind: 'levied', cents: levied, date: leviedDate }
				: { kind: 'maximum', cents: input.ceilingPerDayCents * input.days },
		issuable: defect === null,
		defect
	};
}
