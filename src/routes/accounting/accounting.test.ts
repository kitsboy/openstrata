import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/svelte';

/**
 * The books, opened at a month carried in from the health trend.
 *
 * `?period=2026-09` has to do three things at once: open the receivables tab,
 * age every charge to that month end rather than today, and say so. The figures
 * asserted here are the September point's — $6,499 past due, 322 days on the
 * oldest charge — so this test is the one that would fail if the link the panel
 * writes and the month this page reads ever drifted apart.
 *
 * The date is a page-level fact now, so it is checked on the tabs that can follow
 * it (the ladder and the journal) and on one that cannot: the fund balances have
 * no month-by-month ledger behind them, and the page says so rather than printing
 * September's cash under an April heading.
 */
const site = vi.hoisted(() => ({ url: 'https://openstrata.test/accounting' }));

vi.mock('$app/stores', async () => {
	const { readable } = await import('svelte/store');
	return {
		page: readable({
			get url() {
				return new URL(site.url);
			}
		})
	};
});
vi.mock('$app/navigation', () => ({ goto: vi.fn() }));

const { default: Accounting } = await import('./+page.svelte');

function renderAt(path: string) {
	site.url = `https://openstrata.test${path}`;
	return render(Accounting);
}

async function openTab(container: HTMLElement, label: string) {
	const button = [...container.querySelectorAll('button')].find(
		(candidate) => candidate.textContent?.trim() === label
	);
	expect(button, `no ${label} tab`).toBeTruthy();
	await fireEvent.click(button as HTMLElement);
}

describe('/accounting?period=', () => {
	it('opens the receivables ladder aged at the linked month end', () => {
		const { container } = renderAt('/accounting?period=2026-09');
		const text = container.textContent ?? '';
		expect(text).toContain('Opened at September 30, 2026');
		expect(text).toContain('Back to today’s books');
		// The September book: the same $6,499 the trend point called 25 points of
		// arrears, and the levy's 322 days since November 2025.
		expect(text).toContain('$6,499.00');
		expect(text).toContain('322 days');
	});

	it('shows the receivables tab, not the overview', () => {
		const { container } = renderAt('/accounting?period=2026-09');
		const active = container.querySelector('button[class*="bg-slab"]');
		expect(active?.textContent).toBe('Who owes');
	});

	it('walks the ladder back to an earlier month end', () => {
		const { container } = renderAt('/accounting?period=2026-04');
		const text = container.textContent ?? '';
		expect(text).toContain('Opened at April 30, 2026');
		// April's whole balance is the parkade levy, due November 12, 2025: 169 days.
		expect(text).toContain('$3,552.00');
		expect(text).toContain('169 days');
		expect(text).not.toContain('$6,499.00');
	});

	it('stops the journal at the linked month end', async () => {
		const { container } = renderAt('/accounting?period=2026-09');
		await openTab(container, 'September journal');
		const text = container.textContent ?? '';
		expect(text).toContain('operating and reserve cash at September 30, 2026');
		expect(text).not.toContain('No entry was posted');
	});

	it('says when the journal had nothing posted by that day', async () => {
		const { container } = renderAt('/accounting?period=2026-04');
		await openTab(container, 'September journal');
		const text = container.textContent ?? '';
		expect(text).toContain('No entry was posted by April 30, 2026');
		expect(text).toContain('begins on September 1, 2026');
		// Nothing was posted, so no entry rows are drawn.
		expect(container.querySelectorAll('tbody').length).toBe(0);
	});

	it('keeps the fund balances at the close, and says which figures cannot move', async () => {
		const { container } = renderAt('/accounting?period=2026-04');
		await openTab(container, 'Overview');
		const text = container.textContent ?? '';
		expect(text).toContain('The fund balances, the budget and the payables stay at the September 30, 2026 close');
		// The banner is page-level: it is still on screen on another tab.
		expect(text).toContain('Opened at April 30, 2026');
	});

	it('leaves the page alone when no month is passed', () => {
		const { container } = renderAt('/accounting');
		const text = container.textContent ?? '';
		expect(text).not.toContain('Opened at');
		expect(text).not.toContain('stay at the');
		expect(container.querySelector('button[class*="bg-slab"]')?.textContent).toBe('Overview');
	});
});
