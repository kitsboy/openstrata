import { beforeEach, describe, expect, it } from 'vitest';
import { render } from '@testing-library/svelte';
import { locale } from '$lib/i18n';
import Meetings from './+page.svelte';

/**
 * /meetings prints four artifacts.
 *
 * The page around them is the workspace: quorum cards, the council, the agenda
 * and the vote guide. Everything that stays on screen carries `no-print`, so a
 * printed page is the packet, the proxy card, the AGM notice and the fine
 * register — the same trick the lot sheet and the Form K register use, checked
 * on the rendered DOM rather than on the stylesheet.
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
		expect(sheets).toHaveLength(4);
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

	it('prints the fine register from the notice to the unpaid posting', () => {
		const { container } = render(Meetings);
		const sheets = [...container.querySelectorAll('.print-doc')];
		const fines = sheets[3].textContent ?? '';
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
