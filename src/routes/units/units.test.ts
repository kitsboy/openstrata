import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/svelte';
import { UNIT_FILTERS_KEY } from '$lib/unit-filters';

/**
 * The filter is a place in the building, not a keystroke.
 *
 * A reader narrows the list to the lots in arrears, opens lot 207's sheet and
 * comes back. Before this, the list had forgotten what they were looking at and
 * the plan redrew all forty lots. These tests are the trip there and back: the
 * filter is kept on the device, restored on return, and cleared by one button
 * that also forgets it. A `?tone=` link from an activity still wins, because a
 * link that names the arrears means the arrears, not the last thing read.
 */
const site = vi.hoisted(() => ({ url: 'https://openstrata.test/units' }));

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

const { default: Units } = await import('./+page.svelte');

function renderAt(path = '/units') {
	site.url = `https://openstrata.test${path}`;
	return render(Units);
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 30));

/** Every lot drawn on the plan, whatever its tone — the plan marks the picked one. */
const lots = (container: HTMLElement) => container.querySelectorAll('button[aria-pressed]');

function searchBox(container: HTMLElement) {
	return container.querySelector('input[aria-label="Search lots"]') as HTMLInputElement;
}

beforeEach(() => {
	localStorage.clear();
});

describe('/units — filters that stay put', () => {
	it('draws the whole building when nothing is kept', () => {
		const { container } = renderAt();
		expect(lots(container)).toHaveLength(40);
		expect(searchBox(container).value).toBe('');
	});

	it('restores a search left on the device', async () => {
		localStorage.setItem(
			UNIT_FILTERS_KEY,
			JSON.stringify({ query: 'Cho', focus: 'all', floor: 'all' })
		);
		const { container } = renderAt();
		await flush();
		expect(searchBox(container).value).toBe('Cho');
		// Two owners carry that name, on two floors; the plan narrows with the list.
		expect(lots(container)).toHaveLength(2);
	});

	it('restores a tone and the floor beside it', async () => {
		localStorage.setItem(
			UNIT_FILTERS_KEY,
			JSON.stringify({ query: '', focus: 'levy', floor: 2 })
		);
		const { container } = renderAt();
		await flush();
		const active = [...container.querySelectorAll('button')].filter((candidate) =>
			candidate.className.includes('bg-brand-600')
		);
		expect(active.map((node) => node.textContent?.trim())).toContain('Levy balance');
		const drawn = lots(container);
		expect(drawn.length).toBeGreaterThan(0);
		expect(drawn.length).toBeLessThan(40);
	});

	it('keeps a filter as it is typed, and forgets it when cleared', async () => {
		const { container } = renderAt();
		await flush();
		await fireEvent.input(searchBox(container), { target: { value: 'Cho' } });
		await flush();
		expect(JSON.parse(localStorage.getItem(UNIT_FILTERS_KEY) ?? '{}')).toEqual({
			query: 'Cho',
			focus: 'all',
			floor: 'all'
		});
		expect(lots(container)).toHaveLength(2);

		const clear = [...container.querySelectorAll('button')].find(
			(candidate) => candidate.textContent?.trim() === 'Clear filters'
		);
		expect(clear, 'no clear-filters button').toBeTruthy();
		await fireEvent.click(clear as HTMLElement);
		await flush();
		expect(searchBox(container).value).toBe('');
		expect(lots(container)).toHaveLength(40);
		// Nothing on the device rather than a record of the defaults.
		expect(localStorage.getItem(UNIT_FILTERS_KEY)).toBeNull();
		// And the button goes away with the last filter.
		expect(
			[...container.querySelectorAll('button')].some(
				(candidate) => candidate.textContent?.trim() === 'Clear filters'
			)
		).toBe(false);
	});

	it('lets a tone link win over what was left on the device', async () => {
		localStorage.setItem(
			UNIT_FILTERS_KEY,
			JSON.stringify({ query: 'Cho', focus: 'all', floor: 4 })
		);
		const { container } = renderAt('/units?tone=arrears');
		await flush();
		// The link names the arrears; the reader's last search is not applied.
		expect(searchBox(container).value).toBe('');
		const active = [...container.querySelectorAll('button')].filter((candidate) =>
			candidate.className.includes('bg-brand-600')
		);
		expect(active.map((node) => node.textContent?.trim())).toContain('Fees behind');
		expect(lots(container).length).toBeLessThan(40);
	});

	it('ignores a stored tone it cannot read rather than hiding every lot', async () => {
		localStorage.setItem(
			UNIT_FILTERS_KEY,
			JSON.stringify({ query: '  ', focus: 'gone', floor: 9 })
		);
		const { container } = renderAt();
		await flush();
		expect(lots(container)).toHaveLength(40);
	});

	it('opens the fee schedule as a page of its own, a button away', async () => {
		const { container } = renderAt();
		await flush();
		expect(container.querySelector('.fee-doc')).toBeNull();
		const open = [...container.querySelectorAll('button')].find(
			(button) => button.textContent?.trim() === 'The fee schedule'
		);
		expect(open).toBeTruthy();
		await fireEvent.click(open as HTMLElement);

		const sheet = container.querySelector('.fee-doc')!;
		expect(sheet).toBeTruthy();
		expect(sheet.closest('.no-print')).toBeNull();
		const text = sheet.textContent ?? '';
		// All forty lots, the budget's rate, and the totals that match it.
		expect(sheet.querySelectorAll('tbody tr')).toHaveLength(40);
		expect(text).toContain('$27,000.00');
		expect(text).toContain('$324,000.00');
		expect(text).toContain('8 of 40 lots carry a tenant');
		// The working page steps aside so the print is the sheet alone.
		expect(container.querySelector('.hidden')).toBeTruthy();
	});
});
