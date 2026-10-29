import { beforeEach, describe, expect, it } from 'vitest';
import { render } from '@testing-library/svelte';
import ArrearsSheet from './ArrearsSheet.svelte';
import { arrearsSheet, type SheetLot } from '$lib/arrears-sheet';
import { locale } from '$lib/i18n';

const lot = (overrides: Partial<SheetLot> & Pick<SheetLot, 'unitId'>): SheetLot => ({
	owner: 'A. Owner',
	buckets: { current: 0, age30: 0, age60: 0, age90: 0, over90: 0 },
	total: 0,
	pastDue: 0,
	planned: 0,
	oldest: null,
	oldestDays: 0,
	withheld: false,
	...overrides
});

const sheet = arrearsSheet({
	lots: [
		lot({
			unitId: '207',
			owner: 'M. Duarte',
			buckets: { current: 66_600, age30: 0, age60: 0, age90: 0, over90: 570_000 },
			total: 636_600,
			pastDue: 570_000,
			oldest: '2025-11-12',
			oldestDays: 322,
			withheld: true
		}),
		lot({
			unitId: '104',
			owner: 'S. Ahmadi',
			buckets: { current: 54_900, age30: 59_900, age60: 0, age90: 0, over90: 0 },
			total: 114_800,
			pastDue: 59_900,
			oldest: '2026-09-01',
			oldestDays: 29
		}),
		lot({ unitId: '101', total: 44_100, buckets: { current: 44_100, age30: 0, age60: 0, age90: 0, over90: 0 } }),
		lot({ unitId: '403', planned: 270_000 })
	],
	asOf: '2026-09-30',
	totalLots: 40
});

describe('the receivables sheet', () => {
	beforeEach(() => locale.set('en'));

	it('puts each late lot’s money in the column it belongs in', () => {
		const { container } = render(ArrearsSheet, { sheet });
		const rows = [...container.querySelectorAll('tbody tr')];
		expect(rows).toHaveLength(3);
		const row207 = rows[0].textContent ?? '';
		expect(row207).toContain('207');
		expect(row207).toContain('M. Duarte');
		expect(row207).toContain('$666.00');
		expect(row207).toContain('$5,700.00');
		expect(row207).toContain('$6,366.00');
		expect(row207).toContain('Withheld');
		// A column with nothing in it prints a dash, never a silent gap.
		expect(row207).toContain('—');
	});

	it('adds the columns up and accounts for the rest of the book', () => {
		const { container } = render(ArrearsSheet, { sheet });
		const text = container.textContent ?? '';
		const footer = container.querySelector('.arrears-total')?.textContent ?? '';
		expect(footer).toContain('$7,514.00');
		expect(text).toContain('The 2 lots above owe $6,299.00 past due');
		expect(text).toContain('$441.00 not yet due');
		expect(text).toContain('$7,955.00 stands on the books');
		// The plan balance is named under the table, not aged into a column.
		expect(text).toContain('403 · A. Owner');
		expect(text).toContain('$2,700.00 standing on a payment plan');
		expect(text).toContain('36 of 40 lots have nothing on the books at all.');
	});

	it('prints in the reader’s language', () => {
		locale.set('fr');
		const { container } = render(ArrearsSheet, { sheet });
		const text = container.textContent ?? '';
		expect(text).toContain('L’échelle des comptes clients');
		expect(text).toContain('Formulaire F');
		expect(text).toContain('Retenu');
	});
});
