import { describe, it, expect } from 'vitest';
import {
	parseRecentSearches,
	serializeRecentSearches,
	recordSearch,
	removeSearch,
	MAX_RECENT_SEARCHES
} from './recent-searches';

describe('recent searches', ()	 => {
	it('degrades to empty on null, malformed JSON, or non-array payloads', () => {
		expect(parseRecentSearches(null)).toEqual([]);
		expect(parseRecentSearches(undefined)).toEqual([]);
		expect(parseRecentSearches('not json')).toEqual([]);
		expect(parseRecentSearches('{"a":1}')).toEqual([]);
		expect(parseRecentSearches('[1,2,3]')).toEqual([]);
	});

	it('trims, drops empties, and caps each query at 80 characters', () => {
		expect(recordSearch([], '  form b  ')).toEqual(['form b']);
		expect(recordSearch([], '   ')).toEqual([]);
		const long = 'a'.repeat(200);
		expect(recordSearch([], long)).toEqual(['a'.repeat(80)]);
	});

	it('dedupes case-insensitively, keeping the first occurrence', () => {
		expect(parseRecentSearches(JSON.stringify(['Form B', 'form b', 'FORM B']))).toEqual(['Form B']);
	});

	it('caps the list at five entries', () => {
		const entries = parseRecentSearches(JSON.stringify(['a1', 'b2', 'c3', 'd4', 'e5', 'f6', 'g7']));
		expect(entries.length).toBe(MAX_RECENT_SEARCHES);
		expect(entries).toEqual(['a1', 'b2', 'c3', 'd4', 'e5']);
	});

	it('round-trips through serialize', () => {
		const round = parseRecentSearches(serializeRecentSearches(['Form B', 'minutes', 'x'.repeat(99)]));
		expect(round).toEqual(['Form B', 'minutes', 'x'.repeat(80)]);
	});

	it('recordSearch puts the new query first and moves an existing one up', () => {
		expect(recordSearch(['minutes', 'form b'], 'Form B')).toEqual(['Form B', 'minutes']);
		expect(recordSearch(['minutes'], 'xpub')).toEqual(['xpub', 'minutes']);
	});

	it('removeSearch matches case-insensitively and ignores unknown entries', () => {
		expect(removeSearch(['Form B', 'minutes'], 'FORM B')).toEqual(['minutes']);
		expect(removeSearch(['Form B'], 'arrears')).toEqual(['Form B']);
	});
});
