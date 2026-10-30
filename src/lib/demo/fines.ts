/**
 * The building's bylaw fines, as the notice, hearing and minutes record them.
 *
 * The demo has one fine: lot 309, under bylaw 9.2, noticed 29 August 2026,
 * heard 15 September, passed 4–0 with one abstention and posted 16 September.
 * It is unpaid at the close, which is why the lot's Form F is withheld and the
 * $200 sits in `7030 Bylaw fines`.
 *
 * The ceiling is the bylaw's own: $200 a day. The regulation would have allowed a
 * vacation-rental bylaw to go to $1,000 a day, but this council did not adopt the
 * higher number, so the register measures against $200.
 */

import type { BylawFine } from '../fine-register';
import type { BylawComplaint } from '../hearing-notice';

export const bylawFines: BylawFine[] = [
	{
		lot: '309',
		bylaw: '9.2 — no stays under 30 days',
		noticeIso: '2026-08-29',
		hearingIso: '2026-09-15',
		votes: { yes: 4, no: 0, abstain: 1 },
		cents: 20_000,
		days: 1,
		ceilingPerDayCents: 20_000,
		postedIso: '2026-09-16',
		paidIso: null
	}
];

/**
 * The complaint behind lot 309's fine, as the hearing notice needs it: the day it
 * arrived, the three things that came with it (the dates, the photographs of
 * luggage, and two nights of enterphone logs the September minutes describe) and
 * how the letter may describe the person who filed it. The name stays out of the
 * notice: the owner being fined is the one on trial, not the neighbour.
 */
export const bylawComplaint: BylawComplaint = {
	lot: '309',
	bylaw: '9.2 — no stays under 30 days',
	receivedIso: '2026-08-28',
	complainantRole: 'another owner in the building',
	evidence: [
		{
			date: '2026-08-21',
			what: 'Enterphone log: two guests admitted to lot 309 at 8:42 pm and 10:15 pm, each saying they had booked a night.'
		},
		{
			date: '2026-08-22',
			what: 'Photographs of luggage in the third-floor corridor outside lot 309, taken at 4:10 pm.'
		},
		{
			date: '2026-08-23',
			what: 'A listing screenshot naming lot 309 for two nights, sent with the photographs.'
		}
	]
};

/** The hearing itself: the time and place the notice has to give the owner. */
export const bylawHearing = {
	time: '7:00 pm',
	place: 'Amenity room, 4100 Cambie Street, and the hybrid link in this letter'
} as const;
