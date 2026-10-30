import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/svelte';

/**
 * The AGM package: one button, one stack.
 *
 * A council used to print the year's sheet on `/`, the meeting packet on
 * `/meetings` and the reserve plan on `/accounting`, and hope the three came out
 * in an order it could hand over. This page prints them as one document, so the
 * test that matters is that the stack holds the three sheets, in the order the
 * contents page promises, and that the contents page is its own page.
 */
const site = vi.hoisted(() => ({ url: 'https://openstrata.test/documents' }));

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

const { default: Documents } = await import('./+page.svelte');

function renderAt(path: string) {
	site.url = `https://openstrata.test${path}`;
	return render(Documents);
}

/** Two frames is what the page waits for before opening the print dialog. */
const flush = () => new Promise((resolve) => setTimeout(resolve, 60));

function button(container: HTMLElement, label: string) {
	const found = [...container.querySelectorAll('button')].find(
		(candidate) => candidate.textContent?.trim() === label
	);
	expect(found, `no “${label}” button`).toBeTruthy();
	return found as HTMLElement;
}

describe('/documents — the AGM package', () => {
	it('stops passing window.print, so a click in a test does not open a dialog', () => {
		// jsdom has no print dialog; the page calls through it, so it has to exist.
		window.print = vi.fn();
		expect(typeof window.print).toBe('function');
	});

	it('shows a single document until the package is asked for', () => {
		const { container } = renderAt('/documents');
		expect(container.querySelector('.year-doc')).toBeNull();
		expect(container.querySelector('.package-doc')).toBeNull();
	});

	it('prints the four sheets as one stack, each on its own page', async () => {
		window.print = vi.fn();
		const { container } = renderAt('/documents');
		await fireEvent.click(button(container, 'Print the AGM package'));
		await flush();

		const pages = [...container.querySelectorAll('.print-page')];
		// Contents, the year, the packet, the reserve plan, the Form K register.
		expect(pages).toHaveLength(5);
		expect(container.querySelectorAll('.package-doc')).toHaveLength(1);
		expect(container.querySelectorAll('.year-doc')).toHaveLength(1);
		expect(container.querySelectorAll('.packet-doc')).toHaveLength(1);
		expect(container.querySelectorAll('.reserve-doc')).toHaveLength(1);
		expect(container.querySelectorAll('.register-doc')).toHaveLength(1);

		// The order the contents page promises is the order the pages break in.
		const order = pages.map((page) =>
			page.querySelector('.package-doc')
				? 'contents'
				: page.querySelector('.year-doc')
					? 'year'
					: page.querySelector('.packet-doc')
						? 'packet'
						: page.querySelector('.reserve-doc')
							? 'reserve'
							: 'register'
		);
		expect(order).toEqual(['contents', 'year', 'packet', 'reserve', 'register']);
		expect(window.print).toHaveBeenCalledTimes(1);
	});

	it('carries the register the health score charges for, on its own page', async () => {
		window.print = vi.fn();
		const { container } = renderAt('/documents?package=1');
		await flush();
		const register = container.querySelector('.register-doc')?.textContent ?? '';
		// The same tenanted lots /units/register lists, from the same call.
		expect(register).toContain('Form K register');
		expect(register).toContain('Lot');
		expect(register).toContain('Days past');
	});

	it('names what is in the stack, with the page’s own subtitles', async () => {
		window.print = vi.fn();
		const { container } = renderAt('/documents?package=1');
		await flush();
		const contents = container.querySelector('.package-doc')?.textContent ?? '';
		expect(contents).toContain('In this package');
		expect(contents).toContain('The year on one page');
		expect(contents).toContain('Council meeting packet');
		expect(contents).toContain('The reserve fund, five years out');
		expect(contents).toContain('Form K register');
		// Four sheets named, and the hint says four rather than three.
		expect(contents).toContain('One button, four sheets');
		// Prepared for the paper: the close the books were written at.
		expect(contents).toContain('Prepared September 30, 2026');
	});

	it('keeps the picker, the hint and the package button off the paper', () => {
		const { container } = renderAt('/documents');
		const controls = [...container.querySelectorAll('.no-print')].map(
			(node) => node.textContent ?? ''
		);
		expect(controls.some((text) => text.includes('Print the AGM package'))).toBe(true);
		expect(controls.some((text) => text.includes('Choose a document'))).toBe(true);
	});
});
