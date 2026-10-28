import { error } from '@sveltejs/kit';
import { isUnitId, units } from '$lib/demo/building';

/**
 * Every lot gets its own prerendered page. The building is known at build time,
 * so the sheet is a real address (`/units/207`) rather than a query string a
 * reader has to keep together when they send it on.
 */
export const entries = () => units.map((unit) => ({ lot: unit.id }));

export const load = ({ params }: { params: { lot: string } }) => {
	if (!isUnitId(params.lot)) error(404, 'No such lot');
	return { lot: params.lot };
};
