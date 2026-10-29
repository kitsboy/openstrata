import { describe, expect, it } from 'vitest';
import { isCryptoRail, newestReceipt, receiptFacts, splitFee } from './pay-receipt';
import { receipts, type Receipt } from './demo/payments';
import { btcQuote } from './demo/format';
import {
	BTC_CAD_CENTS,
	crfPortionCents,
	getUnit,
	operatingPortionCents
} from './demo/building';

const row = (over: Partial<Receipt>): Receipt => ({
	date: '2026-09-01',
	unitId: '305',
	owner: 'Priya Raman',
	method: 'E-transfer',
	cents: 57_600,
	reference: 'LMS2847-305-202609',
	note: 'Settled.',
	...over
});

describe('the split a receipt prints', () => {
	it('adds the two parts back to the amount, for every payment in the tape', () => {
		for (const entry of receipts) {
			const { split } = receiptFacts(entry);
			expect(
				split.operatingCents + split.reserveCents,
				`${entry.unitId} ${entry.method}`
			).toBe(entry.cents);
		}
	});

	it('matches the fee’s own $3.90 / $0.60 a point on a whole monthly fee', () => {
		// Lot 305's September fee is a whole fee, so the receipt's split has to be
		// the same two figures the pay sheet explains.
		const fee = receipts.find((entry) => entry.unitId === '305' && entry.method === 'Lightning')!;
		const { entitlement } = getUnit('305');
		const { split } = receiptFacts(fee);
		expect(split.operatingCents).toBe(operatingPortionCents(entitlement));
		expect(split.reserveCents).toBe(crfPortionCents(entitlement));
	});

	it('gives the odd cent to the reserve instead of losing it', () => {
		expect(splitFee(5)).toEqual({ operatingCents: 4, reserveCents: 1 });
		expect(splitFee(3)).toEqual({ operatingCents: 3, reserveCents: 0 });
		const { operatingCents, reserveCents } = splitFee(1);
		expect(operatingCents + reserveCents).toBe(1);
	});
});

describe('what a receipt prints about its rail', () => {
	it('prints the reference on every rail, and a transaction only on a crypto one', () => {
		const transfer = receiptFacts(row({ method: 'E-transfer' }));
		expect(transfer.reference).toBe('LMS2847-305-202609');
		expect(transfer.txid).toBeNull();
		expect(transfer.rateCents).toBeNull();
		expect(transfer.sats).toBeNull();
		expect(isCryptoRail('Lightning')).toBe(true);
		expect(isCryptoRail('Cheque')).toBe(false);
	});

	it('quotes the rate a crypto payment locked at, and the sats that rate bought', () => {
		const lightning = receipts.find((entry) => entry.unitId === '305' && entry.method === 'Lightning')!;
		const facts = receiptFacts(lightning);
		expect(facts.rateCents).toBe(lightning.rateCents);
		expect(facts.txid).toBe(lightning.txid);
		// The quantity comes from the recorded rate, not from today's rate.
		expect(facts.sats).toBe(btcQuote(lightning.cents, lightning.rateCents!).sats);
		expect(facts.btc).toBe(btcQuote(lightning.cents, lightning.rateCents!).btc);
	});

	it('says nothing about a rate it does not have, rather than pricing today', () => {
		const facts = receiptFacts(row({ method: 'Bitcoin', txid: 'f'.repeat(64) }));
		expect(facts.rateCents).toBeNull();
		expect(facts.sats).toBeNull();
		expect(facts.btc).toBeNull();
		// The one thing a receipt must never do: invent a rate.
		expect(facts.sats).not.toBe(btcQuote(row({}).cents, BTC_CAD_CENTS).sats);
	});

	it('drops a transaction id recorded against a rail that cannot carry one', () => {
		const cheque = receiptFacts(row({ method: 'Cheque', txid: 'a'.repeat(64) }));
		expect(cheque.txid).toBeNull();
	});
});

describe('the receipt a reader gets before picking one', () => {
	it('is the newest payment on the tape, last row first on a tie', () => {
		expect(newestReceipt(receipts)?.date).toBe('2026-09-18');
		expect(newestReceipt(receipts)?.unitId).toBe('302');
		expect(
			newestReceipt([
				row({ date: '2026-09-01', unitId: '101' }),
				row({ date: '2026-09-01', unitId: '102' })
			])?.unitId
		).toBe('102');
		expect(newestReceipt([])).toBeNull();
	});

	it('every payment in the tape can be printed as a complete receipt', () => {
		for (const entry of receipts) {
			const facts = receiptFacts(entry);
			expect(facts.owner.trim().length, entry.unitId).toBeGreaterThan(0);
			expect(facts.unitId, entry.reference).toBeTruthy();
			expect(facts.cents, entry.reference).toBeGreaterThan(0);
			expect(facts.reference, entry.reference).toMatch(/^LMS2847-/);
			expect(facts.note.trim().length, entry.reference).toBeGreaterThan(0);
		}
	});
});
