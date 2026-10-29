import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/svelte';
import { locale } from '$lib/i18n';

/**
 * The dashboard prints one artifact.
 *
 * The dashboard itself stays on screen — the greeting, the task list, the
 * metrics, the buildings, the proof band all carry `no-print`. The year sheet at
 * the foot of the page is the printed artifact, and this test pins that: the
 * sheet is outside the no-print half, and the print control is inside it.
 */
vi.mock('$app/stores', async () => {
	const { readable } = await import('svelte/store');
	return {
		page: readable({
			url: new URL('https://openstrata.test/'),
			params: {},
			route: { id: '/' }
		})
	};
});
vi.mock('$app/navigation', () => ({ goto: vi.fn() }));

// jsdom does not ship matchMedia, and the theme store reads it at import time.
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

const { default: Home } = await import('./+page.svelte');

describe('/ (the dashboard)', () => {
	beforeEach(() => locale.set('en'));

	it('prints the year on one page, not the dashboard around it', () => {
		const { container } = render(Home);
		const sheet = container.querySelector('.print-doc');
		expect(sheet).toBeTruthy();
		expect(sheet?.closest('.no-print')).toBeNull();
		expect(sheet?.textContent ?? '').toContain('Income by category');
		expect(sheet?.textContent ?? '').toContain('Contingency reserve');

		const controls = [...container.querySelectorAll('.no-print')].map(
			(node) => node.textContent ?? ''
		);
		expect(controls.some((text) => text.includes('Print this page'))).toBe(true);
		// The dashboard's own furniture is in the same no-print half.
		expect(controls.some((text) => text.includes('Quick actions') || text.includes('Your buildings'))).toBe(
			true
		);
	});
});
