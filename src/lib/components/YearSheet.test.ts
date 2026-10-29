import { beforeEach, describe, expect, it } from 'vitest';
import { render } from '@testing-library/svelte';
import YearSheet from './YearSheet.svelte';
import { buildYearSheet } from '$lib/year-sheet';
import { yearBook } from '$lib/demo/year';
import { locale } from '$lib/i18n';

const sheet = buildYearSheet({
	...yearBook,
	health: {
		from: { label: 'April 2026', score: 82 },
		to: { label: 'September 2026', score: 56 }
	}
});

describe('the year on one page', () => {
	beforeEach(() => locale.set('en'));

	it('prints income and spend by category, each with its own total', () => {
		const { container } = render(YearSheet, { sheet });
		const text = container.textContent ?? '';
		expect(text).toContain('Income by category');
		expect(text).toContain('Spend by category');
		expect(text).toContain('Strata fees (operating share)');
		expect(text).toContain('Insurance');
		// Both tables end on a total row, and the sheet states the surplus.
		expect(container.querySelectorAll('tr.total').length).toBeGreaterThanOrEqual(4);
		expect(text).toContain('Operating surplus');
	});

	it('prints the three fund balances at the close and their total', () => {
		const { container } = render(YearSheet, { sheet });
		const text = container.textContent ?? '';
		expect(text).toContain('Operating');
		expect(text).toContain('Contingency reserve');
		expect(text).toContain('Parkade levy');
		// The same three figures the funds tab reports at September 30.
		expect(text).toContain('$81,797.62');
		expect(text).toContain('$603,688.80');
		expect(text).toContain('$31,548.00');
		expect(text).toContain('$717,034.42');
	});

	it('prints where the score started and ended, and by how much it moved', () => {
		const { container } = render(YearSheet, { sheet });
		const text = container.textContent ?? '';
		expect(text).toContain('April 2026: 82 of 100 → September 2026: 56 of 100.');
		expect(text).toContain('Down 26 points since April 2026.');
	});

	it('prints every tracked item with its date and day count', () => {
		const { container } = render(YearSheet, { sheet });
		const text = container.textContent ?? '';
		expect(text).toContain('Annual General Meeting');
		expect(text).toContain('Oct 31, 2026');
		expect(text).toContain('31 days');
		expect(text).toContain('3 tracked items, 0 of them overdue.');
	});

	it('prints in the reader’s language, money included', () => {
		locale.set('fr');
		const { container } = render(YearSheet, { sheet });
		const text = container.textContent ?? '';
		expect(text).toContain('Revenus par catégorie');
		expect(text).toContain('Dépenses par catégorie');
		expect(text).toContain('Exercice');
	});
});
