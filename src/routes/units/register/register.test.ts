import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render } from '@testing-library/svelte';

import RegisterPage from './+page.svelte';
import { recordFormK, writeFiledForms } from '$lib/form-k';

/**
 * The printable register on /units/register.
 *
 * The page is the list the health score counts, so the two things worth pinning
 * are the order (longest-open gap first, because that is where the points are)
 * and the fact that a filing recorded on a lot's sheet reaches this page. The
 * arithmetic itself is tested in `form-k-register.test.ts`; this only proves the
 * page reads it.
 */
describe('/units/register', () => {
	beforeEach(() => localStorage.clear());

	it('lists the eight tenanted lots and no others', () => {
		const { container } = render(RegisterPage);
		const rows = container.querySelectorAll('tbody tr');
		expect(rows).toHaveLength(8);
		// 101 is owner-occupied: it has no Form K obligation and no row.
		expect(container.textContent ?? '').not.toContain('101');
	});

	it('puts the longest-open gap first, with the days and the points beside it', () => {
		const { container } = render(RegisterPage);
		const first = container.querySelector('tbody tr');
		expect(first?.textContent).toContain('309');
		expect(first?.textContent).toContain('77');
		expect(first?.textContent).toContain('−5');
	});

	it('states the gaps, the denominator and what the score charges', () => {
		const { container } = render(RegisterPage);
		const text = container.textContent ?? '';
		expect(text).toContain('3 of 8 tenanted lots have no Form K on file.');
		expect(text).toContain('15 points');
	});

	it('lets a filing recorded on the lot’s sheet close the gap here', () => {
		writeFiledForms(recordFormK({}, '309', '2026-09-30'));
		const { container } = render(RegisterPage);
		const text = container.textContent ?? '';
		expect(text).toContain('2 of 8 tenanted lots have no Form K on file.');
		expect(text).toContain('10 points');
		// And the lot now sits below the open gaps, with the filing's own date.
		const first = container.querySelector('tbody tr');
		expect(first?.textContent).toContain('209');
		expect(text).toContain('Sep 30, 2026');
	});

	it('keeps the print controls off the paper', () => {
		const { container } = render(RegisterPage);
		expect(container.querySelector('.no-print')?.textContent).toContain('Print the register');
	});
});

/**
 * The mail run behind the register.
 *
 * Three gaps, two letters: lot 309 is on the register because a start date
 * exists, but a short-term stay has no tenancy to acknowledge, so the council's
 * own bylaw file is its record. The letters carry no amount, which is the one
 * thing a reminder like this usually gets wrong.
 */
describe('/units/register — the reminder letters', () => {
	beforeEach(() => localStorage.clear());

	async function open(container: HTMLElement, label: string) {
		const button = [...container.querySelectorAll('button')].find(
			(node) => node.textContent?.trim() === label
		);
		expect(button).toBeTruthy();
		await fireEvent.click(button as HTMLElement);
	}

	it('prints two letters for the three gaps and says which lot was held out', async () => {
		const { container } = render(RegisterPage);
		await open(container, 'Reminder letters');

		const letters = [...container.querySelectorAll('.fk-letter-doc')];
		expect(letters).toHaveLength(2);
		expect(container.querySelector('tbody')).toBeNull();
		const text = container.textContent ?? '';
		expect(text).toContain('2 letters print for the 3 gaps');
		expect(text).toContain('Held out: lot 309');
		expect(text).toContain('OS-FK-2026-09-209');
		expect(text).toContain('Mara Singh');
		expect(text).toContain('September 1, 2026');
		expect(text).toContain('September 15, 2026');
		expect(text).toContain('October 20, 2026');
		expect(text).toContain('This letter imposes no fine');
		expect(text).toContain('$200 a day');
	});

	it('closes a letter when the form is recorded on this device', async () => {
		writeFiledForms(recordFormK({}, '209', '2026-09-30'));
		const { container } = render(RegisterPage);
		await open(container, 'Reminder letters');

		expect(container.querySelectorAll('.fk-letter-doc')).toHaveLength(1);
		expect(container.textContent ?? '').toContain('OS-FK-2026-09-407');
		expect(container.textContent ?? '').not.toContain('OS-FK-2026-09-209');
	});

	it('goes back to the register', async () => {
		const { container } = render(RegisterPage);
		await open(container, 'Reminder letters');
		await open(container, 'Back to the register');
		expect(container.querySelector('.fk-letter-doc')).toBeNull();
		expect(container.querySelectorAll('tbody tr')).toHaveLength(8);
	});
});
