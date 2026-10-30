/**
 * The building's insurance as an owner would be told it.
 *
 * The policy, its term, both deductibles and the two halves of the bylaw's
 * insurance rule are read from the `building` record the council adopted. The
 * bylaw's sentence is one line, so it is split where the bylaw itself changes
 * subject: the strata's half and the owner's half. Nothing is retyped, which is
 * what keeps the notice from drifting from the bylaw it quotes.
 *
 * The deductible is the corporation's, and the records charge it to no owner, so
 * `deductibleCharge` is `none-on-file`. If a bylaw ever changes that, this is the
 * one line a council has to change.
 */

import { building, bylaws, units } from './building';
import { ownerInsuranceNotice, type OwnerInsuranceNotice } from '../insurance-notice';

/** The insurance bylaw, split into its two halves at the bylaw's own full stop. */
function coverHalves(): { strata: string; owner: string } {
	const rule = bylaws.find((bylaw) => bylaw.name === 'Insurance')?.rule ?? '';
	const [strata = '', owner = ''] = rule.split('. ');
	return {
		strata: strata.replace(/\.$/, ''),
		owner: owner.replace(/\.$/, '')
	};
}

/** One lot's notice, or null when no such lot is on the register. */
export function lotInsuranceNotice(
	unitId: string,
	asOf: string = building.asOf
): OwnerInsuranceNotice | null {
	const unit = units.find((row) => row.id === unitId);
	if (!unit) return null;

	const cover = coverHalves();

	return ownerInsuranceNotice({
		unitId: unit.id,
		owner: unit.owner,
		asOf,
		policy: building.insurance.policy,
		broker: building.insurance.broker,
		termStart: building.insurance.termStart,
		termEnd: building.insurance.termEnd,
		waterDeductibleCents: building.insurance.waterDeductibleCents,
		quake: building.insurance.quake,
		strataCover: cover.strata,
		ownerCover: cover.owner,
		deductibleCharge: 'none-on-file'
	});
}
