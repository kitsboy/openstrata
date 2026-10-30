import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render } from '@testing-library/svelte';

import LotSheet from './+page.svelte';

/**
 * Where "Open the forms card" lands, and what a council can do there.
 *
 * The health trend links a Form K gap to `/units/309#forms`, so the anchor has
 * to exist and the card has to carry the dates the gap was counted from: when
 * the tenant moved in, the day the two-week window closed, and how long the lot
 * has been past it. Without them the gap is an accusation with no working. The
 * card is also where the form is recorded, because the gap the trend counts is
 * the paperwork, and the council is who has it.
 */
describe('/units/[lot]#forms', () => {
	beforeEach(() => localStorage.clear());

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

	it('records the form on the day it arrived, and says where it went', async () => {
		const { container, getByLabelText } = render(LotSheet, { data: { lot: '309' } });
		// The date the gap is counted to, so filing today changes today's score.
		expect((getByLabelText('Date on the Form K') as HTMLInputElement).value).toBe('2026-09-30');
		await fireEvent.submit(container.querySelector('form')!);
		const text = container.textContent ?? '';
		expect(text).toContain('On file — recorded 2026-09-30 in this browser');
		expect(text).toContain('Recorded on this device only; nothing is sent to a host.');
	});

	it('records the day the reader picks, not the day the page opened', async () => {
		const { container, getByLabelText } = render(LotSheet, { data: { lot: '309' } });
		await fireEvent.input(getByLabelText('Date on the Form K'), { target: { value: '2026-08-01' } });
		await fireEvent.submit(container.querySelector('form')!);
		expect(container.textContent ?? '').toContain('On file — recorded 2026-08-01 in this browser');
	});

	it('takes the record back off the lot', async () => {
		const { container, getByLabelText, findByText } = render(LotSheet, { data: { lot: '309' } });
		await fireEvent.submit(container.querySelector('form')!);
		const undo = await findByText('Remove the record');
		await fireEvent.click(undo);
		const text = container.textContent ?? '';
		expect(text).not.toContain('On file —');
		// And the form is offered again, with the usual default.
		expect((getByLabelText('Date on the Form K') as HTMLInputElement).value).toBe('2026-09-30');
	});
});

/**
 * The certificate a buyer's notary asks for.
 *
 * The lot's sheet and the receivables page both say "Form F withheld"; the
 * certificate is the page that says why, with the balance and the day it was
 * struck. It sits behind a button so the lot's working page and the certificate
 * are never on the same sheet of paper.
 */
describe('/units/[lot] — the Form F certificate', () => {
	beforeEach(() => localStorage.clear());

	async function openCertificate(container: HTMLElement) {
		const button = [...container.querySelectorAll('button')].find(
			(node) => node.textContent?.trim() === 'Form F certificate'
		);
		expect(button).toBeTruthy();
		await fireEvent.click(button as HTMLElement);
	}

	it('withholds lot 309’s certificate for its unpaid fine', async () => {
		const { container } = render(LotSheet, { data: { lot: '309' } });
		await openCertificate(container);
		const cert = container.querySelector('.ff-doc')!;
		expect(cert).toBeTruthy();
		expect(cert.closest('.no-print')).toBeNull();
		const text = cert.textContent ?? '';
		expect(text).toContain('Withheld');
		expect(text).toContain('$200.00');
		expect(text).toContain('Bylaw fine');
		expect(text).toContain('OS-FF-2026-09-309');
		// The working page steps aside so the print is the certificate alone.
		expect(container.querySelector('.hidden')).toBeTruthy();
	});

	it('issues lot 305’s certificate and prints October as not yet due', async () => {
		const { container } = render(LotSheet, { data: { lot: '305' } });
		await openCertificate(container);
		const cert = container.querySelector('.ff-doc')!;
		const text = cert.textContent ?? '';
		expect(text).toContain('Issued');
		expect(text).toContain('$0.00');
		expect(text).toContain('Not yet due');
		// The next fee is printed but not counted: $576 is 128 points at $4.50.
		expect(text).toContain('$576.00');
	});
});
