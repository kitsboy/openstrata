/**
 * The Form K register: the tenanted lots, read the way the health score reads them.
 *
 * The score has always charged a missing Form K but never showed the list it was
 * counting. This is that list, as one page a council can print and take to a
 * meeting: every lot with a tenant, the day its two-week window closed, whether
 * the form is on file, and how long a missing one has been missing.
 *
 * Four rules keep the page and the score honest with each other:
 *
 * 1. **Only a closed window is a gap.** A tenant who moved in three days ago has
 *    not failed anything, so that lot is listed with its window still open and
 *    costs nothing. The demo's September start dates make this visible: scored at
 *    10 September, lots 209 and 407 have no gap yet.
 * 2. **A gap costs what `health.ts` says.** The per-gap charge and the 15-point
 *    cap are imported rather than restated, and the register's total is the same
 *    `formKPenalty` the gauge adds. Once the cap is reached a further gap costs
 *    nothing, and the row says so instead of pretending otherwise.
 * 3. **A filing recorded on this device counts from its own day.** The register
 *    reads `isFiled`, which refuses a filing dated after the statement date, so a
 *    form recorded in September cannot erase August's gap.
 * 4. **The order is the order of cost.** Gaps first, longest open first, then
 *    windows still open (soonest deadline first), then the lots already filed.
 */

import { addDays, daysBetween } from './arrears';
import type { Unit } from './demo/building';
import { filedOn, isFiled, type FiledForms } from './form-k';
import { FORM_K_CAP, FORM_K_DAYS, FORM_K_EACH, formKPenalty } from './health';

export interface RegisterRow {
	unitId: string;
	owner: string;
	tenant: string;
	/** The day the tenancy began. */
	since: string;
	/** The day the bylaw window closed, `since` plus 14 days. */
	closes: string;
	/** The filing this browser recorded, whatever its date. Null when none. */
	recordedOn: string | null;
	onFile: boolean;
	/** True while the window is still open at the statement date. */
	open: boolean;
	/** Whole days the window has been closed. Zero while open or filed. */
	pastDays: number;
	/** Points this row adds to the health score. Zero once the cap is reached. */
	cost: number;
}

export interface Register {
	asOf: string;
	/** Gaps first, then open windows, then lots filed. See the sort below. */
	rows: RegisterRow[];
	/** Lots with a tenant to name — the denominator for the summary. */
	tenanted: number;
	gaps: number;
	/** The same points `formKPenalty` adds to the score, so the two cannot drift. */
	cost: number;
}

/** The prefix that orders two rows in the same state. Gaps, then open, then filed. */
function groupOf(row: RegisterRow): number {
	if (!row.onFile && !row.open) return 0;
	if (row.open) return 1;
	return 2;
}

/**
 * Every tenanted lot at `asOf`, in the order of what it costs.
 *
 * A unit with no tenant is not in the register at all: the Form K obligation
 * follows a tenancy, and a page that listed all 40 lots would bury the eight
 * that carry one.
 */
export function formKRegister(
	units: Unit[],
	filed: FiledForms = {},
	asOf: string
): Register {
	const rows: RegisterRow[] = [];

	for (const unit of units) {
		if (!unit.tenant || !unit.tenantSince) continue;
		const since = unit.tenantSince;
		const closes = addDays(since, FORM_K_DAYS);
		const onFile = unit.formK === 'signed' || isFiled(filed, unit.id, asOf);
		const open = !onFile && daysBetween(asOf, closes) > 0;
		const pastDays = onFile || open ? 0 : Math.max(0, daysBetween(closes, asOf));
		rows.push({
			unitId: unit.id,
			owner: unit.owner,
			tenant: unit.tenant,
			since,
			closes,
			recordedOn: filedOn(filed, unit.id),
			onFile,
			open,
			pastDays,
			cost: 0
		});
	}

	rows.sort((a, b) => {
		const state = groupOf(a);
		const group = state - groupOf(b);
		if (group !== 0) return group;
		if (state === 0 && a.pastDays !== b.pastDays) return b.pastDays - a.pastDays;
		if (state === 1 && a.closes !== b.closes) return a.closes.localeCompare(b.closes);
		if (state === 2 && a.closes !== b.closes) return b.closes.localeCompare(a.closes);
		return a.unitId.localeCompare(b.unitId);
	});

	// The cap is spent in order, on the oldest gap first: a council chasing the
	// list from the top is chasing the points the score is actually charging.
	let remaining = FORM_K_CAP;
	for (const row of rows) {
		if (row.onFile || row.open) continue;
		row.cost = Math.min(FORM_K_EACH, remaining);
		remaining -= row.cost;
	}

	const gaps = rows.filter((row) => !row.onFile && !row.open).length;
	return { asOf, rows, tenanted: rows.length, gaps, cost: formKPenalty(gaps) };
}
