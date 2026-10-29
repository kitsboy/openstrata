import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/svelte';
import { locale } from '$lib/i18n';
import { money } from '$lib/demo/format';
import { receipts } from '$lib/demo/payments';
import { newestReceipt } from '$lib/pay-receipt';

/**
 * The pay page prints one thing: the receipt for the payment a reader picked.
 *
 * The paying sheet, the tape and the vendor panel are the screen half and carry
 * `no-print`; the receipt at the foot of the page is the printed artifact. This
 * pins that split, and pins the row button to the sheet it fills.
 */
vi.mock('$app/stores', async () => {
	const { readable } = await import('svelte/store');
	return {
		page: readable({
			url: new URL('https://openstrata.test/pay'),
			params: {},
			route: { id: '/pay' }
		})
	};
});
vi.mock('$app/navigation', () => ({ goto: vi.fn() }));

window.matchMedia ??= ((query: string) => ({
	matches: false,
	media: query,
	onchange: null,
	addEventListener: () => {},
	removeEventListener: () => {},
	addListener: () => {},
	removeListener: () => {},
	dispatchEvent: () => false
})) as typeof window.matchMedia;

const { default: Pay } = await import('./+page.svelte');

describe('/pay (the pay sheet and its receipt)', () => {
	beforeEach(() => locale.set('en'));

	it('prints the newest payment as a receipt, outside the screen half', () => {
		const { container } = render(Pay);
		const sheet = container.querySelector('.print-doc');
		const newest = newestReceipt(receipts)!;
		expect(sheet).toBeTruthy();
		expect(sheet?.closest('.no-print')).toBeNull();
		expect(sheet?.textContent ?? '').toContain('Receipt for payment received');
		expect(sheet?.textContent ?? '').toContain(newest.reference);
		expect(sheet?.textContent ?? '').toContain(money(newest.cents));
		// The paying sheet and the tape are the screen half.
		const controls = [...container.querySelectorAll('.no-print')].map(
			(node) => node.textContent ?? ''
		);
		expect(controls.some((text) => text.includes('Amount due'))).toBe(true);
		expect(controls.some((text) => text.includes(receipts[0].reference))).toBe(true);
	});

	it('puts the row a reader picks on the sheet', async () => {
		const { container, getByLabelText } = render(Pay);
		const cheque = receipts.find((row) => row.method === 'Cheque')!;
		await fireEvent.click(getByLabelText(`Receipt: ${cheque.reference}`));
		const sheet = container.querySelector('.print-doc');
		expect(sheet?.textContent ?? '').toContain(cheque.reference);
		expect(sheet?.textContent ?? '').toContain(cheque.owner);
		expect(sheet?.textContent ?? '').toContain('Cheque');
		// The rail that pays nothing on this sheet is the one it says.
		expect(sheet?.textContent ?? '').not.toContain('Transaction');
	});

	it('keeps the print control on screen, beside the sheet', () => {
		const { container } = render(Pay);
		const controls = [...container.querySelectorAll('.no-print')].map(
			(node) => node.textContent ?? ''
		);
		expect(controls.some((text) => text.includes('Print this receipt'))).toBe(true);
	});
});
