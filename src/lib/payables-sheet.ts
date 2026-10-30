/**
 * The payables tab as the page a treasurer signs before the cheques go out.
 *
 * The screen lists the same six items; this is the paper that answers the two
 * questions a council actually asks at the close — how much is open, and what
 * falls due inside the next thirty days.
 *
 * Four rules decide what the sheet says:
 *
 * 1. **Every bill in the ledger prints, including one already past due.** Days
 *    are counted from the books' own close, never from the clock, and a bill
 *    that was due before it prints a negative count rather than a zero that
 *    hides the lateness.
 * 2. **The source deductions are a liability, not a vendor bill.** The CRA
 *    remittance prints on the same page because it falls due with the rest, but
 *    it is held on 2100 and remitted; the basis names the account so a reader can
 *    find it in the journal.
 * 3. **The total is the rows added up**, never a typed figure, and the two
 *    windows are cut from the total, so a reader who adds the page lands on the
 *    same money.
 * 4. **The window has an end date.** "Inside thirty days" means on or before the
 *    close plus thirty, computed once and printed, so a sheet read a week later
 *    still says which day it was counting to.
 */

import { addDays, daysBetween } from './documents';
import { books } from './demo/books';
import { building } from './demo/building';

export interface PayableBill {
	/** Who is paid, or who the money is held for. */
	vendor: string;
	memo: string;
	/** The ledger account the liability sits on. */
	account: string;
	/** ISO day the bill or remittance falls due. */
	due: string;
	cents: number;
}

export interface PayableRow extends PayableBill {
	/** Whole days from the close to the due date. Negative means overdue. */
	days: number;
	overdue: boolean;
}

export interface PayablesSheet {
	/** The day every count is taken from — the books' close. */
	asOf: string;
	/** The last day inside the window: the close plus thirty days. */
	windowEnd: string;
	/** Earliest due first, then by vendor, so the next payment is at the top. */
	rows: PayableRow[];
	totalCents: number;
	/** Everything due on or before `windowEnd`, overdue bills included. */
	within30Cents: number;
	/** Everything after the window. `within30 + beyond` is always the total. */
	beyondCents: number;
	overdueCents: number;
	overdueCount: number;
	/** The first bill not yet late, or null when every bill is overdue. */
	next: PayableRow | null;
	/** True when the windows add back to the total. */
	ok: boolean;
}

export interface PayablesSource {
	bills: readonly PayableBill[];
	asOf: string;
	/** Days the window runs for. Thirty is the number the page says out loud. */
	windowDays?: number;
}

/** One bill, with its day count taken from the close rather than today. */
export function payableRow(bill: PayableBill, asOf: string): PayableRow {
	const days = daysBetween(asOf, bill.due) ?? 0;
	return { ...bill, days, overdue: days < 0 };
}

/** The sheet, from the ledger's own bills. */
export function payablesSheet(source: PayablesSource): PayablesSheet {
	const windowDays = source.windowDays ?? 30;
	const windowEnd = addDays(source.asOf, windowDays);
	const rows = source.bills
		.map((bill) => payableRow(bill, source.asOf))
		.sort((a, b) => a.due.localeCompare(b.due) || a.vendor.localeCompare(b.vendor));

	const totalCents = rows.reduce((sum, row) => sum + row.cents, 0);
	const within30Cents = rows
		.filter((row) => row.days <= windowDays)
		.reduce((sum, row) => sum + row.cents, 0);
	const beyondCents = totalCents - within30Cents;
	const overdue = rows.filter((row) => row.overdue);

	return {
		asOf: source.asOf,
		windowEnd,
		rows,
		totalCents,
		within30Cents,
		beyondCents,
		overdueCents: overdue.reduce((sum, row) => sum + row.cents, 0),
		overdueCount: overdue.length,
		next: rows.find((row) => !row.overdue) ?? null,
		ok: within30Cents + beyondCents === totalCents
	};
}

/**
 * The sample book's bills: the five vendor invoices plus the CRA remittance,
 * which falls due on 15 October and is why the page has two kinds of line.
 */
export const BOOK_PAYABLES = payablesSheet({
	bills: [
		...books.ap,
		{
			vendor: 'CRA — source deductions',
			memo: 'September CPP and EI, employee and employer',
			account: '2100',
			due: '2026-10-15',
			cents: books.payroll.remittance
		}
	],
	asOf: building.asOf
});
