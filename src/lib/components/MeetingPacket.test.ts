import { beforeEach, describe, expect, it } from 'vitest';
import { render, waitFor } from '@testing-library/svelte';
import MeetingPacket from './MeetingPacket.svelte';
import { locale } from '$lib/i18n';
import { nextCouncil, lastCouncil } from '$lib/demo/meetings';

describe('the meeting packet', () => {
	beforeEach(() => locale.set('en'));

	it('puts the notice, the agenda, the minutes and the quorum on one sheet', () => {
		const { container } = render(MeetingPacket);
		const text = container.textContent ?? '';
		expect(text).toContain('Council meeting packet');
		expect(text).toContain('Notice');
		expect(text).toContain('Agenda');
		expect(text).toContain(`Minutes — ${lastCouncil.date}`);
		expect(text).toContain('Council quorum');
	});

	it('prints the whole agenda and the whole last minutes', () => {
		const { container } = render(MeetingPacket);
		expect(container.querySelectorAll('.packet-agenda li')).toHaveLength(
			nextCouncil.agenda.length
		);
		expect(container.querySelectorAll('.packet-minutes li')).toHaveLength(
			lastCouncil.minutes.length
		);
	});

	it('states the notice deadline with its day count and window', () => {
		const { container } = render(MeetingPacket);
		const text = container.textContent ?? '';
		expect(text).toContain('October 13, 2026');
		expect(text).toContain('7 days ahead of the meeting');
		expect(text).toContain('7-day window');
	});

	it('does the quorum maths the page can be checked against', () => {
		const { container } = render(MeetingPacket);
		const text = container.textContent ?? '';
		expect(text).toContain('3 of 5');
		// And names the annual meeting that follows it, with its own quorum.
		expect(text).toContain('May 19, 2027');
		expect(text).toContain('14 of 40');
	});

	it('prints in the reader’s language', async () => {
		locale.set('fr');
		const { container } = render(MeetingPacket);
		await waitFor(() => expect(container.textContent).toContain('Dossier de réunion du conseil'));
		const text = container.textContent ?? '';
		expect(text).toContain('Ordre du jour');
		expect(text).toContain('Avis');
	});
});
