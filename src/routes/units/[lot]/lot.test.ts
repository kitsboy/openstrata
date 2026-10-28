import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/svelte';

import LotSheet from './+page.svelte';

/**
 * Where "Open the forms card" lands.
 *
 * The health trend links a Form K gap to `/units/309#forms`, so the anchor has
 * to exist and the card has to carry the dates the gap was counted from: when
 * the tenant moved in, the day the two-week window closed, and how long the lot
 * has been past it. Without them the gap is an accusation with no working.
 */
describe('/units/[lot]#forms', () => {
	it('anchors the forms card on the lot the trend links to', () => {
		const { container } = render(LotSheet, { data: { lot: '309' } });
		expect(container.querySelector('#forms')).not.toBeNull();
	});

	it('shows the closed window behind a missing Form K', () => {
		const { container } = render(LotSheet, { data: { lot: '309' } });
		const text = container.textContent ?? '';
		expect(text).toContain('Tenant from 2026-07-01');
		expect(text).toContain('14-day window closed 2026-07-15');
		expect(text).toContain('77 days past the 14-day window');
	});

	it('counts the shorter gap on a tenancy that began in September', () => {
		const { container } = render(LotSheet, { data: { lot: '209' } });
		const text = container.textContent ?? '';
		expect(text).toContain('14-day window closed 2026-09-15');
		expect(text).toContain('15 days past the 14-day window');
	});

	it('leaves a lot with its Form K on file without a window claim', () => {
		const { container } = render(LotSheet, { data: { lot: '105' } });
		const text = container.textContent ?? '';
		expect(text).not.toContain('window closed');
	});
});
