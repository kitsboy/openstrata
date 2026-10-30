/**
 * The AGM notice as a letter to owners.
 *
 * The packet is the council's working paper, the proxy card is the return, and
 * the notice itself was prose on the meetings page. A statutory notice is a
 * letter: it goes to every owner, it carries the date and place, the agenda, the
 * motions that will be put, and the window it had to be given inside.
 *
 * Four rules:
 *
 * 1. **The window is the packet's own arithmetic.** `packetMaths` already knows
 *    the last lawful day for fourteen days' notice; the letter imports it rather
 *    than subtracting a second time, so the notice, the packet and the proxy
 *    cannot disagree about the date.
 * 2. **A late notice stays on the paper.** A letter issued inside the window
 *    prints the days it had and says it is late; it is not quietly accepted, and
 *    it is not withheld, because a defect an owner cannot see is worse than one
 *    they can.
 * 3. **A resolution needs its text and its vote.** A motion with no wording, or
 *    one that does not say whether it needs a majority or three quarters, is
 *    dropped rather than printed as a blank the chair has to fill in.
 * 4. **The budget is for the year that ends after the meeting.** The current
 *    books close on the last fiscal year end; an AGM held after it approves the
 *    budget for the next one, so the letter advances the year end until it is
 *    later than the meeting. A notice cannot ask owners to approve a year that
 *    has already closed.
 */

import { daysBetween } from './arrears';
import { NOTICE_WINDOWS, docReference } from './documents';
import { packetMaths } from './meeting-packet';

export interface NoticeResolution {
	/** The vote the motion needs: `Majority`, `3/4`, `Unanimous`, `80%`. */
	vote: string;
	/** The motion as it will be put. `{yearEnd}` is filled from the notice. */
	text: string;
}

export interface AgmNoticeInput {
	meetingIso: string;
	time: string;
	place: string;
	/** The day the letter goes out. */
	issuedIso: string;
	agenda: string[];
	resolutions: NoticeResolution[];
	/** Lots that must be represented for the meeting to be quorate. */
	quorumNeed: number;
	lots: number;
	/** The fiscal year end the books currently close on, `YYYY-03-31`. */
	fiscalYearEnd: string;
}

export interface AgmNotice {
	meetingIso: string;
	time: string;
	place: string;
	issued: string;
	/** The last lawful day to give notice. */
	noticeBy: string;
	/** Whole days between the issue date and the meeting. */
	days: number;
	/** True when `days` reaches the fourteen-day window. */
	met: boolean;
	reference: string;
	quorumNeed: number;
	lots: number;
	agenda: string[];
	resolutions: NoticeResolution[];
	/** The fiscal year the budget resolution approves. */
	budgetYearEnd: string;
}

/**
 * The first fiscal year end after the meeting.
 *
 * The year end is always 31 March in this book, so advancing the year is enough;
 * the month and day are kept from the input rather than assumed, so a different
 * fiscal calendar moves with it.
 */
export function budgetYearEndFor(fiscalYearEnd: string, meetingIso: string): string {
	let end = fiscalYearEnd;
	while (end <= meetingIso) {
		const year = Number(end.slice(0, 4)) + 1;
		end = `${year}${end.slice(4)}`;
	}
	return end;
}

/** The letter, with its deadline and the year its budget motion approves. */
export function agmNotice(input: AgmNoticeInput): AgmNotice {
	const maths = packetMaths({
		meetingIso: input.meetingIso,
		noticeWindowDays: NOTICE_WINDOWS.agm,
		seats: 0
	});
	const days = daysBetween(input.issuedIso, input.meetingIso);

	return {
		meetingIso: input.meetingIso,
		time: input.time,
		place: input.place,
		issued: input.issuedIso,
		noticeBy: maths.noticeBy,
		days,
		met: days >= NOTICE_WINDOWS.agm,
		reference: docReference('OS-AGM', input.issuedIso),
		quorumNeed: input.quorumNeed,
		lots: input.lots,
		agenda: input.agenda,
		resolutions: input.resolutions.filter(
			(resolution) => resolution.text.trim() !== '' && resolution.vote.trim() !== ''
		),
		budgetYearEnd: budgetYearEndFor(input.fiscalYearEnd, input.meetingIso)
	};
}
