/**
 * The bylaw fine register: every fine on the books, with the process behind it.
 *
 * A fine is not a number the treasurer types. It is a notice, a window, a
 * hearing, a vote, a posting and a payment, and a register that printed only the
 * amount would leave a council unable to show that any of it happened. This
 * module reads those steps and decides what the books actually carry.
 *
 * Six rules:
 *
 * 1. **The fourteen days start at the notice.** The window closes fourteen days
 *    after the notice of complaint is served, and a hearing held before that day
 *    is out of order — the owner was not given their time, so the fine is not
 *    money.
 * 2. **A fine needs more yes votes than no votes.** Abstentions are not counted,
 *    which is the rule the September minutes already apply (4 yes, 0 no, 1
 *    abstention passed).
 * 3. **A posting follows the hearing.** A fine posted before the vote is a
 *    bookkeeping error, not a fine; the register names the defect rather than
 *    counting it.
 * 4. **Payment is a date, not a flag.** A fine is paid only when its payment day
 *    is on or before the statement date, so a payment recorded after the close
 *    leaves the fine standing at the close.
 * 5. **A fine cannot exceed the bylaw’s own ceiling.** The ceiling is per proven
 *    day, so a fine of $200 for one day under a $200-a-day bylaw is inside it,
 *    and one day at $400 is not.
 * 6. **The register and the receivables page agree.** The owing total is the
 *    same fine charges `charges()` hands the ladder, checked by a test, so the
 *    two pages cannot print different arrears.
 */

import { addDays, daysBetween } from './arrears';

/** The bylaw file’s own window, the fourteen days the sample minutes state. */
export const BYLAW_WINDOW_DAYS = 14;

export interface BylawFine {
	lot: string;
	/** The bylaw and the rule it enforces, as the notice names it. */
	bylaw: string;
	/** The day the notice of complaint was served; starts the fourteen days. */
	noticeIso: string;
	/** The day the council heard it and voted. */
	hearingIso: string;
	votes: { yes: number; no: number; abstain: number };
	/** The fine, in cents. */
	cents: number;
	/** Days of contravention the notice covers. */
	days: number;
	/** The bylaw’s own ceiling per proven day, in cents. */
	ceilingPerDayCents: number;
	/** The day it was posted to the lot’s account, or null. */
	postedIso: string | null;
	/** The day it was paid, or null while it stands. */
	paidIso: string | null;
}

/** Why a fine is not money on the books. Null when the process is in order. */
export type FineDefect = 'window' | 'vote' | 'posting' | null;

export interface FineRow {
	fine: BylawFine;
	/** The day the fourteen-day window closed. */
	windowCloses: string;
	/** True when the hearing was held on or after the window closed. */
	windowMet: boolean;
	/** True when yes votes outnumber no votes. */
	carried: boolean;
	/** The first step out of order, in the order a secretary would check. */
	defect: FineDefect;
	status: 'paid' | 'unpaid' | 'unposted';
	/** The money the books carry for this fine at the statement date. */
	owingCents: number;
	/** Whole days the fine has stood unpaid at the statement date. */
	daysOwing: number;
	/** True when the fine is above the bylaw’s ceiling for its proven days. */
	aboveCeiling: boolean;
}

export interface FineRegister {
	asOf: string;
	/** Unpaid first, longest standing first. */
	rows: FineRow[];
	/** Fines on the books. */
	fines: number;
	/** Posted and clean: what was levied, paid and owing. */
	leviedCents: number;
	paidCents: number;
	owingCents: number;
	unpaid: number;
	/** Fines the process could not support, listed but not counted. */
	defects: number;
}

/** One fine, read against the process. */
export function fineRow(fine: BylawFine, asOf: string): FineRow {
	const windowCloses = addDays(fine.noticeIso, BYLAW_WINDOW_DAYS);
	const windowMet = daysBetween(windowCloses, fine.hearingIso) >= 0;
	const carried = fine.votes.yes > fine.votes.no;
	const posted = fine.postedIso !== null && daysBetween(fine.hearingIso, fine.postedIso) >= 0;

	const defect: FineDefect = !windowMet
		? 'window'
		: !carried
			? 'vote'
			: !posted
				? 'posting'
				: null;

	const paid = defect === null && fine.paidIso !== null && fine.paidIso <= asOf;
	const status: FineRow['status'] = defect !== null ? 'unposted' : paid ? 'paid' : 'unpaid';
	const owingCents = status === 'unpaid' ? fine.cents : 0;

	return {
		fine,
		windowCloses,
		windowMet,
		carried,
		defect,
		status,
		owingCents,
		daysOwing:
			status === 'unpaid' && fine.postedIso ? Math.max(0, daysBetween(fine.postedIso, asOf)) : 0,
		aboveCeiling: fine.cents > fine.ceilingPerDayCents * fine.days
	};
}

/** Every fine on the books at `asOf`, read against the process. */
export function fineRegister(fines: BylawFine[], asOf: string): FineRegister {
	const rows = fines
		.map((fine) => fineRow(fine, asOf))
		.sort(
			(a, b) =>
				Number(a.status === 'paid') - Number(b.status === 'paid') ||
				b.daysOwing - a.daysOwing ||
				a.fine.lot.localeCompare(b.fine.lot)
		);

	const sum = (pick: (row: FineRow) => number) => rows.reduce((total, row) => total + pick(row), 0);
	const posted = rows.filter((row) => row.defect === null);

	return {
		asOf,
		rows,
		fines: rows.length,
		leviedCents: sum((row) => (row.defect === null ? row.fine.cents : 0)),
		paidCents: sum((row) => (row.status === 'paid' ? row.fine.cents : 0)),
		owingCents: sum((row) => row.owingCents),
		unpaid: posted.filter((row) => row.status === 'unpaid').length,
		defects: rows.filter((row) => row.defect !== null).length
	};
}
