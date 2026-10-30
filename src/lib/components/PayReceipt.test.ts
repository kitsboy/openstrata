import { beforeEach, describe, expect, it } from 'vitest';
import { render, waitFor } from '@testing-library/svelte';
import PayReceipt from './PayReceipt.svelte';
import { locale } from '$lib/i18n';
import { money, satsLabel } from '$lib/demo/format';
import { receipts } from '$lib/demo/payments';
import { receiptFacts } from '$lib/pay-receipt';

const lightning = receipts.find((row) => row.method === 'Lightning')!;
const cheque = receipts.find((row) => row.method === 'Cheque')!;

describe('the receipt sheet', () => {
	beforeEach(() => locale.set('en'));

	it('puts the amount, the lot, the rail and the reference on the council’s letterhead', () => {
		const { container } = render(PayReceipt, { receipt: receiptFacts(cheque) });
		const text = container.textContent ?? '';
		expect(text).toContain('Evergreen House');
		expect(text).toContain('The Owners, Strata Plan LMS 2847');
		expect(text).toContain('Receipt for payment received');
		expect(text).toContain(money(cheque.cents));
		expect(text).toContain(cheque.reference);
		expect(text).toContain(cheque.owner);
		expect(text).toContain(String(cheque.unitId));
	});

	it('prints the split, and the two parts add back to the amount', () => {
		const facts = receiptFacts(cheque);
		const { container } = render(PayReceipt, { receipt: facts });
		const text = container.textContent ?? '';
		expect(text).toContain('Operating');
		expect(text).toContain('Contingency reserve');
		expect(text).toContain(money(facts.split.operatingCents));
		expect(text).toContain(money(facts.split.reserveCents));
		expect(facts.split.operatingCents + facts.split.reserveCents).toBe(facts.cents);
	});

	it('prints the transaction and the rate a crypto payment locked at', () => {
		const facts = receiptFacts(lightning);
		const { container } = render(PayReceipt, { receipt: facts });
		const text = container.textContent ?? '';
		expect(text).toContain('Transaction');
		expect(text).toContain(lightning.txid!);
		expect(text).toContain('Rate locked');
		expect(text).toContain(money(facts.rateCents!));
		expect(text).toContain(satsLabel(facts.sats!));
		expect(text).toContain(`${facts.btc} BTC`);
	});

	it('says the rate was not recorded rather than printing one', () => {
		const facts = receiptFacts({
			date: '2026-08-01',
			unitId: '305',
			owner: 'Priya Raman',
			method: 'Bitcoin',
			cents: 57_600,
			reference: 'LMS2847-305-202608',
			note: 'Settled.'
		});
		const { container } = render(PayReceipt, { receipt: facts });
		const text = container.textContent ?? '';
		expect(text).toContain('No rate was recorded');
		expect(text).not.toContain('Rate locked');
		expect(container.textContent).not.toContain('BTC');
	});

	it('prints a fiat receipt without a transaction line', () => {
		const { container } = render(PayReceipt, { receipt: receiptFacts(cheque) });
		expect(container.textContent ?? '').not.toContain('Transaction');
	});

	it('prints in the reader’s language', async () => {
		locale.set('fr');
		const { container } = render(PayReceipt, { receipt: receiptFacts(cheque) });
		await waitFor(() => expect(container.textContent).toContain('Reçu de paiement'));
		const text = container.textContent ?? '';
		expect(text).toContain('Payé par');
		expect(text).toContain('Lot');
	});
});
