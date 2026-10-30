import { describe, expect, it } from 'vitest';
import { NOTICE_WINDOWS } from './documents';
import { proxyCounts, proxyDeadline } from './proxy-card';

describe('proxy card', () => {
	it('makes an AGM card due on the notice deadline and no later', () => {
		const deadline = proxyDeadline('2027-05-19', 14);
		expect(deadline.dueBy).toBe('2027-05-05');
		expect(deadline.days).toBe(14);
		// A third of the 40 lots, which is the AGM's quorum, not a majority.
		expect(deadline.quorumNeed).toBe(14);
	});

	it('takes the council’s seven-day window when that is the meeting printed', () => {
		const deadline = proxyDeadline('2026-10-20', 3, NOTICE_WINDOWS.council);
		expect(deadline.dueBy).toBe('2026-10-13');
		expect(deadline.days).toBe(7);
	});

	it('counts a signed card for a named lot and appointee', () => {
		const deadline = proxyDeadline('2026-10-20', 14, NOTICE_WINDOWS.council);
		expect(proxyCounts({ lot: '207', appointee: 'Helen Cho', signed: true }, deadline)).toEqual({
			counts: true,
			refusal: null
		});
	});

	it('refuses a card with no lot, no appointee, or no signature', () => {
		const deadline = proxyDeadline('2026-10-20', 14, NOTICE_WINDOWS.council);
		expect(proxyCounts({ appointee: 'Helen Cho', signed: true }, deadline).refusal).toBe('no-lot');
		expect(proxyCounts({ lot: '207', signed: true }, deadline).refusal).toBe('no-appointee');
		expect(proxyCounts({ lot: '207', appointee: 'Helen Cho' }, deadline).refusal).toBe('unsigned');
	});

	it('counts a card that arrives on the deadline and not one a day later', () => {
		const deadline = proxyDeadline('2026-10-20', 14, NOTICE_WINDOWS.council);
		const card = { lot: '207', appointee: 'Helen Cho', signed: true };
		expect(proxyCounts({ ...card, receivedIso: '2026-10-13' }, deadline).counts).toBe(true);
		expect(proxyCounts({ ...card, receivedIso: '2026-10-14' }, deadline)).toEqual({
			counts: false,
			refusal: 'late'
		});
	});

	it('leaves the direction out of the test, because a blank is a discretion', () => {
		const deadline = proxyDeadline('2026-10-20', 14, NOTICE_WINDOWS.council);
		const withoutDirection = proxyCounts(
			{ lot: '207', appointee: 'Helen Cho', signed: true, receivedIso: '2026-10-10' },
			deadline
		);
		expect(withoutDirection.counts).toBe(true);
	});
});
