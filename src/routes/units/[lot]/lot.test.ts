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

/**
 * The same arrears, as a letter to the owner.
 *
 * The ladder and the lot's sheet are the council's view; the letter is the page
 * that goes to the owner. It has to ask only for money that has fallen due, name
 * the next fee without collecting it, and give the day the bylaw adds a late fee.
 */
describe('/units/[lot] — the arrears letter', () => {
	beforeEach(() => localStorage.clear());

	async function openLetter(container: HTMLElement) {
		const button = [...container.querySelectorAll('button')].find(
			(node) => node.textContent?.trim() === 'Letter to the owner'
		);
		expect(button).toBeTruthy();
		await fireEvent.click(button as HTMLElement);
	}

	it('asks lot 309 for the fine, and prints October separately', async () => {
		const { container } = render(LotSheet, { data: { lot: '309' } });
		await openLetter(container);
		const letter = container.querySelector('.arrears-letter-doc')!;
		expect(letter).toBeTruthy();
		expect(letter.closest('.no-print')).toBeNull();
		const text = letter.textContent ?? '';
		expect(text).toContain('OS-AL-2026-09-309');
		expect(text).toContain('$200.00');
		expect(text).toContain('Bylaw fine');
		expect(text).toContain('14');
		// October's fee is stated, and is not part of what is asked for.
		expect(text).toContain('$792.00');
		expect(text).toContain('not part of this amount');
		// The bylaw's own day: the 5th of the month after the letter.
		expect(text).toContain('October 5, 2026');
		// The working page steps aside so the print is the letter alone.
		expect(container.querySelector('.hidden')).toBeTruthy();
	});

	it('prints a levy on a schedule as a schedule, not as arrears', async () => {
		const { container } = render(LotSheet, { data: { lot: '108' } });
		await openLetter(container);
		const text = container.querySelector('.arrears-letter-doc')?.textContent ?? '';
		expect(text).toContain('$1,800.00');
		expect(text).toContain('$300.00 a month');
		expect(text).toContain('agreed schedule');
	});
});

/**
 * The lot's other two letters.
 *
 * The parkade levy and the building's policy are both things an owner asks the
 * council for in writing. Each is behind its own button so the working page and
 * the letter are never on the same sheet, and a lot that owes no levy is not
 * offered a demand for nothing.
 */
describe('/units/[lot] — the levy letter', () => {
	beforeEach(() => localStorage.clear());

	async function open(container: HTMLElement, label: string) {
		const button = [...container.querySelectorAll('button')].find(
			(node) => node.textContent?.trim() === label
		);
		expect(button).toBeTruthy();
		await fireEvent.click(button as HTMLElement);
	}

	it('demands lot 207 its share, not the share it has already paid', async () => {
		const { container } = render(LotSheet, { data: { lot: '207' } });
		await open(container, 'Levy letter');
		const letter = container.querySelector('.levy-letter-doc')!;
		expect(letter).toBeTruthy();
		expect(letter.closest('.no-print')).toBeNull();
		const text = letter.textContent ?? '';
		expect(text).toContain('OS-LV-2026-09-207');
		// 148 points at $36 is $5,328; a third paid leaves $3,552.
		expect(text).toContain('$5,328.00');
		expect(text).toContain('$3,552.00');
		expect(text).toContain('This letter asks for');
		// The trust the books carry, with both routes on the page.
		expect(text).toContain('$216,000.00');
		expect(text).toContain('$176,400.00');
		expect(text).toContain('$39,600.00');
		// The meeting the council would agree a plan at, and the day the levy fell due.
		expect(text).toContain('October 20, 2026');
		expect(text).toContain('November 12, 2025');
		expect(container.querySelector('.hidden')).toBeTruthy();
	});

	it('asks a plan lot for its instalment and shows the balance it is working down', async () => {
		const { container } = render(LotSheet, { data: { lot: '108' } });
		await open(container, 'Levy letter');
		const text = container.querySelector('.levy-letter-doc')?.textContent ?? '';
		expect(text).toContain('$1,800.00');
		expect(text).toContain('$300.00 a month');
	});

	it('offers no levy letter to a lot whose share is paid', () => {
		const { container } = render(LotSheet, { data: { lot: '305' } });
		const labels = [...container.querySelectorAll('button')].map((node) =>
			node.textContent?.trim()
		);
		expect(labels).not.toContain('Levy letter');
		expect(container.querySelector('.levy-letter-doc')).toBeNull();
	});
});

