/**
 * The September journal as a trial balance.
 *
 * The cash statement answers "what moved in the bank"; this sheet answers the
 * question an accountant asks before either figure is trusted — do the debits
 * and the credits add to the same number?
 *
 * Four rules:
 *
 * 1. **Every account the journal touched prints, including one that nets to
 *    zero.** An account that was debited and credited back is still part of the
 *    month, and dropping it would leave a reader unable to add the page up.
 * 2. **The two columns are the lines added, never a typed total.** A journal
 *    entry that does not balance therefore shows up as a difference on the page
 *    rather than being asserted away.
 * 3. **The balance column is the debits less the credits**, so an asset reads
 *    positive and an income or liability line reads negative, and the column
 *    adds to zero when the book is sound.
 * 4. **An account with a year-to-date balance and no September entry is named,
 *    not dropped.** The sample journal is nine entries while the year's books
 *    carry twenty expense and income lines; a trial balance that printed only
 *    the nine would look complete and be wrong. Those accounts are listed
 *    underneath and never counted in the totals.
 */

import { books, type JournalEntry } from './demo/books';

export interface ChartAccount {
	/** Four-digit ledger code. */
	code: string;
	name: string;
}

export interface TrialRow {
	code: string;
	name: string;
	debitCents: number;
	creditCents: number;
	/** Debits less credits. Positive is a debit balance. */
	balanceCents: number;
}

export interface TrialBalance {
	/** By code, so the page reads the way the ledger does. */
	rows: TrialRow[];
	debitTotalCents: number;
	creditTotalCents: number;
	/** The debits less the credits. Zero when the journal balances. */
	differenceCents: number;
	/** The balance column added up. Zero when every entry is double. */
	balanceTotalCents: number;
	ok: boolean;
	/** Accounts with a balance elsewhere in the books and no September entry. */
	unmoved: ChartAccount[];
}

/** The four-digit code at the front of a journal line's account string. */
export function accountCode(account: string): string {
	return account.slice(0, 4);
}

/** A journal line's own name for the account, with the code taken off. */
function accountName(account: string): string {
	const rest = account.slice(4).trim();
	return rest.length > 0 ? rest : account;
}

/**
 * The journal's accounts added up by code.
 *
 * Same-day entries and their order do not matter here: a trial balance is a
 * period, not a sequence, so the rows are ordered by code and nothing else.
 */
export function trialBalance(
	entries: JournalEntry[],
	chart: readonly ChartAccount[] = []
): TrialBalance {
	const rows = new Map<string, TrialRow>();

	for (const entry of entries) {
		for (const line of entry.lines) {
			const code = accountCode(line.account);
			const row =
				rows.get(code) ??
				({ code, name: accountName(line.account), debitCents: 0, creditCents: 0, balanceCents: 0 } as TrialRow);
			if (row.name === code) row.name = accountName(line.account);
			row.debitCents += line.debit ?? 0;
			row.creditCents += line.credit ?? 0;
			rows.set(code, row);
		}
	}

	const ordered = [...rows.values()]
		.map((row) => ({ ...row, balanceCents: row.debitCents - row.creditCents }))
		.sort((a, b) => a.code.localeCompare(b.code));

	const debitTotalCents = ordered.reduce((sum, row) => sum + row.debitCents, 0);
	const creditTotalCents = ordered.reduce((sum, row) => sum + row.creditCents, 0);
	const balanceTotalCents = ordered.reduce((sum, row) => sum + row.balanceCents, 0);

	const seen = new Set(ordered.map((row) => row.code));
	const unmoved = [...chart]
		.filter((account) => !seen.has(account.code))
		.sort((a, b) => a.code.localeCompare(b.code));

	return {
		rows: ordered,
		debitTotalCents,
		creditTotalCents,
		differenceCents: debitTotalCents - creditTotalCents,
		balanceTotalCents,
		ok: debitTotalCents === creditTotalCents && balanceTotalCents === 0,
		unmoved
	};
}

/**
 * The chart the "no September entry" line reads: every income and expense line
 * that carries a year-to-date amount. A line budgeted at zero owes nothing to
 * this sentence, so it is left out rather than named as unmoved.
 */
export function bookChart(): ChartAccount[] {
	return [
		...books.expenses.map((line) => ({ code: line.code, name: line.name, ytd: line.ytdCents })),
		...books.incomeLines.map((line) => ({ code: line.code, name: line.name, ytd: line.ytdCents }))
	]
		.filter((line) => line.ytd > 0)
		.map((line) => ({ code: line.code, name: line.name }));
}

/** The sample journal as paper. */
export function bookTrialBalance(): TrialBalance {
	return trialBalance(books.journal, bookChart());
}

export const BOOK_TRIAL_BALANCE = bookTrialBalance();
