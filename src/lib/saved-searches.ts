/**
 * Saved searches — the dashboard's pinned queries.
 *
 * A council repeatedly runs the same lookups ("arrears", "Form B", the AGM's
 * notice window). Retyping them into ⌘K is friction; the recents list buries
 * them after five newer searches. Saved searches are the deliberate tier:
 * pinned by hand, capped small, and rendered on the dashboard where the list
 * is useful — one tap opens `/search?q=`, the same index the modal runs.
 *
 * Device-local only, like every other nudge in this app (recents, the wizard
 * draft, the setup ticks): no account, no network call, nothing leaves the
 * browser. Pure and testable — `read`/`write` tolerate absent, malformed or
 * hostile storage by degrading to "no saves", the same convention
 * `recent-searches.ts`, `resume.ts` and `setup.ts` follow.
 */

import { browser } from '$app/environment';

/** localStorage key holding the saves. Device-local, like every other nudge. */
export const SAVED_SEARCHES_KEY = 'openstrata-saved-searches';

/** Small on purpose: pins are scarce by definition. */
export const MAX_SAVED_SEARCHES = 8;

/** One query, capped, so a pasted paragraph cannot bloat the dashboard. */
const MAX_QUERY_LENGTH = 80;

/** Dedupe key — case-insensitive, because "Form B" and "form b" are one query. */
const fold = (value: string): string => value.trim().toLowerCase();

/** Normalize any candidate list: trim, cap, dedupe (oldest dropped first). */
function coerceList(items: unknown): string[] {
	if (!Array.isArray(items)) return [];
	const seen = new Set<string>();
	const out: string[] = [];
	for (const item of items) {
		if (typeof item !== 'string') continue;
		const trimmed = item.trim().slice(0, MAX_QUERY_LENGTH);
		if (!trimmed) continue;
		const key = fold(trimmed);
		if (seen.has(key)) continue;
		seen.add(key);
		out.push(trimmed);
		if (out.length >= MAX_SAVED_SEARCHES) break;
	}
	return out;
}

/**
 * Parse a persisted saves list. Anything malformed or hostile degrades to an
 * empty list — never a throw.
 */
export function parseSavedSearches(raw: string | null | undefined): string[] {
	if (!raw) return [];
	let parsed: unknown;
	try {
		parsed = JSON.parse(raw);
	} catch {
		return [];
	}
	return coerceList(parsed);
}

/** Serialize. Round-trips through `parse` so write can never store what read would reject. */
export function serializeSavedSearches(entries: string[]): string {
	return JSON.stringify(coerceList(entries));
}

/** A new pin lands on top; an existing one moves up instead of duplicating. */
export function saveSearch(existing: string[], query: string): string[] {
	return coerceList([query, ...existing]);
}

/** Remove one pin, matching case-insensitively. Unknown entries change nothing. */
export function unsaveSearch(existing: string[], query: string): string[] {
	const target = fold(query);
	return coerceList(existing.filter((entry) => fold(entry) !== target));
}

/** Is this query already pinned? Case-insensitive. */
export function isSaved(existing: string[], query: string): boolean {
	return existing.some((entry) => fold(entry) === fold(query));
}

export function readSavedSearches(): string[] {
	if (!browser) return [];
	try {
		return parseSavedSearches(localStorage.getItem(SAVED_SEARCHES_KEY));
	} catch {
		return [];
	}
}

export function writeSavedSearches(entries: string[]): void {
	if (!browser) return;
	try {
		localStorage.setItem(SAVED_SEARCHES_KEY, serializeSavedSearches(entries));
	} catch {
		/* private mode / storage full — pins simply are not remembered */
	}
}
