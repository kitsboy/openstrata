/**
 * The building's renewals, taken from the registers that already carry dates.
 *
 * The contracts register holds eleven vendors; seven of them name a day in their
 * prose and four deliberately do not. The insurance record holds the appraisal
 * and the policy's own term end, and the calendar holds the day the broker starts
 * marketing. Nothing here is typed twice except the two steps, and those are
 * checked against the calendar by a test, so a moved marketing date cannot leave
 * the sheet behind.
 */

import type { RenewalItem } from '../renewal-calendar';
import { renewalCalendar, type RenewalCalendar } from '../renewal-calendar';
import { building } from './building';
import { contracts } from './books';

/**
 * The two dated steps the April renewal depends on. The appraisal is the
 * insurance record's own date; the marketing start is the calendar's 20 January
 * entry, which the test below holds this constant to.
 */
export const INSURANCE_STEPS: readonly RenewalItem[] = [
	{
		id: 'appraisal-2026-10-22',
		vendor: 'Harbour Insurance Brokers',
		service: 'Appraisal walks the common property before the renewal is marketed',
		dateIso: building.insurance.appraisalIso,
		kind: 'step',
		line: '6100'
	},
	{
		id: 'marketing-2027-01-20',
		vendor: 'Harbour Insurance Brokers',
		service: 'Broker starts marketing the renewal',
		dateIso: '2027-01-20',
		kind: 'step',
		line: '6100'
	}
];

/** Every dated renewal and step, with the register's own line code. */
export const renewalItems: RenewalItem[] = [
	...contracts.map((contract) => ({
		id: `${contract.vendor}-${contract.renewalIso ?? 'open'}`,
		vendor: contract.vendor,
		// A contract with no day keeps the register's own words for why not, so the
		// continuing list says "month to month" rather than only what the vendor does.
		service:
			contract.renewalIso === null ? `${contract.service} · ${contract.renewal}` : contract.service,
		dateIso: contract.renewalIso,
		kind: 'renewal' as const,
		line: contract.accounts[0] ?? null
	})),
	...INSURANCE_STEPS
];

/** The next twelve months of renewals at the statement date. */
export function renewalYear(asOf: string = building.asOf): RenewalCalendar {
	return renewalCalendar(renewalItems, asOf);
}
