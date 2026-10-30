/**
 * The arrears ladder as a letter to the owner it is about.
 *
 * The ladder on `/accounting` is the council's instrument: it ranks lots, ages
 * money and is read by people who already see every lot. The owner gets nothing
 * they can hold — no amounts by month, no statement of what clears the account,
 * no day by which to answer. This module is that letter, and four rules keep it
 * from becoming a demand:
 *
 * 1. **Only money that has fallen due is asked for.** The next month's fee, due
 *    after the letter's own date, prints on its own line as not yet due and is
 *    never part of the amount to clear; a letter that collected a bill nobody is
 *    late on would be wrong on its face.
 *
 * 2. **The age is the due date counted to the letter's date.** A charge due
 *    tomorrow is not one day old, and a charge due on the letter's date is zero
 *    days late, not one — the same rule the ladder uses, so the two cannot tell
 *    different stories about the same money.
 *
 * 3. **A plan is a schedule, not arrears.** A levy being paid down on an agreed
 *    schedule is printed with its instalment and left out of the arrears figure
 *    and out of the oldest age, because the owner keeping their word should not
 *    be handed a letter that reads like the one to the owner who stopped paying.
 *
 * 4. **The deadline is the building's own bylaw, not an invention.** The late
 *    fee attaches on the 5th, so the day a plan has to be agreed is the 5th of
 *    the month after the letter — after that the council's own rule adds money,
 *    and a letter that set its own deadline would contradict the books.
 *
 * Label-free: the caller supplies the owner, the lot and the payment route.
 */

import { dayIn, daysPastDue, nextPeriod, periodOf } from './arrears';
import type { Charge, ChargeKind } from './arrears';
import { docReference } from './documents';

export interface LetterLine {
	kind: ChargeKind;
	/** The day the charge fell due. */
	due: string;
	/** `YYYY-MM` for a monthly fee or the late fee that follows it. */
	period?: string;
	cents: number;
	/** Days past due at the letter's date; 0 when it fell due that day. */
	daysLate: number;
	/** Cents a month when this charge is on an agreed schedule. */
	planCents?: number;
}

export interface ArrearsLetter {
	unitId: string;
	owner: string;
	/** The day the letter is written, and the day every age is counted to. */
	asOf: string;
	/** `OS-AL-2026-09-309`. */
	reference: string;
	/** Everything due on or before `asOf`, oldest first. */
	lines: LetterLine[];
	/** The next fee, due after `asOf`; printed, and not asked for. */
	next: LetterLine | null;
	/** Every charge due now, the plan instalments included. */
	dueNowCents: number;
	/** The overdue money that is not on a schedule — the arrears, properly. */
	arrearsCents: number;
	/** What a payment today would clear outside any agreed schedule. */
	clearCents: number;
	/** The balance being paid down on a plan, and its instalment. */
	plannedCents: number;
	planMonthlyCents: number | null;
	/** Age of the oldest charge not on a plan; 0 when there is none. */
	oldestDays: number;
	/** What the bylaw adds on the 5th, and the day a plan must be agreed. */
	lateFeeCents: number;
	deadline: string;
}

/** Kinds in the order a reader meets them on one day. */
const KIND_ORDER: Record<ChargeKind, number> = { fee: 0, late: 1, fine: 2, levy: 3 };

function toLine(charge: Charge, asOf: string): LetterLine {
	const daysLate = Math.max(0, daysPastDue(charge.due, asOf));
	return {
		kind: charge.kind,
		due: charge.due,
		...(charge.period ? { period: charge.period } : {}),
		cents: charge.cents,
		daysLate,
		...(charge.planCents ? { planCents: charge.planCents } : {})
	};
}

/**
 * The letter for one lot.
 *
 * `charges` is every dated charge on the building — the same `charges(asOf)` call
 * the receivables page makes — so the letter cannot total money the ladder beside
 * it does not have. `lateFeeCents` is the building's bylaw figure, passed in
 * rather than restated here.
 */
export function arrearsLetter(
	unit: { id: string; owner: string },
	charges: Charge[],
	asOf: string,
	lateFeeCents: number
): ArrearsLetter {
	const mine = charges.filter((charge) => charge.unitId === unit.id);

	const lines = mine
		.filter((charge) => charge.due <= asOf)
		.map((charge) => toLine(charge, asOf))
		.sort(
			(a, b) => a.due.localeCompare(b.due) || KIND_ORDER[a.kind] - KIND_ORDER[b.kind]
		);

	const nextCharge = mine
		.filter((charge) => charge.due > asOf)
		.sort((a, b) => a.due.localeCompare(b.due))[0];

	const dueNowCents = lines.reduce((sum, line) => sum + line.cents, 0);
	const plannedCents = lines
		.filter((line) => line.planCents)
		.reduce((sum, line) => sum + line.cents, 0);
	const arrearsCents = lines
		.filter((line) => !line.planCents && line.daysLate > 0)
		.reduce((sum, line) => sum + line.cents, 0);
	const planMonthlyCents = lines.find((line) => line.planCents)?.planCents ?? null;
	const oldestDays = lines
		.filter((line) => !line.planCents)
		.reduce((oldest, line) => Math.max(oldest, line.daysLate), 0);

	// The next late fee attaches on the 5th of the month after the letter. That
	// is the day the building's own bylaw makes answering cost more, so it is the
	// day the letter gives to agree a plan.
	const deadline = dayIn(nextPeriod(periodOf(asOf)), 5);

	return {
		unitId: unit.id,
		owner: unit.owner,
		asOf,
		reference: `${docReference('OS-AL', asOf)}-${unit.id}`,
		lines,
		next: nextCharge ? toLine(nextCharge, asOf) : null,
		dueNowCents,
		arrearsCents,
		clearCents: dueNowCents - plannedCents,
		plannedCents,
		planMonthlyCents,
		oldestDays,
		lateFeeCents,
		deadline
	};
}
