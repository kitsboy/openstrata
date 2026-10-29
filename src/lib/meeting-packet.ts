/**
 * The arithmetic behind a meeting packet.
 *
 * A packet is four pieces of paper's worth of record on one page: the notice,
 * the agenda, the last minutes and the quorum maths. Three of those are already
 * written in `demo/meetings`; the maths is not, and it is the part a council gets
 * wrong. This module computes it, so the page and its test cannot disagree:
 *
 * - **The last lawful day for the notice** is the meeting date less the statutory
 *   window — 7 days for council, 14 for an AGM or special general meeting, the
 *   same windows `documents.ts` prints on the notice itself.
 * - **A notice given inside the window is late**, not rounded up to the window.
 *   The packet says which day it is due; when a council records the day it was
 *   actually given, the same function says whether that day was enough.
 * - **Quorum is a majority of the seats**, as a whole number of people: 3 of 5,
 *   and also 3 of 4. A floor of half the seats plus one is the only reading that
 *   never asks for fewer people than a majority.
 *
 * Calendar maths is done at UTC midnight, as it is everywhere else in this
 * project, so a daylight-saving change cannot move a deadline by a day.
 */

import { addDays, daysBetween } from './documents';

export interface PacketMathsInput {
	/** ISO date the meeting is held. */
	meetingIso: string;
	/** Statutory advance window, in whole days. */
	noticeWindowDays: number;
	/** Council seats, or the lots eligible to vote. */
	seats: number;
	/** The day the notice was actually given, when it has been. */
	givenIso?: string;
}

export interface PacketMaths {
	/** The last lawful day to give notice. */
	noticeBy: string;
	/** The day the notice is treated as given: recorded, or the last lawful day. */
	given: string;
	/** Whole days between the given date and the meeting. */
	days: number;
	/** True when `days` reaches the statutory window. */
	met: boolean;
	/** People needed for quorum. */
	quorumNeed: number;
}

export function packetMaths(input: PacketMathsInput): PacketMaths {
	const noticeBy = addDays(input.meetingIso, -input.noticeWindowDays);
	const given = input.givenIso ?? noticeBy;
	const days = daysBetween(given, input.meetingIso) ?? 0;
	return {
		noticeBy,
		given,
		days,
		met: days >= input.noticeWindowDays,
		quorumNeed: Math.floor(input.seats / 2) + 1
	};
}
