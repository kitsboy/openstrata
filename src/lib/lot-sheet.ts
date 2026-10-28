/**
 * One lot's own sheet — the account behind the number.
 *
 * The units page answers "what is this lot owed?" in a panel. A sheet has to
 * answer the question an owner actually asks: which months were billed, what
 * cleared them, and what still stands. So the account is built from the months
 * billed in the fiscal year, each against its own payment, and from the dated
 * charges still open.
 *
 * Two rules keep it honest:
 *
 * 1. **A month is cleared when it was paid, and the demo knows that because the
 *    fee run matched deposits on the 1st.** A month inside the arrears window is
 *    the exception: nothing cleared it, so the line stands open. The account never
 *    infers a payment from a balance.
 * 2. **The account stops at the statement date.** The next fee, due on the 1st of
 *    the following month, is a dated item to come, not a line in the ledger; a
 *    ledger that ran ahead of today would look like a bill for a month not yet
 *    billed.
 */

import {
	daysPastDue,
	monthStart,
	periodOf,
	previousPeriod,
	type Charge,
	type ChargeKind
} from './arrears';

export interface AccountLine {
	/** The day the charge fell due. */
	date: string;
	kind: ChargeKind;
	/** `YYYY-MM` for a monthly fee or the late fee that follows it. */
	period?: string;
	charge: number;
	cleared: number;
	/** What still stands after this line, oldest first. */
	still: number;
}

export interface AccountOptions {
	/** This lot's monthly fee, in cents. */
	feeCents: number;
	/** The fiscal months already billed, oldest first (`YYYY-MM`). */
	months: string[];
	asOf: string;
}

/** Kinds in the order they land on the same day: the fee, then what followed it. */
const KIND_ORDER: Record<ChargeKind, number> = { fee: 0, late: 1, fine: 2, levy: 3 };

/**
 * The lot's account from `months` to `asOf`.
 *
 * A billed month that is not among the open fee charges was paid in full on its
 * due date, so it appears with `cleared` equal to the fee and moves nothing. A
 * month that is among them shows the charge with nothing against it.
 */
export function account(charges: Charge[], options: AccountOptions): AccountLine[] {
	const openFees = new Set(
		charges.filter((charge) => charge.kind === 'fee').map((charge) => charge.period ?? '')
	);

	const lines: Array<Omit<AccountLine, 'still'>> = [];

	for (const month of options.months) {
		const date = monthStart(month);
		if (date > options.asOf) continue;
		const open = openFees.has(month);
		lines.push({
			date,
			kind: 'fee',
			period: month,
			charge: options.feeCents,
			cleared: open ? 0 : options.feeCents
		});
	}

	for (const charge of charges) {
		if (charge.kind === 'fee') continue;
		if (charge.due > options.asOf) continue;
		lines.push({
			date: charge.due,
			kind: charge.kind,
			period: charge.period,
			charge: charge.cents,
			cleared: 0
		});
	}

	lines.sort(
		(a, b) => a.date.localeCompare(b.date) || KIND_ORDER[a.kind] - KIND_ORDER[b.kind]
	);

	let still = 0;
	return lines.map((line) => {
		still += line.charge - line.cleared;
		return { ...line, still };
	});
}

/** The open charges for one lot that have not reached their due date yet. */
export function upcoming(charges: Charge[], asOf: string): Charge[] {
	return charges
		.filter((charge) => charge.due > asOf)
		.sort((a, b) => a.due.localeCompare(b.due));
}

/**
 * Does this text name the lot? A calendar line says "lot 207" or "lots 201, 309,
 * and 404", never a bare three-digit number, so the match is confined to the
 * words after "lot"/"lots" up to the end of that clause. That keeps "$300 a day"
 * and "Form B, 7 days" out of it.
 */
export function mentionsLot(text: string, id: string): boolean {
	for (const match of text.matchAll(/\blots?\b[^.;]*/gi)) {
		if (new RegExp(`\\b${id}\\b`).test(match[0])) return true;
	}
	return false;
}

export interface DatedLike {
	date: string;
	title: string;
	detail: string;
}

/** Calendar items at or after `from` that name the lot, soonest first. */
export function forLot<T extends DatedLike>(items: T[], id: string, from: string, limit = 4): T[] {
	return items
		.filter((item) => item.date >= from && (mentionsLot(item.title, id) || mentionsLot(item.detail, id)))
		.sort((a, b) => a.date.localeCompare(b.date))
		.slice(0, limit);
}

/** How old the oldest open charge is, for the sheet's one-line summary. */
export function oldestDays(charges: Charge[], asOf: string): number {
	return charges.reduce((oldest, charge) => Math.max(oldest, daysPastDue(charge.due, asOf)), 0);
}

/** The fiscal months already billed: from the fiscal year's first month to `asOf`. */
export function billedMonths(fiscalStart: string, asOf: string): string[] {
	const months: string[] = [];
	let period = periodOf(fiscalStart);
	const last = periodOf(asOf);
	while (period <= last) {
		months.push(period);
		const [year, month] = period.split('-').map(Number);
		period = month === 12 ? `${year + 1}-01` : `${year}-${String(month + 1).padStart(2, '0')}`;
	}
	return months;
}

/** The period before the statement's own, for a caller building a next-fee date. */
export function periodBefore(day: string): string {
	return previousPeriod(periodOf(day));
}
