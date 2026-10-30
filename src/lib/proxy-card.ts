/**
 * The proxy card: the one piece of a meeting package an owner fills in and sends
 * back.
 *
 * The packet prints the notice, the agenda, the minutes and the quorum maths; the
 * form itself was missing. Its arithmetic is the meeting's own, so it is imported
 * here rather than restated: `packetMaths` already knows the last lawful day for
 * notice, and a proxy that arrives with the notice is due on the same day. A
 * second copy of the seven-day subtraction would let the packet and the card
 * disagree about the only date a returned form depends on.
 *
 * Four rules decide whether a returned card counts:
 *
 * 1. **A card must name its lot and its appointee.** A form with a signature but
 *    nobody to exercise it is not a proxy, however complete it looks.
 * 2. **A card must be signed.** An unsigned form is a draft.
 * 3. **A card arriving after the last lawful day is late**, not counted anyway.
 *    The date is the notice deadline, because the form comes back with the
 *    package.
 * 4. **One card is one lot's vote.** Its direction — for, against, abstain, or
 *    nothing at all — does not change whether it counts; a card with no direction
 *    leaves the vote to the appointee's discretion, which is a choice, not a
 *    blank.
 */

import { NOTICE_WINDOWS, daysBetween } from './documents';
import { packetMaths } from './meeting-packet';

export type ProxyRefusal = 'no-lot' | 'no-appointee' | 'unsigned' | 'late';

export interface ProxyDeadline {
	/** The last day the secretary can receive a card for this meeting. */
	dueBy: string;
	/** Whole days between that day and the meeting — the statutory window. */
	days: number;
	/** Lots that must be represented for the meeting to be quorate. */
	quorumNeed: number;
}

/**
 * The card's deadline, from the meeting arithmetic the packet prints.
 *
 * An AGM or special general meeting uses the fourteen-day window; the council's
 * own seven-day notice is passed explicitly when it is the one being printed.
 */
export function proxyDeadline(
	meetingIso: string,
	quorumNeed: number,
	windowDays: number = NOTICE_WINDOWS.agm
): ProxyDeadline {
	// The seats argument is unused: a proxy is counted in lots, and the meeting's
	// own quorum (a third of the lots at an AGM, 14 of 40 here) is passed in
	// rather than re-derived, so the card cannot print a number the packet does
	// not.
	const maths = packetMaths({ meetingIso, noticeWindowDays: windowDays, seats: 0 });
	return { dueBy: maths.noticeBy, days: maths.days, quorumNeed };
}

export interface ReturnedProxy {
	/** The lot the card is signed for. */
	lot?: string;
	/** Who is appointed to attend and vote. */
	appointee?: string;
	/** Whether the owner has signed it. */
	signed?: boolean;
	/** The day it reached the secretary, when that is known. */
	receivedIso?: string;
}

export interface ProxyCheck {
	/** True when the card counts towards the meeting's quorum and votes. */
	counts: boolean;
	/** Why it does not, in the order a secretary would check. */
	refusal: ProxyRefusal | null;
}

/** Whether a returned card counts, and the first reason it does not. */
export function proxyCounts(
	card: ReturnedProxy,
	deadline: Pick<ProxyDeadline, 'dueBy'>
): ProxyCheck {
	if (!card.lot) return { counts: false, refusal: 'no-lot' };
	if (!card.appointee) return { counts: false, refusal: 'no-appointee' };
	if (!card.signed) return { counts: false, refusal: 'unsigned' };
	if (card.receivedIso && (daysBetween(deadline.dueBy, card.receivedIso) ?? 0) > 0) {
		return { counts: false, refusal: 'late' };
	}
	return { counts: true, refusal: null };
}
