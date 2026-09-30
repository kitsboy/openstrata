import { describe, expect, it } from 'vitest';
import {
	MAX_SAVED_SEARCHES,
	isSaved,
	parseSavedSearches,
	readSavedSearches,
	saveSearch,
	serializeSavedSearches,
	unsaveSearch
} from './saved-searches';

describe('saved searches', () => {
	it('round-trips through serialize/parse', () => {
		const raw = serializeSavedSearches(['arrears', 'Form B']);
		expect(parseSavedSearches(raw)).toEqual(['arrears', 'Form B']);
	});

	it('pins land on top and dedupe case-insensitively', () => {
		let pins = saveSearch([], 'arrears');
		pins = saveSearch(pins, 'Form B');
		pins = saveSearch(pins, 'FORM B');
		expect(pins).toEqual(['FORM B', 'arrears']);
	});

	it('unsaves case-insensitively and ignores unknown entries', () => {
		const pins = saveSearch(saveSearch([], 'arrears'), 'Form B');
		expect(unsaveSearch(pins, 'form b')).toEqual(['arrears']);
		expect(unsaveSearch(pins, 'nothing')).toEqual(pins);
	});

	it('isSaved folds case', () => {
		const pins = saveSearch([], 'arrears');
		expect(isSaved(pins, 'Arrears')).toBe(true);
		expect(isSaved(pins, 'other')).toBe(false);
	});

	it('caps length and count', () => {
		const long = 'x'.repeat(120);
		const pins = saveSearch([], long);
		expect(pins[0].length).toBe(80);
		let many: string[] = [];
		for (let i = 0; i < MAX_SAVED_SEARCHES + 3; i += 1) many = saveSearch(many, `q-${i}`);
		expect(many.length).toBe(MAX_SAVED_SEARCHES);
		expect(many[0]).toBe(`q-${MAX_SAVED_SEARCHES + 2}`);
	});

	it('degrades malformed storage to empty', () => {
		expect(parseSavedSearches(null)).toEqual([]);
		expect(parseSavedSearches('not json')).toEqual([]);
		expect(parseSavedSearches('{"a":1}')).toEqual([]);
		expect(parseSavedSearches('[1,2,3]')).toEqual([]);
		expect(readSavedSearches()).toEqual([]);
	});
});
