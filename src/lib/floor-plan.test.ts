import { describe, expect, it } from 'vitest';
import { units, type Unit } from './demo/building';
import { MIN_SHARE, plan, shares, sideOf } from './floor-plan';

const rowShares = (row: { shares: number[] }) => row.shares;
const round = (value: number) => Math.round(value * 100) / 100;

describe('sideOf', () => {
	it('puts lots 01 to 05 on the north side and 06 to 10 on the south', () => {
		expect(sideOf('101')).toBe('north');
		expect(sideOf('105')).toBe('north');
		expect(sideOf('106')).toBe('south');
		expect(sideOf('410')).toBe('south');
	});
});

describe('plan', () => {
	it('draws every lot of the building exactly once, on its own floor', () => {
		const drawn = plan(units).flatMap((floor) => floor.rows.flatMap((row) => row.units));
		expect(drawn.map((unit) => unit.id).sort()).toEqual(units.map((unit) => unit.id).sort());
		for (const floor of plan(units)) {
			for (const unit of floor.rows.flatMap((row) => row.units)) {
				expect(unit.floor, `${unit.id} sits on floor ${floor.floor}`).toBe(floor.floor);
			}
		}
	});

	it('runs floors top down and lot numbers up', () => {
		const floors = plan(units);
		expect(floors.map((floor) => floor.floor)).toEqual([4, 3, 2, 1]);
		for (const floor of floors) {
			expect(floor.rows.map((row) => row.side)).toEqual(['north', 'south']);
			for (const row of floor.rows) {
				const numbers = row.units.map((unit) => Number(unit.id));
				expect([...numbers].sort((a, b) => a - b)).toEqual(numbers);
			}
		}
	});

	it('counts the lots and the square footage that survived the filter', () => {
		const keep = (unit: Unit) => unit.formK === 'missing';
		const floors = plan(units, keep);
		const kept = units.filter(keep);
		expect(floors.reduce((sum, floor) => sum + floor.lots, 0)).toBe(kept.length);
		expect(floors.reduce((sum, floor) => sum + floor.sqft, 0)).toBe(
			kept.reduce((sum, unit) => sum + unit.sqft, 0)
		);
	});

	it('drops a floor with nothing left in view', () => {
		const onlyOnFour = (unit: Unit) => unit.floor === 4;
		expect(plan(units, onlyOnFour).map((floor) => floor.floor)).toEqual([4]);
		expect(plan(units, () => false)).toEqual([]);
	});

	it('keeps one row when a filter empties the other side', () => {
		const onlySouth = (unit: Unit) => Number(unit.id.slice(-2)) > 5;
		for (const floor of plan(units, onlySouth)) {
			expect(floor.rows.map((row) => row.side)).toEqual(['south']);
		}
	});
});

describe('shares', () => {
	it('gives every row of the plan exactly 100 percent', () => {
		for (const floor of plan(units)) {
			for (const row of floor.rows) {
				const total = rowShares(row).reduce((sum, value) => sum + value, 0);
				expect(round(total), `floor ${floor.floor} ${row.side}`).toBe(100);
			}
		}
	});

	it('makes the width follow the square footage', () => {
		const sqft = [800, 900, 1000, 1100, 1200];
		const widths = shares(sqft);
		for (let index = 1; index < widths.length; index += 1) {
			expect(widths[index], `${sqft[index]} sq ft wider than ${sqft[index - 1]}`).toBeGreaterThan(
				widths[index - 1]
			);
		}
		// Nobody is near the minimum here, so the widest lot is its plain share.
		expect(widths[4]).toBe(24);
	});

	it('holds a small lot at the minimum and gives the rest back to the others', () => {
		const widths = shares([300, 1200, 1200]);
		expect(Math.min(...widths)).toBe(MIN_SHARE);
		expect(round(widths.reduce((sum, value) => sum + value, 0))).toBe(100);
		expect(widths[1]).toBe(widths[2]);
	});

	it('splits a row evenly when the minimum would not fit every lot', () => {
		const widths = shares([500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400]);
		expect(new Set(widths).size).toBe(1);
		expect(widths[0]).toBe(10);
	});

	it('gives a single lot the whole row and an empty row nothing', () => {
		expect(shares([900])).toEqual([100]);
		expect(shares([])).toEqual([]);
	});
});
