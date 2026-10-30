/**
 * The reminder the secretary sends to a lot whose Form K window has closed.
 *
 * The register on `/units/register` counts the gaps and costs them points, and the
 * lot's own sheet shows a date field for a filing recorded on this device. Neither
 * is something an owner can be handed. This module is the letter, and five rules
 * keep it from saying more than the building's own record supports:
 *
 * 1. **Only a closed window on a tenancy is written to.** A tenant who moved in
 *    last week has not failed anything, so an open window produces no letter; a
 *    lot already on file produces none either.
 *
 * 2. **A short-term lot is not sent a Form K.** A Form K acknowledges a tenancy,
 *    and the building's bylaw bans stays under thirty days. Lot 309 is on the
 *    register because a start date exists, but its remedy is the bylaw file, so
 *    the letter is refused with `short-term` rather than asking a landlord to
 *    acknowledge guests as tenants.
 *
 * 3. **The letter repeats the register's own count.** The close date and the days
 *    past are handed in, not recomputed, so the letter, the register and the health
 *    score cannot disagree. A count that does not match its own dates produces no
 *    letter, because one of the two numbers is wrong.
 *
 * 4. **No money is stated.** The bylaw's $200 a day attaches to a stay under
 *    thirty days, not to a late Form K, so this letter carries no amount at all.
 *    `fineCents` is typed `null` to make that a decision a test can hold.
 *
 * 5. **A meeting that is not still ahead sets no date.** Council will have the
 *    register at its next meeting, and a meeting that has already passed leaves
 *    the letter with no date rather than one in the past.
 *
 * Label-free: the caller supplies the wording.
 */

import { daysBetween } from './arrears';
import { docReference } from './documents';

export interface FormKLetterInput {
	unitId: string;
	owner: string;
	/** The tenant of record, as the register names them, or null. */
	tenant: string | null;
	/** The day the tenancy began. */
	since: string;
	/** The day the two-week window closed, from the register. */
	closes: string;
	/** Days the window has been closed, from the register. */
	pastDays: number;
	/** True when the register already holds a Form K for this lot. */
	onFile: boolean;
	/** The lot's occupancy. A short-term stay is not a tenancy to acknowledge. */
	occupancy: string;
	/** The day the letter is written. */
	asOf: string;
	/** The council meeting that will see this register, or null. */
	meetingIso: string | null;
}

export type FormKLetterDefect = 'filed' | 'tenant' | 'open' | 'short-term' | 'count' | null;

export interface FormKLetter {
	unitId: string;
	owner: string;
	tenant: string | null;
	asOf: string;
	/** `OS-FK-2026-09-209`. */
	reference: string;
	since: string;
	closes: string;
	pastDays: number;
	/** Always null: a late Form K carries no fine in this building's bylaw. */
	fineCents: null;
	/** The meeting that will see the register, when one is still ahead. */
	meetingIso: string | null;
	daysToMeeting: number | null;
	issuable: boolean;
	defect: FormKLetterDefect;
}

export function formKLetter(input: FormKLetterInput): FormKLetter {
	const countAgrees = daysBetween(input.closes, input.asOf) === input.pastDays;
	const meetingAhead =
		input.meetingIso !== null && daysBetween(input.asOf, input.meetingIso) > 0;
	const meetingDays = meetingAhead ? daysBetween(input.asOf, input.meetingIso as string) : null;

	// The order matters: a lot on file is not late, a short-term lot has no tenancy
	// to acknowledge, an open window is not late even if a caller hands in a
	// positive count by mistake, and a count that disagrees with its dates means
	// one of the two numbers is wrong.
	const defect: FormKLetterDefect = input.onFile
		? 'filed'
		: input.occupancy === 'short-term'
			? 'short-term'
			: input.tenant === null
				? 'tenant'
				: input.pastDays <= 0
					? 'open'
					: !countAgrees
						? 'count'
						: null;

	return {
		unitId: input.unitId,
		owner: input.owner,
		tenant: input.tenant,
		asOf: input.asOf,
		reference: `${docReference('OS-FK', input.asOf)}-${input.unitId}`,
		since: input.since,
		closes: input.closes,
		pastDays: Math.max(0, input.pastDays),
		fineCents: null,
		meetingIso: meetingAhead ? input.meetingIso : null,
		daysToMeeting: meetingDays,
		issuable: defect === null,
		defect
	};
}
