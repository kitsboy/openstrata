import { describe, expect, it } from 'vitest';
import type { JournalEntry } from './demo/books';
import { GENESIS, cashEffect, chainHash, isCashAccount, statement } from './ledger-statement';

const entry = (date: string, memo: string, lines: JournalEntry['lines']): JournalEntry => ({
	date,
	memo,
	lines,
	postedBy: 'Test — fixture',
	evidence: 'A test entry.'
});

const opening = 500_000;

const sample: JournalEntry[] = [
	entry('2026-09-05', 'Late fees', [
		{ account: '1210 Late fees receivable', debit: 10_000 },
		{ account: '7060 Late fee income', credit: 10_000 }
	]),
	entry('2026-09-01', 'Fees billed', [
		{ account: '1200 Accounts receivable — fees', debit: 240_000 },
		{ account: '4010 Fee income — operating', credit: 200_000 },
		{ account: '4020 Fee income — CRF', credit: 40_000 }
	]),
	entry('2026-09-02', 'Fee cash', [
		{ account: '1010 Operating chequing', debit: 208_000 },
		{ account: '1020 CRF savings', debit: 32_000 },
		{ account: '1200 Accounts receivable — fees', credit: 240_000 }
	]),
	entry('2026-09-03', 'War chest', [
		{ account: '1080 BTC war chest at cost', debit: 40_500 },
		{ account: '1010 Operating chequing', credit: 40_500 }
	])
];

describe('cashEffect', () => {
	it('counts only the two bank accounts', () => {
		expect(isCashAccount('1010 Operating chequing')).toBe(true);
		expect(isCashAccount('1020 CRF savings')).toBe(true);
		expect(isCashAccount('1080 BTC war chest at cost')).toBe(false);
		expect(isCashAccount('1200 Accounts receivable — fees')).toBe(false);
	});

	it('nets debits and credits on cash, and leaves a non-cash entry at zero', () => {
		expect(cashEffect(sample[2])).toBe(240_000);
		expect(cashEffect(sample[3])).toBe(-40_500);
		expect(cashEffect(sample[0])).toBe(0);
		expect(cashEffect(sample[1])).toBe(0);
	});
});

describe('statement', () => {
	it('reads in date order, keeping the written order within a day', () => {
		const rows = statement(sample, opening);
		expect(rows.map((row) => row.entry.memo)).toEqual([
			'Fees billed',
			'Fee cash',
			'War chest',
			'Late fees'
		]);
	});

	it('runs the cash balance after every entry', () => {
		const rows = statement(sample, opening);
		expect(rows[0].balance).toBe(opening);
		expect(rows[1].balance).toBe(opening + 240_000);
		expect(rows[2].balance).toBe(opening + 199_500);
		expect(rows[3].balance).toBe(opening + 199_500);
	});

	it('ends on the opening cash plus the net cash movement', () => {
		const rows = statement(sample, opening);
		const net = sample.reduce((sum, item) => sum + cashEffect(item), 0);
		expect(rows.at(-1)?.balance).toBe(opening + net);
		expect(net).toBe(199_500);
	});

	it('does not move the balance for value that never reached a bank account', () => {
		const withoutCash = sample.filter((item) => cashEffect(item) === 0);
		const rows = statement(withoutCash, opening);
		expect(rows.every((row) => row.balance === opening)).toBe(true);
	});

	it('leaves an empty journal with no rows rather than an opening line', () => {
		expect(statement([], opening)).toEqual([]);
	});
});

describe('chainHash', () => {
	it('is 16 hex characters and stable for the same entry and parent', () => {
		const first = chainHash(sample[0], GENESIS);
		expect(first).toMatch(/^[0-9a-f]{16}$/);
		expect(chainHash(sample[0], GENESIS)).toBe(first);
	});

	it('changes when a line changes', () => {
		const edited = entry('2026-09-05', 'Late fees', [
			{ account: '1210 Late fees receivable', debit: 20_000 },
			{ account: '7060 Late fee income', credit: 20_000 }
		]);
		expect(chainHash(edited, GENESIS)).not.toBe(chainHash(sample[0], GENESIS));
	});

	it('changes when a memo changes', () => {
		const renamed = entry('2026-09-05', 'Late fees, corrected', sample[0].lines);
		expect(chainHash(renamed, GENESIS)).not.toBe(chainHash(sample[0], GENESIS));
	});

	it('carries the hash above it, so an edit breaks every hash below', () => {
		const clean = statement(sample, opening);
		const tampered = statement(
			sample.map((item) =>
				item.memo === 'Fee cash' ? { ...item, memo: 'Fee cash, amended' } : item
			),
			opening
		);
		// Fee cash sorts second, so the first hash is untouched and the rest break.
		expect(tampered[0].hash).toBe(clean[0].hash);
		expect(tampered[1].hash).not.toBe(clean[1].hash);
		expect(tampered[2].hash).not.toBe(clean[2].hash);
		expect(tampered[3].hash).not.toBe(clean[3].hash);
	});
});
