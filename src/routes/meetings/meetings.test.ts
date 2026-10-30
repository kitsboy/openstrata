import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render } from '@testing-library/svelte';
import { locale } from '$lib/i18n';
import Meetings from './+page.svelte';

/**
 * /meetings prints five artifacts.
 *
 * The page around them is the workspace: quorum cards, the council, the agenda
 * and the vote guide. Everything that stays on screen carries `no-print`, so a
 * printed page is the packet, the proxy card, the AGM notice, the bylaw hearing
 * notice and the fine register — the same trick the lot sheet and the Form K
 * register use, checked on the rendered DOM rather than on the stylesheet.
 */
describe('/meetings', () => {
	beforeEach(() => locale.set('en'));

	it('renders the packet with its four pieces', () => {
		const { container } = render(Meetings);
		const packet = container.querySelector('.print-doc');
		expect(packet).toBeTruthy();
		const text = packet?.textContent ?? '';
		expect(text).toContain('Notice');
		expect(text).toContain('Agenda');
		expect(text).toContain('Council quorum');
		expect(text).toContain('Minutes — September 15, 2026');
	});

	it('prints the proxy card behind the packet, with the AGM’s own deadline', () => {
		const { container } = render(Meetings);
		const sheets = [...container.querySelectorAll('.print-doc')];
		expect(sheets).toHaveLength(5);
		const proxy = sheets[1].textContent ?? '';
		expect(proxy).toContain('Proxy card');
		// The card is due with the AGM notice: fourteen days before 19 May.
		expect(proxy).toContain('2027-05-05');
		// And it counts towards a third of the lots, not a majority.
		expect(proxy).toContain('14');
		expect(proxy).toContain('40');
		expect(proxy).toContain('Signature');
	});

	it('prints the AGM notice as a letter, with its deadline and budget year', () => {
		const { container } = render(Meetings);
		const sheets = [...container.querySelectorAll('.print-doc')];
		const notice = sheets[2].textContent ?? '';
		expect(notice).toContain('Notice of annual general meeting');
		expect(notice).toContain('To every owner of a lot in');
		// Issued 28 April, twenty-one days before the 19 May meeting; the last
		// lawful day is the packet's own 5 May.
		expect(notice).toContain('2027-04-28');
		expect(notice).toContain('2027-05-05');
		expect(notice).toContain('21 days ahead of the meeting');
		// The budget motion names the first fiscal year end after the meeting.
		expect(notice).toContain('March 31, 2028');
		expect(notice).toContain('Vote needed: Majority');
	});

	it('prints the complaint notice as a letter, with the window and the ceiling', () => {
		const { container } = render(Meetings);
		const sheets = [...container.querySelectorAll('.print-doc')];
		const hearing = sheets[3].textContent ?? '';
		expect(hearing).toContain('Notice of bylaw complaint and hearing');
		expect(hearing).toContain('To the owner of lot 309');
		expect(hearing).toContain('September 12, 2026');
		// The letter names the complainant by their relationship, never by name.
		expect(hearing).toContain('another owner in the building');
		expect(hearing).not.toContain('Solberg');
		// No fine is decided at the notice stage; the ceiling on one day is $200.
		expect(hearing).toContain('The most the bylaw allows');
		expect(hearing).toContain('$200.00');
	});

	it('prints the fine register from the notice to the unpaid posting', () => {
		const { container } = render(Meetings);
		const sheets = [...container.querySelectorAll('.print-doc')];
		const fines = sheets[4].textContent ?? '';
		expect(fines).toContain('Bylaw fine register');
		expect(fines).toContain('9.2 — no stays under 30 days');
		expect(fines).toContain('2026-09-12');
		expect(fines).toContain('2026-09-15');
		expect(fines).toContain('4–0–1');
		expect(fines).toContain('$200.00');
		expect(fines).toContain('Unpaid — 14 days');
	});

	it('keeps the packet out of the no-print half, and the workspace in it', () => {
		const { container } = render(Meetings);
		const packet = container.querySelector('.print-doc');
		expect(packet?.closest('.no-print')).toBeNull();

		const controls = [...container.querySelectorAll('.no-print')].map(
			(node) => node.textContent ?? ''
		);
		expect(controls.some((text) => text.includes('Print the meeting pack'))).toBe(true);
		// The page header is navigation too, so it does not go on the paper.
		expect(controls.some((text) => text.includes('Meetings and votes'))).toBe(true);
	});
});

/**
 * The minute extract, behind a button.
 *
 * The packet carries the register but not the decision as a minute: a council
 * that prints the mail run does not need it, and a lawyer or a notary who asks
 * for one wants that page alone. Opening it keeps the five sheets on screen and
 * takes them off the paper, so the print is the extract and nothing else.
 */
describe('/meetings — the minute extract', () => {
	beforeEach(() => locale.set('en'));

	async function open(container: HTMLElement) {
		const button = [...container.querySelectorAll('button')].find(
			(node) => node.textContent?.trim() === 'Minute extract'
		);
		expect(button).toBeTruthy();
		await fireEvent.click(button as HTMLElement);
	}

	it('is not counted among the sheets until it is opened', () => {
		const { container } = render(Meetings);
		expect(container.querySelector('.minutes-doc')).toBeNull();
		expect(container.querySelectorAll('.print-doc')).toHaveLength(5);
	});

	it('prints the decision with the vote as cast and the fine as posted', async () => {
		const { container } = render(Meetings);
		await open(container);
		const minute = container.querySelector('.minutes-doc')!;
		expect(minute).toBeTruthy();
		expect(minute.closest('.no-print')).toBeNull();
		// The packet steps off the paper while the extract is open.
		expect(container.querySelector('[class*="print:hidden"]')).not.toBeNull();
		const text = minute.textContent ?? '';
		expect(text).toContain('OS-BM-2026-09');
		expect(text).toContain('Extract from the minutes');
		expect(text).toContain('The motion carried 4–0, with 1 abstaining');
		expect(text).toContain('$200.00');
		expect(text).toContain('September 15, 2026');
		// The lot still owes the fine, so its Form F stays withheld.
		expect(text).toContain('Form F is withheld');
	});
});
