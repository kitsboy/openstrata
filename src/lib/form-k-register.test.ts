import { describe, expect, it } from 'vitest';
import { formKRegister } from './form-k-register';
import { getUnit, units, type Unit } from './demo/building';
import { recordFormK } from './form-k';
import { FORM_K_CAP, FORM_K_EACH, formKPenalty } from './health';

const AS_OF = '2026-09-30';

const ids = (rows: ReturnType<typeof formKRegister>['rows']): string[] =>
	rows.map((row) => row.unitId);

const fixture = (unit: Unit, index: number): Unit => ({
	...unit,
	id: `90${index}`,
	// Five gaps, the newest last: the cap has to fall on the oldest four.
	tenantSince: `2026-0${index}-01`,
	formK: 'missing'
});

describe('formKRegister', () => {
	it('lists every lot with a tenant and no other lot', () => {
		const register = formKRegister(units, {}, AS_OF);
		expect(ids(register.rows).sort()).toEqual([
			'105',
			'106',
			'204',
			'209',
			'303',
			'309',
			'406',
			'407'
		]);
		expect(register.tenanted).toBe(8);
	});

	it('closes the window 14 days after the tenancy began', () => {
		const row = formKRegister(units, {}, AS_OF).rows.find((entry) => entry.unitId === '209');
		expect(row?.since).toBe('2026-09-01');
		expect(row?.closes).toBe('2026-09-15');
	});

	it('orders the gaps by how long they have been open, then by lot', () => {
		const register = formKRegister(units, {}, AS_OF);
		expect(ids(register.rows).slice(0, 3)).toEqual(['309', '209', '407']);
		expect(register.rows[0]?.pastDays).toBe(77);
		expect(register.rows[1]?.pastDays).toBe(15);
		expect(register.rows[2]?.pastDays).toBe(15);
	});

	it('counts a lot with its form on file out of the gaps, and puts it last', () => {
		const register = formKRegister(units, {}, AS_OF);
		const row = register.rows.find((entry) => entry.unitId === '105');
		expect(row?.onFile).toBe(true);
		expect(row?.pastDays).toBe(0);
		expect(row?.cost).toBe(0);
		// Every filed lot sits below every gap.
		const firstFiled = register.rows.findIndex((entry) => entry.onFile);
		expect(firstFiled).toBe(3);
	});

	it('closes the gap from a filing recorded on the statement day', () => {
		const filed = recordFormK({}, '309', AS_OF);
		const register = formKRegister(units, filed, AS_OF);
		const row = register.rows.find((entry) => entry.unitId === '309');
		expect(row?.onFile).toBe(true);
		expect(row?.recordedOn).toBe(AS_OF);
		expect(row?.pastDays).toBe(0);
		expect(row?.cost).toBe(0);
		expect(register.gaps).toBe(2);
		expect(register.cost).toBe(10);
	});

	it('does not let a September filing close August’s gap', () => {
		const filed = recordFormK({}, '309', AS_OF);
		const august = formKRegister(units, filed, '2026-08-31');
		const row = august.rows.find((entry) => entry.unitId === '309');
		expect(row?.onFile).toBe(false);
		expect(row?.pastDays).toBe(47);
		// Only 309 was tenanted by August: the September two are still ahead.
		expect(august.gaps).toBe(1);
	});

	it('lists a window that is still open but does not charge for it', () => {
		const register = formKRegister(units, {}, '2026-09-10');
		expect(register.gaps).toBe(1);
		expect(register.cost).toBe(FORM_K_EACH);
		const open = register.rows.filter((row) => row.open);
		expect(ids(open)).toEqual(['209', '407']);
		expect(open.every((row) => row.pastDays === 0 && row.cost === 0)).toBe(true);
		// The soonest window close comes first among the open ones.
		expect(open[0]?.closes).toBe('2026-09-15');
	});

	it('charges exactly what the score charges, at every date', () => {
		for (const asOf of ['2026-06-30', '2026-08-31', '2026-09-10', AS_OF]) {
			const register = formKRegister(units, {}, asOf);
			const sum = register.rows.reduce((total, row) => total + row.cost, 0);
			expect(register.cost).toBe(formKPenalty(register.gaps));
			expect(sum).toBe(register.cost);
		}
	});

	it('spends the cap on the oldest gaps and says the rest cost nothing', () => {
		const cloned = [1, 2, 3, 4, 5].map((index) => fixture(getUnit('209'), index));
		const register = formKRegister(cloned, {}, AS_OF);
		expect(register.gaps).toBe(5);
		expect(register.cost).toBe(FORM_K_CAP);
		expect(register.rows.map((row) => row.cost)).toEqual([5, 5, 5, 0, 0]);
		// Oldest first, so the points land on the longest-open windows.
		expect(register.rows[0]?.since).toBe('2026-01-01');
		expect(register.rows[4]?.since).toBe('2026-05-01');
	});
});
