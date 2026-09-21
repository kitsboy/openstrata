/**
 * Recent searches — the ⌘K modal's memory of what you looked for.
 *
 * The empty modal used to be a blank box with a hint; a person who searched
 * "Form B" yesterday had to type it again. This keeps the last few queries on
 * the device only — the same privacy posture as the wizard draft, the setup
 * ticks and the first-visit choice: no account, no network call, nothing
 * leaves the browser.
 *
 * Pure and testable: the only impure surface is `read`/`write`, which tolerate
 * absent, malformed or hostile storage by degrading to "no recents", the same
 * convention `resume.ts`, `setup.ts` and `start.ts` follow. Corrupt storage
 * must never break the modal that decorates.
 */

import { browser } from '$app/environment';

/** localStorage key holding the recents. Device-local, like every other nudge. */
export const RECENT_SEARCHES_KEY = 'openstrata-recent-searches';

/** Small on purpose: a recents list is a shortcut, not an archive. */
export const MAX_RECENT_SEARCHES = 5;

/** One query, capped, so a pasted paragraph cannot bloat the modal. */
const MAX_QUERY_LENGTH = 80;

/** Dedupe key — case-insensitive, because "form b" and "Form B" are one search. */
const fold = (value: string): string => value.trim().toLowerCase();

/** Normalize any candidate list: trim, cap, dedupe (newest first). */
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
		if (out.length >= MAX_RECENT_SEARCHES) break;
	}
	return out;
}

/**
 * Parse a persisted recents list. Anything malformed or hostile degrades to an
 * empty list — never a throw.
 */
export function parseRecentSearches(raw: string | null | undefined): string[] {
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
export function serializeRecentSearches(entries: string[]): string {
	return JSON.stringify(coerceList(entries));
}

/** A new query lands on top; an existing one moves up instead of duplicating. */
export function recordSearch(existing: string[], query: string): string[] {
	return coerceList([query, ...existing]);
}

/** Remove one entry, matching case-insensitively. Unknown entries change nothing. */
export function removeSearch(existing: string[], query: string): string[] {
	const target = fold(query);
	return coerceList(existing.filter((entry) => fold(entry) !== target));
}

export function readRecentSearches(): string[] {
	if (!browser) return [];
	try {
		return parseRecentSearches(localStorage.getItem(RECENT_SEARCHES_KEY));
	} catch {
		return [];
	}
}

export function writeRecentSearches(entries: string[]): void {
	if (!browser) return;
	try {
		localStorage.setItem(RECENT_SEARCHES_KEY, serializeRecentSearches(entries));
	} catch {
		/* private mode / storage full — recents simply are not remembered */
	}
}
