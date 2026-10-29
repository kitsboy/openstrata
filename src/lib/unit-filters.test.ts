import { describe, expect, it } from 'vitest';
import {
	NO_UNIT_FILTERS,
	QUERY_LIMIT,
	UNIT_FILTERS_KEY,
	filtersNarrow,
	floorNumber,
	normaliseUnitFilters,
	readUnitFilters,
	writeUnitFilters,
	type UnitFilters
} from './unit-filters';

/** The two methods this module uses, backed by a Map. */
function fakeStorage(seed: Record<string, string> = {}) {
	const data = new Map(Object.entries(seed));
	return {
		data,
		getItem: (key: string) => data.get(key) ?? null,
		setItem: (key: string, value: string) => void data.set(key, value),
		removeItem: (key: string) => void data.delete(key)
	};
}

const narrowed: UnitFilters = { query: 'ivan', focus: 'arrears', floor: 3 };

describe('normalising a stored filter', () => {
	it('keeps a readable filter exactly', () => {
		expect(normaliseUnitFilters({ query: 'ivan', focus: 'arrears', floor: 3 })).toEqual(narrowed);
	});

	it('falls back one part at a time, not the whole record', () => {
		// An older build's tone must not also cost the reader their search or floor.
		expect(normaliseUnitFilters({ query: 'ivan', focus: 'gone', floor: 3 })).toEqual({
			query: 'ivan',
			focus: 'all',
			floor: 3
		});
		expect(normaliseUnitFilters({ focus: 'levy' })).toEqual({
			query: '',
			focus: 'levy',
			floor: 'all'
		});
	});

	it('reads a floor from a string, and refuses one off the building', () => {
		expect(normaliseUnitFilters({ floor: '2' }).floor).toBe(2);
		expect(normaliseUnitFilters({ floor: 0 }).floor).toBe('all');
		expect(normaliseUnitFilters({ floor: 5 }).floor).toBe('all');
		expect(normaliseUnitFilters({ floor: 2.5 }).floor).toBe('all');
	});

	it('trims a query and bounds its length', () => {
		expect(normaliseUnitFilters({ query: '  207  ' }).query).toBe('207');
		const long = normaliseUnitFilters({ query: 'x'.repeat(QUERY_LIMIT + 40) }).query;
		expect(long).toHaveLength(QUERY_LIMIT);
	});

	it('answers the whole building for a value it cannot read', () => {
		expect(normaliseUnitFilters(null)).toEqual(NO_UNIT_FILTERS);
		expect(normaliseUnitFilters('arrears')).toEqual(NO_UNIT_FILTERS);
		expect(normaliseUnitFilters({ query: 42, focus: [] })).toEqual(NO_UNIT_FILTERS);
	});
});

describe('reading and writing the device', () => {
	it('round-trips a narrowed list', () => {
		const storage = fakeStorage();
		writeUnitFilters(storage, narrowed);
		expect(readUnitFilters(storage)).toEqual(narrowed);
		expect(storage.data.has(UNIT_FILTERS_KEY)).toBe(true);
	});

	it('forgets the record when the list is the whole building again', () => {
		const storage = fakeStorage();
		writeUnitFilters(storage, narrowed);
		writeUnitFilters(storage, NO_UNIT_FILTERS);
		// Nothing stored, rather than a record of the defaults.
		expect(storage.data.has(UNIT_FILTERS_KEY)).toBe(false);
		expect(readUnitFilters(storage)).toEqual(NO_UNIT_FILTERS);
	});

	it('survives a corrupt value, a missing key and storage that throws', () => {
		expect(readUnitFilters(fakeStorage({ [UNIT_FILTERS_KEY]: '{not json' }))).toEqual(NO_UNIT_FILTERS);
		expect(readUnitFilters(fakeStorage({ [UNIT_FILTERS_KEY]: '"arrears"' }))).toEqual(
			NO_UNIT_FILTERS
		);
		expect(readUnitFilters(null)).toEqual(NO_UNIT_FILTERS);
		const throwing = {
			getItem: () => {
				throw new Error('denied');
			},
			setItem: () => {
				throw new Error('quota');
			},
			removeItem: () => {
				throw new Error('denied');
			}
		};
		expect(readUnitFilters(throwing)).toEqual(NO_UNIT_FILTERS);
		expect(() => writeUnitFilters(throwing, narrowed)).not.toThrow();
	});
});

describe('narrowing', () => {
	it('says which lists are narrower than the building', () => {
		expect(filtersNarrow(NO_UNIT_FILTERS)).toBe(false);
		expect(filtersNarrow({ ...NO_UNIT_FILTERS, query: '207' })).toBe(true);
		expect(filtersNarrow({ ...NO_UNIT_FILTERS, focus: 'formk' })).toBe(true);
		expect(filtersNarrow({ ...NO_UNIT_FILTERS, floor: 4 })).toBe(true);
	});

	it('turns a floor into the number a chip shows, or null for all', () => {
		expect(floorNumber(3)).toBe(3);
		expect(floorNumber('all')).toBeNull();
	});
});
