import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import HealthTrend from './HealthTrend.svelte';
import { healthTrend } from '$lib/demo/health';
import { trend } from '$lib/health';

describe('HealthTrend', () => {
	it('charts the six months the panel claims, oldest first', () => {
		const { container } = render(HealthTrend);
		const bars = container.querySelectorAll('.trend-bars li');
		expect(bars).toHaveLength(6);
		expect([...bars].map((bar) => bar.querySelector('.bar-score')?.textContent)).toEqual([
			'82',
			'82',
			'82',
			'74',
			'72',
			'56'
		]);
	});

	it('prints the score the gauge shows, and what it lost across the window', () => {
		const { container } = render(HealthTrend);
		expect(container.querySelector('.trend-score')?.textContent).toContain('56');
		expect(container.querySelector('.trend-moved')?.textContent).toContain('↘');
		expect(container.querySelector('.trend-moved')?.textContent).toContain('26');
		expect(container.querySelector('.trend-moved')?.textContent).toContain('April');
	});

	it('shows each input from the first month to now, and the month it moved', () => {
		const { container } = render(HealthTrend);
		const rows = [...container.querySelectorAll('.trend-inputs li')];
		expect(rows).toHaveLength(3);

		const pick = (index: number) => ({
			name: rows[index].querySelector('.input-name')?.textContent,
			now: rows[index].querySelector('.input-now')?.textContent?.replace(/\s+/g, ''),
			move: rows[index].querySelector('.input-move')?.textContent
		});

		// The calendar never moved: council marks the EPR soon and it costs 4 all six months.
		expect(pick(0).name).toBe('Deadlines');
		expect(pick(0).now).toBe('4→4');
		expect(pick(0).move).toContain('held all six months');

		// Arrears walked from $3,552 to the cap as the levy and fees aged.
		expect(pick(1).name).toBe('AR past due');
		expect(pick(1).now).toBe('14→25');
		expect(pick(1).move).toContain('July');
		expect(pick(1).move).toContain('August');
		expect(pick(1).move).toContain('September');

		// Two Form K windows closed in September, the third in July.
		expect(pick(2).name).toBe('Form K gaps');
		expect(pick(2).now).toBe('0→15');
		expect(pick(2).move).toContain('July');
		expect(pick(2).move).toContain('September');
	});

	it('says an input held when nothing moved it', () => {
		const rows = trend([
			{ period: '2026-01', asOf: '2026-01-31', inputs: { tracked: [], arPastDueCents: 0, formKGaps: 0 } },
			{ period: '2026-02', asOf: '2026-02-28', inputs: { tracked: [], arPastDueCents: 0, formKGaps: 0 } }
		]);
		const { container } = render(HealthTrend, { rows });
		const moves = [...container.querySelectorAll('.input-move')].map((el) => el.textContent);
		expect(moves.every((text) => text?.includes('held all six months'))).toBe(true);
		expect(container.querySelector('.trend-score')?.textContent).toContain('100');
	});

	it('opens a month to its charges and its Form K register', async () => {
		const { container } = render(HealthTrend);
		expect(container.querySelector('.trend-detail')).toBeNull();

		await fireEvent.click(container.querySelectorAll('.bar-button')[5]);

		const detail = container.querySelector('.trend-detail');
		expect(detail).not.toBeNull();
		expect(detail?.textContent).toContain('September');
		// The three lots whose two-week window had closed, and the levy that has been
		// late since November 2025.
		for (const lot of ['207', '209', '407']) {
			expect(detail?.textContent).toContain(`Lot ${lot}`);
		}
		// A Form K gap lands on the lot's forms card, where the tenancy date and the
		// closed window are printed.
		expect(detail?.querySelectorAll('.detail-list a[href="/units/209#forms"]').length).toBeGreaterThan(0);
		expect(container.querySelectorAll('.bar-button')[5].getAttribute('aria-pressed')).toBe('true');
	});

	it('carries the open month into the accounting ladder', async () => {
		const { container } = render(HealthTrend);
		expect(container.querySelector('.detail-books')).toBeNull();
		await fireEvent.click(container.querySelectorAll('.bar-button')[5]);
		const link = container.querySelector('.detail-books');
		// The date has to travel: the books age at this month's end, not at today's.
		expect(link?.getAttribute('href')).toBe('/accounting?period=2026-09');
		await fireEvent.click(container.querySelectorAll('.bar-button')[0]);
		expect(container.querySelector('.detail-books')?.getAttribute('href')).toBe(
			'/accounting?period=2026-04'
		);
	});

	it('says a quiet month was quiet instead of leaving it blank', async () => {
		const { container } = render(HealthTrend);
		await fireEvent.click(container.querySelectorAll('.bar-button')[0]);
		const detail = container.querySelector('.trend-detail');
		expect(detail?.textContent).toContain('April');
		expect(detail?.textContent).toContain('No Form K window had closed by this month end.');
		expect(detail?.textContent).not.toContain('Lot 209');
	});

	it('cuts the open month to the charges dated inside it', async () => {
		const { container } = render(HealthTrend);
		await fireEvent.click(container.querySelectorAll('.bar-button')[5]);
		const detail = container.querySelector('.trend-detail') as HTMLElement;
		const rows = () => detail.querySelectorAll('.detail-list')[0].querySelectorAll('li');
		const [all, month] = [...detail.querySelectorAll('.cut-button')] as HTMLButtonElement[];

		// The list opens on every charge past due, which is the score's own total.
		expect(rows()).toHaveLength(10);
	expect(detail.querySelector('.detail-total')?.textContent).toContain('$6,499.00');
		expect(all.getAttribute('aria-pressed')).toBe('true');

		// September's own five, and their own smaller total.
		await fireEvent.click(month);
		expect(rows()).toHaveLength(5);
		expect(detail.querySelector('.detail-total')?.textContent).toContain('$1,515.00');
		expect(month.getAttribute('aria-pressed')).toBe('true');
		expect(all.getAttribute('aria-pressed')).toBe('false');

		await fireEvent.click(all);
		expect(rows()).toHaveLength(10);
	});

	it('says when a month\u2019s own cut is empty', async () => {
		const { container } = render(HealthTrend);
		await fireEvent.click(container.querySelectorAll('.bar-button')[0]);
		const detail = container.querySelector('.trend-detail') as HTMLElement;
		await fireEvent.click([...detail.querySelectorAll('.cut-button')][1] as HTMLButtonElement);
		// April's whole balance was the levy, owing since November 2025.
		expect(detail.textContent).toContain('No charge above is dated in April');
		expect(detail.querySelector('.detail-total')?.textContent).toContain('—');
	});

	it('closes the month when the same point is clicked again', async () => {
		const { container } = render(HealthTrend);
		await fireEvent.click(container.querySelectorAll('.bar-button')[5]);
		await fireEvent.click(container.querySelectorAll('.bar-button')[5]);
		expect(container.querySelector('.trend-detail')).toBeNull();
	});

	it('closes it with the close button too', async () => {
		const { container } = render(HealthTrend);
		await fireEvent.click(container.querySelectorAll('.bar-button')[2]);
		await fireEvent.click(container.querySelector('.detail-close') as HTMLButtonElement);
		expect(container.querySelector('.trend-detail')).toBeNull();
	});

	it('names the inputs it is showing, so the number is auditable', () => {
		render(HealthTrend);
		// The panel's own note says the points are rebuilt, not stored.
		expect(screen.getByText(/no number here is stored/i)).toBeInTheDocument();
		expect(screen.getByRole('region')).toHaveAttribute('id', 'health-trend');
		expect(screen.getByRole('heading', { name: /six months of the score/i })).toBeInTheDocument();
		// And the six points are the shared model's, not a second formula.
		expect(healthTrend().map((row) => row.score)).toEqual([82, 82, 82, 74, 72, 56]);
	});
});
