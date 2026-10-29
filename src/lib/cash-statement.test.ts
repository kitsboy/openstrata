import { describe, expect, it } from 'vitest';
import { books } from './demo/books';
import { GENESIS, OPENING_CASH, bookStatement } from './ledger-statement';
import {
	OPERATING_ACCOUNT,
	OPERATING_OPENING,
	accountEffect,
	accountOpening,
	accountsTouched,
	bookCashStatement,
	cashStatement
} from './cash-statement';

const sheet = bookCashStatement();
const row = (memo: string) => sheet.rows.find((candidate) => candidate.entry.memo.includes(memo))!;

describe('the operating account statement', () => {
	it('is the operating account, not both bank accounts', () => {
		expect(OPERATING_ACCOUNT).toBe('1010');
		expect(sheet.account).toBe('1010');
		// The reserve's own interest is in the journal, but not in this column.
		expect(row('CRF interest posted').movement).toBe(0);
	});

	it('opens on the closing the funds tab reports less what the journal moved', () => {
		expect(OPERATING_OPENING + sheet.moved).toBe(books.operating.cash);
		expect(sheet.closing).toBe(books.operating.cash);
		// And the two accounts' openings add back to the journal's own opening.
		const reserveOpening = accountOpening(books.journal, '1020', books.crf.cash);
		expect(OPERATING_OPENING + reserveOpening).toBe(OPENING_CASH);
	});

	it('prints every entry in the chain, including the ones that missed the account', () => {
		// Four entries moved the operating account; five did not, and all nine
		// still print, because a dropped row would break every hash below it.
		expect(sheet.rows).toHaveLength(books.journal.length);
		expect(sheet.movedEntries).toBe(4);
		expect(sheet.rows.filter((candidate) => candidate.movement === 0)).toHaveLength(5);
	});

	it('leaves the balance alone on an entry that moved no operating cash', () => {
		const billed = row('September strata fees billed');
		expect(billed.movement).toBe(0);
		// It is the first row of the statement, so it leaves the opening untouched.
		expect(billed.balance).toBe(sheet.opening);
	});

	it('moves the balance by the account\u2019s own lines only', () => {
		// The war chest is bought out of operating cash and sits at cost (1080).
		const warChest = row('War-chest purchase');
		expect(warChest.movement).toBe(-40_500);
		expect(warChest.accounts).toEqual(['1010']);
		expect(accountEffect(warChest.entry, '1080')).toBe(40_500);

		// September's payroll: gross less the employee's EI and CPP.
		expect(row('Concierge payroll').movement).toBe(-90_458);
	});

	it('names the account an entry moved, even when it is not this one', () => {
		expect(accountsTouched(row('September fee cash').entry)).toEqual(['1010', '1020']);
		expect(row('CRF interest posted').accounts).toEqual(['1020']);
		expect(row('Insurance amortized').accounts).toEqual([]);
	});

	it('carries the journal\u2019s own hashes, not a second chain', () => {
		const journal = bookStatement();
		expect(sheet.rows.map((candidate) => candidate.hash)).toEqual(
			journal.map((candidate) => candidate.hash)
		);
	});

	it('adds the printed column up to the printed closing balance', () => {
		const added = sheet.rows.reduce((sum, candidate) => sum + candidate.movement, sheet.opening);
		expect(added).toBe(sheet.closing);
		expect(sheet.rows.at(-1)!.balance).toBe(sheet.closing);
		expect(sheet.head).toBe(sheet.rows.at(-1)!.hash);
	});

	it('stops a statement at a day without estimating anything after it', () => {
		const stopped = cashStatement(
			books.journal.filter((entry) => entry.date <= '2026-09-05'),
			OPERATING_ACCOUNT,
			OPERATING_OPENING
		);
		expect(stopped.rows).toHaveLength(4);
		expect(stopped.head).toBe(bookStatement()[3].hash);
		expect(stopped.closing).toBe(
			stopped.opening + stopped.rows.reduce((sum, candidate) => sum + candidate.movement, 0)
		);
		// The four rows are the journal's first four, and nothing after 5 September
		// is folded into the closing balance.
		expect(stopped.rows.map((candidate) => candidate.entry.date)).toEqual([
			'2026-09-01',
			'2026-09-01',
			'2026-09-02',
			'2026-09-05'
		]);
	});

	it('prints an opening and nothing else when the period has no entries', () => {
		const empty = cashStatement([], OPERATING_ACCOUNT, OPERATING_OPENING);
		expect(empty.rows).toEqual([]);
		expect(empty.head).toBe(GENESIS);
		expect(empty.moved).toBe(0);
		expect(empty.movedEntries).toBe(0);
		expect(empty.closing).toBe(empty.opening);
	});

	it('can state the reserve account from the same rules', () => {
		const reserve = cashStatement(
			books.journal,
			'1020',
			accountOpening(books.journal, '1020', books.crf.cash)
		);
		expect(reserve.closing).toBe(books.crf.cash);
		expect(row('CRF interest posted').movement).toBe(0);
		expect(reserve.rows.find((candidate) => candidate.entry.memo.includes('CRF interest posted'))!.movement).toBe(36_000);
	});
});
