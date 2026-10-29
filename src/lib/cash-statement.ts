/**
 * The operating account as a statement a council can file.
 *
 * The journal tab already shows the statement on screen; this is the same book
 * as paper, with the chain printed beside every row. Four rules decide what the
 * sheet says, and each of them is here rather than in the component:
 *
 * 1. **The statement is one named bank account.** Cash in the journal is two
 *    accounts (`1010` operating, `1020` reserve), and a statement that ran on
 *    both would answer a question nobody files. The sheet reads `1010` alone;
 *    the reserve has its own five-year page. A line that moved the reserve and
 *    not this account is still printed, because of rule 2.
 * 2. **Every entry in the chain prints, even one that did not move this
 *    account.** A hash covers the entry and the hash above it, so removing a
 *    row from the page would break every hash below it — the sheet would tell a
 *    reader the chain is unbroken while making it impossible to check. Such a
 *    row prints a dash in the movement column and leaves the balance alone.
 * 3. **The opening balance is the closing less what the journal moved.** The
 *    closing figure is a ledger fact on the funds tab; deriving the opening from
 *    it means a reader can add the printed column up and land on the account's
 *    own cash instead of trusting an opening we typed.
 * 4. **A stopped statement keeps the same opening.** A month carried in from the
 *    health trend prints the entries posted by that day, run from the journal's
 *    opening balance. Nothing is estimated and no later entry is folded back.
 */

import { books, type JournalEntry } from './demo/books';
import { CASH_ACCOUNTS, GENESIS, statement } from './ledger-statement';

/** The operating chequing account, by its ledger code. */
export const OPERATING_ACCOUNT = '1010';

export interface CashStatementRow {
	entry: JournalEntry;
	/** The entry's effect on this account alone, in cents. */
	movement: number;
	/** Opening plus every movement up to and including this row. */
	balance: number;
	/** The journal's own hash for the entry, chained to the row above. */
	hash: string;
	/** Which bank accounts this entry moved, named by ledger code. */
	accounts: string[];
}

export interface CashStatement {
	account: string;
	opening: number;
	closing: number;
	/** Opening plus every printed movement; always `closing` when added up. */
	moved: number;
	rows: CashStatementRow[];
	/** Rows whose movement is not zero — the entries actually on this account. */
	movedEntries: number;
	/** The last printed hash, or the genesis link when there is nothing to print. */
	head: string;
	genesis: string;
}

/** One entry's effect on one account. The code is the first four characters. */
export function accountEffect(entry: JournalEntry, account: string): number {
	const code = account.slice(0, 4);
	return entry.lines.reduce((sum, line) => {
		if (line.account.slice(0, 4) !== code) return sum;
		return sum + (line.debit ?? 0) - (line.credit ?? 0);
	}, 0);
}

/** The bank accounts a reader would have to look at to follow this entry. */
export function accountsTouched(entry: JournalEntry): string[] {
	return CASH_ACCOUNTS.filter((account) => accountEffect(entry, account) !== 0);
}

/** The closing figure less what the journal moved, so the column adds up. */
export function accountOpening(
	entries: JournalEntry[],
	account: string,
	closingCash: number
): number {
	return closingCash - entries.reduce((sum, entry) => sum + accountEffect(entry, account), 0);
}

/**
 * The operating account's opening, from the cash the funds tab reports. Both
 * statements' openings add to the journal's combined opening, which is the check
 * that the book has no bank account the statement forgot.
 */
export const OPERATING_OPENING = accountOpening(
	books.journal,
	OPERATING_ACCOUNT,
	books.operating.cash
);

/**
 * Sort, chain and run the balance in one pass.
 *
 * The order and the hashes come from `ledger-statement`, so the sheet and the
 * page (and the search index) agree on both. Its balance is ignored: that one
 * runs on the two bank accounts together, and this statement is one account.
 */
export function cashStatement(
	entries: JournalEntry[],
	account: string = OPERATING_ACCOUNT,
	opening: number = OPERATING_OPENING
): CashStatement {
	let balance = opening;
	const rows = statement(entries, 0).map(({ entry, hash }) => {
		const movement = accountEffect(entry, account);
		balance += movement;
		return { entry, movement, balance, hash, accounts: accountsTouched(entry) };
	});

	return {
		account,
		opening,
		closing: balance,
		moved: balance - opening,
		rows,
		movedEntries: rows.filter((row) => row.movement !== 0).length,
		head: rows.at(-1)?.hash ?? GENESIS,
		genesis: GENESIS
	};
}

/** The whole sample journal as the operating account's statement. */
export function bookCashStatement(): CashStatement {
	return cashStatement(books.journal);
}
