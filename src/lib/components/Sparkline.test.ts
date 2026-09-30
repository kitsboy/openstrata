import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import Sparkline from './Sparkline.svelte';

describe('Sparkline', () => {
	it('renders a polyline path for trending values', () => {
		const { container } = render(Sparkline, { values: [10, 20, 15, 30] });
		const path = container.querySelector('path');
		expect(path).not.toBeNull();
		expect(path?.getAttribute('d')).toContain('M');
		expect(path?.getAttribute('d')).toContain('L');
	});

	it('shows an upward delta when the series rises', () => {
		const { container } = render(Sparkline, { values: [10, 12] });
		const delta = container.querySelector('.spark-delta');
		expect(delta?.textContent).toContain('↗');
	});

	it('renders nothing but a shell for fewer than two points', () => {
		const { container } = render(Sparkline, { values: [5] });
		expect(container.querySelector('path')?.getAttribute('d')).toBe('');
		expect(container.querySelector('.spark-delta')).toBeNull();
	});
});
