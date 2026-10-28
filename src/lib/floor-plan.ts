/**
 * The building as a plan instead of a grid of buttons.
 *
 * Evergreen House is a four-storey wood frame with a double-loaded corridor: lots
 * 01–05 sit on one side, 06–10 on the other, and the corridor runs between them.
 * The plan draws exactly that, in the order a person walking the floor would see:
 * floors top down, the lower numbers first in each row.
 *
 * Width is the one number that is not decoration. A lot takes the share of its
 * row that its square footage earns it, so a 1,540 sq ft two-bed reads wider than
 * a 548 sq ft studio at a glance. `MIN_SHARE` is the point where a proportional
 * width would stop carrying a legible lot number: below it a lot is held at the
 * minimum and the remaining width is shared among the others.
 *
 * Colours are not decided here. `tone()` in `demo/building` owns the rule (fees
 * behind, a missing Form K, a levy balance) and the filters read the same one, so
 * the plan cannot disagree with the list it replaced.
 */

import type { Unit } from './demo/building';

export type Side = 'north' | 'south';

export interface PlanRow {
	side: Side;
	/** Ascending by lot number, the way the numbers run along the corridor. */
	units: Unit[];
	sqft: number;
	/** Percentage width per unit, in the same order. Sums to 100. */
	shares: number[];
}

export interface FloorPlan {
	floor: number;
	/** North first, then south. A floor with one row in view has one entry. */
	rows: PlanRow[];
	lots: number;
	sqft: number;
}

/** The narrowest share a lot may take before it stops carrying its own number. */
export const MIN_SHARE = 14;

/**
 * Which side of the corridor a lot opens onto. The last two digits of the id are
 * the lot suffix: 01–05 north, 06–10 south.
 */
export function sideOf(id: string): Side {
	const suffix = Number(id.slice(-2));
	return suffix >= 1 && suffix <= 5 ? 'north' : 'south';
}

/**
 * Shares of a row, in percent, by square footage, with a floor under the small
 * lots. Shares are rounded to two decimals and the rounding drift is given back
 * to the widest lot, so a row always adds up to exactly 100 and the plan cannot
 * leave a hairline gap at the right edge.
 */
export function shares(sqft: number[], minShare = MIN_SHARE): number[] {
	const count = sqft.length;
	if (count === 0) return [];

	// Ten lots across one row would leave 10% each; the minimum cannot be larger
	// than an even split or the clamp would overrule every lot at once.
	const floor = Math.min(minShare, 100 / count);
	const pinned = sqft.map(() => false);
	const out = sqft.map(() => floor);

	for (let pass = 0; pass < count; pass += 1) {
		const free = sqft.map((_, index) => index).filter((index) => !pinned[index]);
		const available = Math.max(0, 100 - (count - free.length) * floor);
		const total = free.reduce((sum, index) => sum + sqft[index], 0);
		let clamped = false;

		for (const index of free) {
			const value = total > 0 ? (sqft[index] / total) * available : available / free.length;
			if (value < floor) {
				pinned[index] = true;
				clamped = true;
			}
			out[index] = Math.max(value, floor);
		}

		if (!clamped) break;
	}

	const rounded = out.map((value) => Math.round(value * 100) / 100);
	const drift = Math.round((100 - rounded.reduce((sum, value) => sum + value, 0)) * 100) / 100;
	if (drift !== 0) {
		let widest = 0;
		for (let index = 1; index < rounded.length; index += 1) {
			if (rounded[index] > rounded[widest]) widest = index;
		}
		rounded[widest] = Math.round((rounded[widest] + drift) * 100) / 100;
	}
	return rounded;
}

function rowOf(side: Side, lots: Unit[]): PlanRow | null {
	const units = lots
		.filter((unit) => sideOf(unit.id) === side)
		.sort((a, b) => Number(a.id) - Number(b.id));
	if (units.length === 0) return null;
	return {
		side,
		units,
		sqft: units.reduce((sum, unit) => sum + unit.sqft, 0),
		shares: shares(units.map((unit) => unit.sqft))
	};
}

/**
 * The plan for whatever the reader has filtered down to. A floor with nothing
 * left in view is dropped rather than drawn as an empty band, so a filter that
 * matches three lots on two floors shows two floors.
 */
export function plan(units: Unit[], keep: (unit: Unit) => boolean = () => true): FloorPlan[] {
	const floors = [...new Set(units.map((unit) => unit.floor))].sort((a, b) => b - a);

	return floors.flatMap((floor) => {
		const lots = units.filter((unit) => unit.floor === floor && keep(unit));
		if (lots.length === 0) return [];
		const rows = [rowOf('north', lots), rowOf('south', lots)].filter(
			(row): row is PlanRow => row !== null
		);
		return [
			{
				floor,
				rows,
				lots: lots.length,
				sqft: lots.reduce((sum, unit) => sum + unit.sqft, 0)
			}
		];
	});
}
