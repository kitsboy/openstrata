/**
 * Evergreen House's outstanding charges, each with the day it fell due.
 *
 * The lot records in `building.ts` say how much a lot owes; they do not say when
 * each part of it started owing. This module supplies the dates from the rules
 * the demo already states — fees due on the 1st, the $50 late fee on the 5th —
 * and from the small set of dated facts listed below. It is demo data with dates,
 * not a policy engine: `lib/arrears` owns the counting.
 *
 * The one rule worth stating out loud: a levy on a payment plan is not aged.
 * Lots 108 and 403 are paying theirs down on an agreed schedule, so their
 * balances sit outside the ladder and are counted separately.
 */

import type { Charge } from '../arrears';
import { dayIn, duePeriods, monthStart, nextPeriod, periodOf } from '../arrears';
import { LATE_FEE_CENTS, building, monthlyFeeCents, units, type Unit } from './building';

/** When a bylaw fine was posted. The journal dates lot 309's to September 16. */
const FINE_POSTED: Record<string, string> = {
	'309': '2026-09-16'
};

/**
 * When an unpaid levy became payable. The parkade levy passed at the special
 * general meeting of 12 November 2025; lot 207 paid a third that day and stopped.
 */
const LEVY_DUE: Record<string, string> = {
	'207': '2025-11-12'
};

/** The two levies being paid down on an agreed plan. */
export const LEVY_PLAN_CENTS: Record<string, number> = {
	'108': 30_000,
	'403': 45_000
};

/**
 * Split an amount into `count` whole parts, newest month first. Cents are not
 * divisible in general, so the remainder rides on the oldest charge: the total
 * has to match the balance to the cent, and the oldest charge is the one whose
 * exact date nobody can contradict.
 */
function split(cents: number, count: number): number[] {
	if (count <= 0) return [];
	const base = Math.floor(cents / count);
	const parts = Array.from({ length: count }, () => base);
	parts[count - 1] += cents - base * count;
	return parts;
}

/** Every standing charge on the building at `asOf`, dated. */
export function charges(asOf: string = building.asOf): Charge[] {
	const out: Charge[] = [];

	units.forEach((unit: Unit) => {
		const fee = monthlyFeeCents(unit.entitlement);

		// The next fee, due on the 1st. It belongs in the total and in "current",
		// not in an aging bucket: on September 30 the October fee is real money
		// owed and not yet late.
		if (!unit.prepaidOctober) {
			const next = nextPeriod(periodOf(asOf));
			out.push({ unitId: unit.id, kind: 'fee', due: monthStart(next), cents: fee, period: next });
		}

		// The months behind, newest first, with the late fee that followed each.
		const behind = duePeriods(asOf, unit.feeArrearsMonths);
		for (const period of behind) {
			out.push({ unitId: unit.id, kind: 'fee', due: monthStart(period), cents: fee, period });
		}

		if (unit.lateOwing > 0) {
			const lateParts = split(
				unit.lateOwing,
				Math.max(1, Math.round(unit.lateOwing / LATE_FEE_CENTS))
			);
			behind.forEach((period, index) => {
				out.push({
					unitId: unit.id,
					kind: 'late',
					due: dayIn(period, 5),
					cents: lateParts[index] ?? 0,
					period
				});
			});
			// More late fees than months behind (or no months at all) still has to
			// land somewhere: the oldest fee carries the rest on its own date.
			const placed = behind.length;
			for (let index = placed; index < lateParts.length; index += 1) {
				out.push({ unitId: unit.id, kind: 'late', due: asOf, cents: lateParts[index] });
			}
		}

		if (unit.fineOwing > 0) {
			out.push({
				unitId: unit.id,
				kind: 'fine',
				due: FINE_POSTED[unit.id] ?? asOf,
				cents: unit.fineOwing
			});
		}

		if (unit.levyOwing > 0) {
			out.push({
				unitId: unit.id,
				kind: 'levy',
				due: LEVY_DUE[unit.id] ?? asOf,
				cents: unit.levyOwing,
				planCents: LEVY_PLAN_CENTS[unit.id]
			});
		}
	});

	return out;
}
