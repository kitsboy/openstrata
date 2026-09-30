import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import LiveSync from './LiveSync.svelte';

describe('LiveSync', () => {
	it('renders nothing in demo mode', () => {
		const { container } = render(LiveSync, { live: false });
		expect(container.querySelector('.live-sync')).toBeNull();
	});

	it('shows the last-synced time when live', () => {
		const syncedAt = new Date('2026-08-26T14:30:00');
		const expected = new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(syncedAt);
		const { container } = render(LiveSync, { live: true, syncedAt });
		const label = container.querySelector('.live-sync-label');
		expect(label?.textContent).toContain('Last synced');
		expect(label?.textContent).toContain(expected);
	});

	it('fires onRefresh from the refresh button', async () => {
		const onRefresh = vi.fn();
		const { container } = render(LiveSync, { live: true, onRefresh });
		await fireEvent.click(container.querySelector('.live-sync-refresh')!);
		expect(onRefresh).toHaveBeenCalledTimes(1);
	});

	it('omits the refresh button when no handler is provided', () => {
		const { container } = render(LiveSync, { live: true });
		expect(container.querySelector('.live-sync-refresh')).toBeNull();
	});
});
