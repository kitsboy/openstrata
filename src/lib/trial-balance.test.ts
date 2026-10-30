import { describe, expect, it } from 'vitest';
import type { JournalEntry } from './demo/books';
import { BOOK_TRIAL_BALANCE, accountCode, trialBalance } from './trial-balance';

const entry = (lines: JournalEntry['lines'], date = '2026-09-01'): JournalEntry => ({
	date,
	memo: 'Test entry',
	postedBy: 'Test',
	evidence: 'Test',
	lines
});

describe('trial balance', () => {
	it('prints every account the journal touched, by code', () => {
		const sheet = BOOK_TRIAL_BALANCE;
		expect(sheet.rows).toHaveLength(18);
		expect(sheet.rows.map((row) => row.code)).toEqual([
			'1010', '1020', '1080', '1200', '1210', '1220', '1300', '2030', '2035',
			'2100', '4010', '4020', '6100', '6210', '6215', '7030', '7060', '7100'
		]);
		// The name comes from the journal's own line, without the code in front.
		expect(sheet.rows.find((row) => row.code === '1010')?.name).toBe('Operating chequing');
	});

	it('adds the debits and the credits to the same figure', () => {
		const sheet = BOOK_TRIAL_BALANCE;
		expect(sheet.debitTotalCents).toBeGreaterThan(0);
		expect(sheet.debitTotalCents).toBe(sheet.creditTotalCents);
		expect(sheet.differenceCents).toBe(0);
		expect(sheet.balanceTotalCents).toBe(0);
		expect(sheet.ok).toBe(true);
	});

	it('reads the balance column as debits less credits', () => {
		const sheet = BOOK_TRIAL_BALANCE;
		// An asset carries a debit balance and an income line a credit one.
		const cash = sheet.rows.find((row) => row.code === '1010')!;
		expect(cash.balanceCents).toBe(cash.debitCents - cash.creditCents);
		expect(cash.balanceCents).toBeGreaterThan(0);
		const fees = sheet.rows.find((row) => row.code === '4010')!;
		expect(fees.balanceCents).toBeLessThan(0);
	});

	it('keeps an account that was debited and credited back to zero', () => {
		const sheet = trialBalance([
			entry([{ account: '1010 Operating chequing', debit: 500 }, { account: '4010 Fee income — operating', credit: 500 }]),
			entry([{ account: '4010 Fee income — operating', debit: 500 }, { account: '1010 Operating chequing', credit: 500 }])
		]);
		const cash = sheet.rows.find((row) => row.code === '1010')!;
		expect(cash.debitCents).toBe(500);
		expect(cash.creditCents).toBe(500);
		expect(cash.balanceCents).toBe(0);
		expect(sheet.rows).toHaveLength(2);
		expect(sheet.ok).toBe(true);
	});

	it('lets an unbalanced entry print a difference instead of asserting one away', () => {
		const sheet = trialBalance([
			entry([{ account: '1010 Operating chequing', debit: 500 }, { account: '4010 Fee income — operating', credit: 400 }])
		]);
		expect(sheet.differenceCents).toBe(100);
		expect(sheet.balanceTotalCents).toBe(100);
		expect(sheet.ok).toBe(false);
	});

	it('names the accounts that carry a year-to-date balance and no September entry', () => {
		const sheet = BOOK_TRIAL_BALANCE;
		expect(sheet.unmoved).toHaveLength(26);
		expect(sheet.unmoved.map((account) => account.code)).toContain('6110');
		expect(sheet.unmoved.map((account) => account.code)).toContain('7010');
		// An account the journal posted to is not named as unmoved, and a line
		// budgeted at zero is not named at all.
		const codes = sheet.unmoved.map((account) => account.code);
		expect(codes).not.toContain('6100');
		expect(codes).not.toContain('7030');
		expect(codes).not.toContain('6320');
		// Those accounts are never in the journal's totals.
		expect(sheet.rows.map((row) => row.code)).not.toContain('6110');
	});

	it('reads the first four characters as the code, whatever the name', () => {
		expect(accountCode('1010 Operating chequing')).toBe('1010');
		expect(accountCode('2100 Source deductions payable')).toBe('2100');
	});
});
