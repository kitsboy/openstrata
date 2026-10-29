import { beforeEach, describe, expect, it } from 'vitest';
import { render } from '@testing-library/svelte';

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
