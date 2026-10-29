/**
 * A Form K the council has recorded, on this device.
 *
 * The demo book carries the register as it stood on 30 September: lot 309's
 * tenant moved in on 1 July and the two-week window closed without a form, and
 * lots 209 and 407 went quiet on 15 September. A council that receives the form
 * afterwards has something the sheet has never been able to show — the gap
 * closed — and the score is supposed to notice, because it scores the paperwork,
 * not the history of the paperwork.
 *
 * So this is a record with a date, not a switch. Three rules follow:
 *
 * 1. **A filing counts from the day it was made.** `isFiled(forms, id, asOf)` is
 *    true only when the recorded day is on or before the statement date being
 *    scored, so filing a form today cannot rewrite August's gap. Every month that
 *    closed before the form arrived keeps the score it earned.
 * 2. **It is device-local, like every other nudge here.** No account, no network
 *    call, and the note beside the button says so: the register in the sample book
 *    is not what this changes.
 * 3. **Storage is read defensively.** A corrupt, partial or hostile entry
 *    degrades to "nothing filed" rather than throwing — the same convention
 *    `saved-searches.ts`, `setup.ts` and `resume.ts` follow.
 */

import { browser } from '$app/environment';

/** localStorage key holding the filings. */
export const FORM_K_KEY = 'openstrata-form-k-filed';

export interface FiledFormK {
	/** The day the form arrived, `YYYY-MM-DD`. */
	filedOn: string;
	/** Who recorded it, as the sheet names them. */
	by: string;
}

/** Unit id to its filing. A lot with no entry has nothing on file here. */
export type FiledForms = Record<string, FiledFormK>;

const DAY = /^\d{4}-\d{2}-\d{2}$/;
const MAX_BY = 60;

/** A `YYYY-MM-DD` day that is a real calendar day, or null. */
function realDay(value: unknown): string | null {
	if (typeof value !== 'string' || !DAY.test(value)) return null;
	const [year, month, day] = value.split('-').map(Number);
	const date = new Date(Date.UTC(year, month - 1, day));
	return date.getUTCFullYear() === year &&
		date.getUTCMonth() === month - 1 &&
		date.getUTCDate() === day
		? value
		: null;
}

/** Unit ids in this book are three digits; anything else is not a lot. */
function lotId(value: string): boolean {
	return /^\d{3}$/.test(value);
}

function coerce(raw: unknown): FiledForms {
	if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
	const forms: FiledForms = {};
	for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
		if (!lotId(key)) continue;
		if (!value || typeof value !== 'object' || Array.isArray(value)) continue;
		const entry = value as Record<string, unknown>;
		const filedOn = realDay(entry.filedOn);
		if (!filedOn) continue;
		const by = typeof entry.by === 'string' ? entry.by.trim().slice(0, MAX_BY) : '';
		forms[key] = { filedOn, by: by || 'Recorded on this device' };
	}
	return forms;
}

/** Parse a persisted record. Malformed or hostile storage degrades to empty. */
export function parseFiledForms(raw: string | null | undefined): FiledForms {
	if (!raw) return {};
	let parsed: unknown;
	try {
		parsed = JSON.parse(raw);
	} catch {
		return {};
	}
	return coerce(parsed);
}

/** Serialize. Round-trips through `parse`, so a write cannot store what read rejects. */
export function serializeFiledForms(forms: FiledForms): string {
	return JSON.stringify(coerce(forms));
}

/** Record one lot's form on a day. An unusable day or lot changes nothing. */
export function recordFormK(
	forms: FiledForms,
	unitId: string,
	filedOn: string,
	by = 'Recorded on this device'
): FiledForms {
	if (!lotId(unitId) || !realDay(filedOn)) return forms;
	return { ...forms, [unitId]: { filedOn, by: by.trim().slice(0, MAX_BY) || 'Recorded on this device' } };
}

/** Drop one lot's record. A lot with nothing filed changes nothing. */
export function clearFormK(forms: FiledForms, unitId: string): FiledForms {
	if (!(unitId in forms)) return forms;
	const next = { ...forms };
	delete next[unitId];
	return next;
}

/** The day this lot's form was recorded, or null when it has not been. */
export function filedOn(forms: FiledForms, unitId: string): string | null {
	return forms[unitId]?.filedOn ?? null;
}

/**
 * Was the form on file at `asOf`? A filing dated after that day does not count,
 * which is what keeps a month already closed from being re-scored.
 */
export function isFiled(forms: FiledForms, unitId: string, asOf: string): boolean {
	const day = filedOn(forms, unitId);
	return day !== null && day <= asOf;
}

export function readFiledForms(): FiledForms {
	if (!browser) return {};
	try {
		return parseFiledForms(localStorage.getItem(FORM_K_KEY));
	} catch {
		return {};
	}
}

export function writeFiledForms(forms: FiledForms): void {
	if (!browser) return;
	try {
		localStorage.setItem(FORM_K_KEY, serializeFiledForms(forms));
	} catch {
		/* private mode / storage full — the record simply is not remembered */
	}
}
