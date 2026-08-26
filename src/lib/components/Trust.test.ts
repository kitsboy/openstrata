import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import Tour from './Tour.svelte';
import ConfirmDialog from './ConfirmDialog.svelte';

describe('Tour', () => {
	it('renders the first step and advances through all four', async () => {
		const { container, getByText } = render(Tour, { onFinish: vi.fn() });
		expect(getByText('Welcome to OpenStrata')).toBeTruthy();
		const next = container.querySelector('.tour-next');
		for (let i = 0; i < 3; i++) await fireEvent.click(next!);
		expect(getByText('Watch the ledger')).toBeTruthy();
	});

	it('calls onFinish when dismissed', async () => {
		const onFinish = vi.fn();
		const { container } = render(Tour, { onFinish });
		await fireEvent.click(container.querySelector('.tour-close')!);
		expect(onFinish).toHaveBeenCalled();
	});
});

describe('ConfirmDialog', () => {
	it('cancel closes without confirming', async () => {
		const onConfirm = vi.fn();
		const { container } = render(ConfirmDialog, {
			title: 'Remove this unit?',
			message: 'The unit will be removed.',
			onConfirm
		});
		await fireEvent.click(container.querySelector('.confirm-cancel')!);
		expect(onConfirm).not.toHaveBeenCalled();
		// Dialog unmounts after cancel — nothing left to click.
		expect(container.querySelector('.confirm-modal')).toBeNull();
	});

	it('danger button confirms', async () => {
		const onConfirm = vi.fn();
		const { container } = render(ConfirmDialog, {
			title: 'Remove this unit?',
			message: 'The unit will be removed.',
			onConfirm
		});
		await fireEvent.click(container.querySelector('.confirm-danger')!);
		expect(onConfirm).toHaveBeenCalledTimes(1);
	});
});
