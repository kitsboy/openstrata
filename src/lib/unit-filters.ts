/**
 * The unit list's filters, kept on the device.
 *
 * A reader narrows the building to the lots in arrears, opens one lot's sheet,
 * and comes back to a list that has forgotten what they were looking at. The
 * filter is a place in the building, not a keystroke, so it survives the trip.
 *
 * Three rules:
 *
 * 1. **Only a readable filter is restored.** Storage is text a user can edit and
 *    a browser can hand back from an older build, so an unknown tone, a floor
 *    that is not 1–4, and a query that is not a string all fall back to "all"
 *    rather than filtering the list to nothing.
 * 2. **Nothing stored when nothing is filtered.** A cleared list removes the
 *    record instead of writing a record of the defaults, so a reader who never
 *    filtered the list leaves no trace on the device.
 * 3. **A query is trimmed and bounded.** The search box's value is the catalogue
 *    of a device's patience; an 80-character cap is longer than any lot, owner
 *    or tenant name it could match.
 */

export const UNIT_TONES = [
	'all',
	'arrears',
	'formk',
	'levy',
	'withheld',
	'vacant',
	'short-term'
] as const;

export type UnitTone = (typeof UNIT_TONES)[number];

export const UNIT_FLOORS = ['all', 1, 2, 3, 4] as const;

export type UnitFloor = (typeof UNIT_FLOORS)[number];

export interface UnitFilters {
	query: string;
	focus: UnitTone;
	floor: UnitFloor;
}

/** The cleared list: no search, every tone, every floor. */
export const NO_UNIT_FILTERS: UnitFilters = { query: '', focus: 'all', floor: 'all' };

/** One key, so a reader clearing site data clears this too. */
export const UNIT_FILTERS_KEY = 'openstrata.units.filters';

export const QUERY_LIMIT = 80;

/** The narrowest surface the reader and the site header share. */
type Reader = Pick<Storage, 'getItem'>;
type Writer = Pick<Storage, 'setItem' | 'removeItem'>;

function isTone(value: unknown): value is UnitTone {
	return typeof value === 'string' && (UNIT_TONES as readonly string[]).includes(value);
}

function isFloor(value: unknown): value is UnitFloor {
	if (value === 'all') return true;
	const level = typeof value === 'number' ? value : Number(value);
	return Number.isInteger(level) && level >= 1 && level <= 4;
}

function isFiltered(filters: UnitFilters): boolean {
	return filters.query !== '' || filters.focus !== 'all' || filters.floor !== 'all';
}

/**
 * Whatever came out of storage, as a filter the list can run. Unknown parts fall
 * back one at a time, so a stale tone does not also cost the reader their search.
 */
export function normaliseUnitFilters(raw: unknown): UnitFilters {
	if (!raw || typeof raw !== 'object') return { ...NO_UNIT_FILTERS };
	const record = raw as Record<string, unknown>;
	const query = typeof record.query === 'string' ? record.query.trim().slice(0, QUERY_LIMIT) : '';
	const focus = isTone(record.focus) ? record.focus : 'all';
	const floor = isFloor(record.floor) ? (record.floor === 'all' ? 'all' : (Number(record.floor) as 1 | 2 | 3 | 4)) : 'all';
	return { query, focus, floor };
}

/** True when the list is showing anything narrower than the whole building. */
export function filtersNarrow(filters: UnitFilters): boolean {
	return isFiltered(filters);
}

/** A stored filter, or the cleared list when there is nothing readable there. */
export function readUnitFilters(storage: Reader | null | undefined): UnitFilters {
	if (!storage) return { ...NO_UNIT_FILTERS };
	try {
		const raw = storage.getItem(UNIT_FILTERS_KEY);
		return raw ? normaliseUnitFilters(JSON.parse(raw)) : { ...NO_UNIT_FILTERS };
	} catch {
		// Quota, privacy mode, or a corrupt value: the whole building is the
		// honest answer, because the reader can see what they are on.
		return { ...NO_UNIT_FILTERS };
	}
}

/**
 * Saves the filter, or forgets it when it is the whole building. A failed write
 * is not the reader's problem — the list in front of them stays correct.
 */
export function writeUnitFilters(storage: Writer | null | undefined, filters: UnitFilters): void {
	if (!storage) return;
	try {
		if (!isFiltered(filters)) {
			storage.removeItem(UNIT_FILTERS_KEY);
			return;
		}
		storage.setItem(UNIT_FILTERS_KEY, JSON.stringify(filters));
	} catch {
		/* Storage is a convenience here, never the state of the app. */
	}
}

/** A floor chip's label argument: the number, or `all` for the whole building. */
export function floorNumber(floor: UnitFloor): number | null {
	return floor === 'all' ? null : floor;
}
