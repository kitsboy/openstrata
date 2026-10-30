/**
 * Form F on paper: the certificate that lets a sale complete, or stops it.
 *
 * The lot's sheet has said "Form F: withheld" since the first version of the
 * page, and the printed documents on `/documents` carry a Form F template for
 * unit 101. Neither is the certificate a buyer's notary asks for: that one names
 * the lot, the balance on the day it is signed, what makes the balance up, and
 * the state — issued or withheld — with a signature line under it.
 *
 * Four rules keep this sheet from becoming a courtesy:
 *
 * 1. **The state is the certificate's own arithmetic.** A certificate is withheld
 *    when the charges owing on its date add to more than zero. At the books'
 *    statement date that is the same answer `formF` gives the lot's sheet, and a
 *    test checks it across all forty lots, so the two cannot drift.
 * 2. **Only a charge that has fallen due is owing.** The next month's fee is
 *    printed on its own line as not yet payable; a certificate that counted a fee
 *    due tomorrow would withhold a sale over a bill the owner is not late on.
 * 3. **A certificate is never dated before the books it quotes.** An issue date
 *    earlier than the statement date is moved forward to it, because a notary
 *    reads the date as the day the balance was struck.
 * 4. **The delivery window is Form B's seven days.** The two forms travel
 *    together on a request, so the certificate takes the same window the Form B
 *    template already prints rather than inventing a second deadline.
 */

import { addDays } from './arrears';
import type { Charge, ChargeKind } from './arrears';
import { FORM_B_DAYS, docReference } from './documents';

export interface CertificateLine {
	kind: ChargeKind;
	/** The day the charge fell due. */
	due: string;
	/** `YYYY-MM` for a monthly fee or the late fee that follows it. */
	period?: string;
	cents: number;
}

export interface FormFCertificate {
	unitId: string;
	owner: string;
	/** The day the books are struck for the balance. */
	asOf: string;
	/** The day the certificate is signed; never earlier than `asOf`. */
	issued: string;
	/** `issued` clears a sale; `withheld` stops one. */
	state: 'issued' | 'withheld';
	/** Every charge owing on `asOf`, oldest first. */
	owing: CertificateLine[];
	owingCents: number;
	/** The next fee, due after `asOf` — printed, and not counted as owing. */
	next: CertificateLine | null;
	/** The kinds that stand, in the order a certificate lists them. */
	withheldFor: ChargeKind[];
	/** `OS-FF-2026-09-305`. */
	reference: string;
	/** The last day to deliver it, seven days after issue. */
	deliverBy: string;
}

/** The order the kinds are read in, the same one the lot's own account uses. */
const KIND_ORDER: Record<ChargeKind, number> = { fee: 0, late: 1, fine: 2, levy: 3 };

function toLine(charge: Charge): CertificateLine {
	return {
		kind: charge.kind,
		due: charge.due,
		...(charge.period ? { period: charge.period } : {}),
		cents: charge.cents
	};
}

/**
 * The certificate for one lot.
 *
 * `charges` is every dated charge on the building — the same `charges(asOf)`
 * call the receivables page makes — so the certificate cannot total a figure
 * the ladder beside it does not have.
 */
export function formFCertificate(
	unit: { id: string; owner: string },
	charges: Charge[],
	asOf: string,
	issuedIso: string = asOf
): FormFCertificate {
	const issued = issuedIso < asOf ? asOf : issuedIso;

	const mine = charges.filter((charge) => charge.unitId === unit.id);
	const owing = mine
		.filter((charge) => charge.due <= asOf)
		.map(toLine)
		.sort(
			(a, b) => a.due.localeCompare(b.due) || KIND_ORDER[a.kind] - KIND_ORDER[b.kind]
		);

	const owingCents = owing.reduce((sum, line) => sum + line.cents, 0);
	const nextCharge = mine
		.filter((charge) => charge.due > asOf)
		.sort((a, b) => a.due.localeCompare(b.due))[0];

	const withheldFor = [...new Set(owing.map((line) => line.kind))].sort(
		(a, b) => KIND_ORDER[a] - KIND_ORDER[b]
	);

	return {
		unitId: unit.id,
		owner: unit.owner,
		asOf,
		issued,
		state: owingCents > 0 ? 'withheld' : 'issued',
		owing,
		owingCents,
		next: nextCharge ? toLine(nextCharge) : null,
		withheldFor,
		reference: `${docReference('OS-FF', issued)}-${unit.id}`,
		deliverBy: addDays(issued, FORM_B_DAYS)
	};
}
