import { describe, expect, it } from 'vitest';
import { packetMaths } from './meeting-packet';
import { NOTICE_WINDOWS } from './documents';

describe('packetMaths', () => {
	it('puts the council notice deadline seven days before the meeting', () => {
		const maths = packetMaths({
			meetingIso: '2026-10-20',
			noticeWindowDays: NOTICE_WINDOWS.council,
			seats: 5
		});
		expect(maths.noticeBy).toBe('2026-10-13');
		expect(maths.given).toBe('2026-10-13');
		expect(maths.days).toBe(7);
		expect(maths.met).toBe(true);
	});

	it('puts the AGM deadline fourteen days out', () => {
		const maths = packetMaths({
			meetingIso: '2027-05-19',
			noticeWindowDays: NOTICE_WINDOWS.agm,
			seats: 40
		});
		expect(maths.noticeBy).toBe('2027-05-05');
		expect(maths.days).toBe(14);
		expect(maths.met).toBe(true);
	});

	it('calls a notice given inside the window late, rather than rounding it up', () => {
		const maths = packetMaths({
			meetingIso: '2026-10-20',
			noticeWindowDays: NOTICE_WINDOWS.council,
			seats: 5,
			givenIso: '2026-10-15'
		});
		expect(maths.days).toBe(5);
		expect(maths.met).toBe(false);
	});

	it('needs a majority of the seats, in whole people', () => {
		expect(packetMaths({ meetingIso: '2026-10-20', noticeWindowDays: 7, seats: 5 }).quorumNeed).toBe(3);
		expect(packetMaths({ meetingIso: '2026-10-20', noticeWindowDays: 7, seats: 4 }).quorumNeed).toBe(3);
		expect(packetMaths({ meetingIso: '2026-10-20', noticeWindowDays: 7, seats: 1 }).quorumNeed).toBe(1);
	});

	it('crosses a month boundary without losing a day', () => {
		const maths = packetMaths({
			meetingIso: '2027-03-02',
			noticeWindowDays: NOTICE_WINDOWS.agm,
			seats: 5
		});
		expect(maths.noticeBy).toBe('2027-02-16');
		expect(maths.days).toBe(14);
	});
});
