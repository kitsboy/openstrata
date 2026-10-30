/**
 * The Form K reminders the register produces, at the statement date.
 *
 * Every row comes from `formKRegister`, so the letter's close date and its days
 * past are the ones the register and the health score already use. The occupancy
 * comes from the lot's own record, which is what lets a short-term lot be held out
 * of the mail run rather than asked for a tenancy form it cannot sign.
 *
 * The meeting is the October council night, where the agenda already carries the
 * Form K chase for lots 209 and 407. The module drops it once it is not ahead, so
 * a letter written after the meeting carries no date rather than a stale one.
 */

import { building, getUnit, units } from './building';
import { nextCouncil } from './meetings';
import { formKRegister } from '../form-k-register';
import { formKLetter, type FormKLetter } from '../form-k-letter';
import type { FiledForms } from '../form-k';

/** The council meeting that will see the register. */
export const FORM_K_MEETING = nextCouncil.iso;

/**
 * One result per tenanted row, refused ones included, so the page can say how many
 * letters print and why the rest do not.
 */
export function formKLetters(
	filed: FiledForms = {},
	asOf: string = building.asOf
): FormKLetter[] {
	return formKRegister(units, filed, asOf).rows.map((row) =>
		formKLetter({
			unitId: row.unitId,
			owner: row.owner,
			tenant: row.tenant,
			since: row.since,
			closes: row.closes,
			pastDays: row.pastDays,
			onFile: row.onFile,
			occupancy: getUnit(row.unitId)?.occupancy ?? 'tenant',
			asOf,
			meetingIso: FORM_K_MEETING
		})
	);
}

/** Only the letters that can be sent. */
export function issuableFormKLetters(
	filed: FiledForms = {},
	asOf: string = building.asOf
): FormKLetter[] {
	return formKLetters(filed, asOf).filter((letter) => letter.issuable);
}
