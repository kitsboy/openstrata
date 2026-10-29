/**
 * The September journal read as a statement rather than a list of entries.
 *
 * Three things turn a pile of double entries into something a treasurer can sign:
 *
 * 1. **Date order.** The journal is written in the order the work was done, not
 *    the order the dates run, so the statement sorts it. Same-day entries keep
 *    the order they were written in.
 * 2. **A running cash balance.** Only the two bank accounts — 1010 operating and
 *    1020 reserve — are cash. A fee billed to a receivable, the war chest at cost
 *    and the prepaid insurance all move value without moving a bank balance, and
 *    counting them would make the column lie. The last line therefore lands on
 *    the cash the Three funds tab reports.
 * 3. **A hash chain.** Each entry's hash is computed from the entry and the hash
 *    above it, so changing a line changes every hash below. This is the same
 *    shape the host keeps durably; here it runs in the browser on the demo books,
 *    which is why the drawer says so instead of implying a server checked it.
 */

import { books, type JournalEntry } from './demo/books';

export interface StatementRow {
	entry: JournalEntry;
	/** Net effect on the two bank accounts, in cents. Positive is money in. */
	cash: number;
	/** Opening cash plus every entry up to and including this one. */
	balance: number;
	/** 16 hex characters, chained to the hash of the entry above. */
	hash: string;
}

/**
 * The two bank accounts, named rather than pattern-matched. 1080 is the war chest
 * at cost — a separate asset that happens to start with 10 and would have been
 * swept into a prefix rule. A third bank account is a decision, so it is added
 * here on purpose.
 */
export const CASH_ACCOUNTS = ['1010', '1020'] as const;

export function isCashAccount(account: string): boolean {
	return (CASH_ACCOUNTS as readonly string[]).includes(account.slice(0, 4));
}

export function cashEffect(entry: JournalEntry): number {
	return entry.lines.reduce((sum, line) => {
		if (!isCashAccount(line.account)) return sum;
		return sum + (line.debit ?? 0) - (line.credit ?? 0);
	}, 0);
}

/** Everything the hash covers, written in a fixed order. */
function fingerprint(entry: JournalEntry): string {
	const lines = entry.lines
		.map((line) => `${line.account}|${line.debit ?? 0}|${line.credit ?? 0}`)
		.join(';');
	return `${entry.date}|${entry.memo}|${lines}`;
}

function fnv1a(text: string, seed: number): string {
	let hash = seed >>> 0;
	for (let index = 0; index < text.length; index += 1) {
		hash ^= text.charCodeAt(index);
		hash = Math.imul(hash, 0x01000193) >>> 0;
	}
	return hash.toString(16).padStart(8, '0');
}

/** Two seeded passes, so the demo hash is 16 hex characters rather than 8. */
export function chainHash(entry: JournalEntry, previous: string): string {
	const text = `${previous}|${fingerprint(entry)}`;
	return fnv1a(text, 0x811c9dc5) + fnv1a(text, 0x7f4a7c15);
}

/** The genesis link: the hash the first entry is chained to. */
export const GENESIS = '0000000000000000';

/**
 * The sample book's opening cash: the closing cash the funds tab reports, less
 * everything the journal moved. It lives here rather than on a page because two
 * readers need the same number — the statement, and the search result that opens
 * a journal entry by the hash that number produces. A second copy of this
 * subtraction would produce different hashes for the same entry.
 */
export const OPENING_CASH =
	books.operating.cash +
	books.crf.cash -
	books.journal.reduce((sum, entry) => sum + cashEffect(entry), 0);

/** The whole book as a statement, chained from the opening balance above. */
export function bookStatement(): StatementRow[] {
	return statement(books.journal, OPENING_CASH);
}

/**
 * Sort, run the balance, and chain the hashes in one pass.
 *
 * `openingCash` is passed in rather than guessed: opening cash is a ledger fact,
 * and deriving it from the closing balance would make the tie a tautology the
 * reader could not check.
 */
export function statement(entries: JournalEntry[], openingCash: number): StatementRow[] {
	const ordered = entries
		.map((entry, index) => ({ entry, index }))
		.sort((a, b) => a.entry.date.localeCompare(b.entry.date) || a.index - b.index)
		.map((item) => item.entry);

	let balance = openingCash;
	let previous = GENESIS;

	return ordered.map((entry) => {
		const cash = cashEffect(entry);
		balance += cash;
		const hash = chainHash(entry, previous);
		previous = hash;
		return { entry, cash, balance, hash };
	});
}
