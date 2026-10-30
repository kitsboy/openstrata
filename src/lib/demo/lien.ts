/**
 * The one lien file the building has open, in the order it happened.
 *
 * The dates are other records' dates rather than a second telling: the demand is
 * the day the lot's own note says it went out, the opinion was directed at the
 * September council meeting, and the vote is the October meeting's own night. The
 * money is the arrears ladder's, split by what it is, with the October fee left
 * out because a lien secures a debt and not a bill that is not due.
 *
 * The vote has not been held at the statement date, so no outcome is recorded and
 * nothing is filed. That is the honest state of the file on 30 September, and the
 * sheet prints it that way.
 */

import { charges } from './arrears';
import { books } from './books';
import { building, councilSeats, formF, getUnit } from './building';
import { lastCouncil, nextCouncil, quorum } from './meetings';
import { daysBetween } from '../arrears';
import { lienStatus, type LienStatus, type LienParts } from '../lien-status';

interface LienFileRecord {
	/** The day the demand letter went to the owner, from the lot's own note. */
	demandIso: string;
	/** The day council directed the lawyer to draft the opinion, from the minutes. */
	opinionIso: string | null;
	/** The night of the vote, from the next meeting's agenda. */
	voteIso: string | null;
	/** Null until the vote is held. */
	voteOutcome: 'file' | 'decline' | null;
	/** Null until a lien is registered. */
	registrationIso: string | null;
}

/** Lot 207 is the only file with a lien on the agenda. */
const LIEN_FILES: Record<string, LienFileRecord> = {
	'207': {
		demandIso: '2026-08-20',
		opinionIso: lastCouncil.iso,
		voteIso: nextCouncil.iso,
		voteOutcome: null,
		registrationIso: null
	}
};

/** The lot's balance, split by what it is, at `asOf`. */
function partsFor(unitId: string, asOf: string): LienParts {
	const parts: LienParts = {
		feesCents: 0,
		lateCents: 0,
		levyCents: 0,
		fineCents: 0,
		notYetDueCents: 0,
		notYetDueIso: null
	};

	for (const charge of charges(asOf)) {
		if (charge.unitId !== unitId) continue;
		// A charge dated after the statement date is owed, but it is not a debt any
		// lien can secure yet.
		if (daysBetween(charge.due, asOf) < 0) {
			parts.notYetDueCents += charge.cents;
			// The earliest charge after the close is the one the sentence dates.
			if (parts.notYetDueIso === null || charge.due < parts.notYetDueIso) {
				parts.notYetDueIso = charge.due;
			}
			continue;
		}
		if (charge.kind === 'fee') parts.feesCents += charge.cents;
		else if (charge.kind === 'late') parts.lateCents += charge.cents;
		else if (charge.kind === 'levy') parts.levyCents += charge.cents;
		else parts.fineCents += charge.cents;
	}

	return parts;
}

/** Lot 207's lien file, or null when the lot has none open. */
export function lotLienStatus(
	unitId: string,
	asOf: string = building.asOf
): LienStatus | null {
	const file = LIEN_FILES[unitId];
	const unit = getUnit(unitId);
	if (!file || !unit) return null;

	// The legal line is the books' own; a lien adds no figure the ledger cannot
	// support, so the spend and its budget are the only legal money printed.
	const legal = books.expenses.find((line) => line.code === '6310');

	return lienStatus({
		unitId: unit.id,
		owner: unit.owner,
		asOf,
		demandIso: file.demandIso,
		opinionIso: file.opinionIso,
		voteIso: file.voteIso,
		voteOutcome: file.voteOutcome,
		registrationIso: file.registrationIso,
		parts: partsFor(unit.id, asOf),
		legal: {
			spentCents: legal?.ytdCents ?? 0,
			budgetCents: legal?.annualCents ?? 0
		},
		formFWithheld: formF(unit) === 'withheld',
		seats: councilSeats.length,
		quorum: quorum.councilNeed
	});
}