describe('/units/[lot] — the insurance notice', () => {
	beforeEach(() => localStorage.clear());

	it('tells the owner what the strata insures, what they insure and the deductibles', async () => {
		const { container } = render(LotSheet, { data: { lot: '207' } });
		const button = [...container.querySelectorAll('button')].find(
			(node) => node.textContent?.trim() === 'Insurance notice'
		);
		expect(button).toBeTruthy();
		await fireEvent.click(button as HTMLElement);
		const notice = container.querySelector('.insurance-notice-doc')!;
		expect(notice).toBeTruthy();
		const text = notice.textContent ?? '';
		expect(text).toContain('OS-IN-2026-09-207');
		expect(text).toContain('HH-2847-26');
		expect(text).toContain('$25,000.00');
		// The earthquake deductible stays a rule: 10% with a $100,000 floor.
		expect(text).toContain('10%');
		expect(text).toContain('$100,000.00');
		expect(text).toContain('March 31, 2027');
		// And the corporation's deductible is not charged to the owner.
		expect(text).toContain('asks you for neither deductible');
	});
});

/**
 * The lien file, behind its own button.
 *
 * Lot 207 is the only lot with a lien on a council agenda, so the sheet is the
 * status of a decision that has not been taken: the money, the four steps in
 * order, and the sentence that no lien is registered. A lot without a file is
 * offered nothing, because a page about a lien that does not exist would be the
 * worst paper this app could print.
 */
describe('/units/[lot] — the lien file', () => {
	beforeEach(() => localStorage.clear());

	it('prints lot 207’s file with the money and the step that is still ahead', async () => {
		const { container } = render(LotSheet, { data: { lot: '207' } });
		const button = [...container.querySelectorAll('button')].find(
			(node) => node.textContent?.trim() === 'Lien status'
		);
		expect(button).toBeTruthy();
		await fireEvent.click(button as HTMLElement);

		const sheet = container.querySelector('.lien-doc')!;
		expect(sheet).toBeTruthy();
		expect(sheet.closest('.no-print')).toBeNull();
		const text = sheet.textContent ?? '';
		expect(text).toContain('OS-LN-2026-09-207');
		// Three fees, three late fees and the levy; the October fee is apart.
		expect(text).toContain('$1,998.00');
		expect(text).toContain('$150.00');
		expect(text).toContain('$3,552.00');
		expect(text).toContain('$5,700.00');
		expect(text).toContain('$666.00');
		expect(text).toContain('dated October 1, 2026');
		// The demand, its age, and the vote that has not happened.
		expect(text).toContain('August 20, 2026');
		expect(text).toContain('41 days');
		expect(text).toContain('Oct 20, 2026');
		expect(text).toContain('In 20 days');
		expect(text).toContain('Council has not voted');
		expect(text).toContain('no lien is registered against the title');
		// The legal line, and the refusal to total it into the debt.
		expect(text).toContain('$1,850.00');
		expect(text).toContain('$5,400.00');
		expect(text).toContain('adds none to the amount');
	});

	it('offers no lien file to a lot that has none', () => {
		const { container } = render(LotSheet, { data: { lot: '305' } });
		const labels = [...container.querySelectorAll('button')].map((node) =>
			node.textContent?.trim()
		);
		expect(labels).not.toContain('Lien status');
		expect(container.querySelector('.lien-doc')).toBeNull();
	});
});
