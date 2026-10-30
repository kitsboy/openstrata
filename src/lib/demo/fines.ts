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
