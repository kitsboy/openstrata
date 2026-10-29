/**
 * A payment on paper.
 *
 * The tape on `/pay` is a screen record: eight rows a treasurer reads. A receipt
 * is the same fact handed to an owner, and it has to be right in ways the tape
 * does not have to be — the amount split between the two funds, the rail it
 * actually came in on, and, for a crypto payment, the rate it locked at. A
 * receipt that re-priced an old payment at today's rate would state a number
 * nobody ever paid, which is worse than stating nothing.
 *
 * Three rules, each one a decision:
 *
 * 1. **The split is the fee's own.** Operating takes $3.90 and the reserve $0.60
 *    per entitlement point, so the amount is divided in that ratio and the
 *    reserve takes the rounding remainder. The two parts always add back to the
 *    amount: a receipt whose split is a cent out is a receipt an owner will
 *    query, and rightly.
 * 2. **A transaction id belongs to a rail that has one.** Lightning and on-chain
 *    payments carry a txid or payment hash; an e-transfer, a PAD pull and a
 *    cheque do not. A txid recorded against a cheque is dropped rather than
 *    printed, because the paper would be asserting something untrue.
 * 3. **A locked rate is quoted, never recomputed.** A crypto receipt prints the
 *    CAD rate the amount was locked at and the bitcoin that rate bought, taken
 *    from the payment's own record. When the record has no rate — an older row,
 *    or a rail that does not lock one — the receipt says the rate was not
 *    recorded instead of pricing the payment again today.
 */

import { CRF_POINT_CENTS, OP_POINT_CENTS } from './demo/building';
import { btcQuote } from './demo/format';
import type { PayMethod } from './demo/building';
import type { Receipt } from './demo/payments';

/** The two rails that lock a CAD rate and settle in bitcoin. */
export const CRYPTO_RAILS: readonly PayMethod[] = ['Bitcoin', 'Lightning'];

export function isCryptoRail(rail: PayMethod): boolean {
	return CRYPTO_RAILS.includes(rail);
}

export interface FeeSplit {
	operatingCents: number;
	reserveCents: number;
}

/**
 * The fee's operating / reserve split, cross-multiplied from the amount so a
 * receipt works for a part payment or a levy top-up as well as a whole fee. The
 * reserve takes the remainder, so the parts add back exactly.
 */
export function splitFee(cents: number): FeeSplit {
	const operatingCents = Math.round((cents * OP_POINT_CENTS) / (OP_POINT_CENTS + CRF_POINT_CENTS));
	return { operatingCents, reserveCents: cents - operatingCents };
}

export interface ReceiptFacts {
	date: string;
	unitId: string;
	owner: string;
	rail: PayMethod;
	cents: number;
	/** The council's reference code — on every rail, including the crypto ones. */
	reference: string;
	/** The transaction or payment hash, for a rail that has one. */
	txid: string | null;
	/** CAD cents per bitcoin at the lock, when the record has it. */
	rateCents: number | null;
	/** The quantity that rate bought, in sats, when both amount and rate exist. */
	sats: number | null;
	/** The same quantity written out as bitcoin, for the receipt's own line. */
	btc: string | null;
	split: FeeSplit;
	note: string;
}

export function receiptFacts(row: Receipt): ReceiptFacts {
	const crypto = isCryptoRail(row.method);
	// Rule 2: only a rail with a transaction can print one.
	const txid = crypto ? (row.txid ?? null) : null;
	// Rule 3: the record's own rate, or nothing. Never `BTC_CAD_CENTS`.
	const rateCents = crypto ? (row.rateCents ?? null) : null;
	const quote = rateCents ? btcQuote(row.cents, rateCents) : null;
	return {
		date: row.date,
		unitId: row.unitId,
		owner: row.owner,
		rail: row.method,
		cents: row.cents,
		reference: row.reference,
		txid,
		rateCents,
		sats: quote?.sats ?? null,
		btc: quote?.btc ?? null,
		split: splitFee(row.cents),
		note: row.note
	};
}

/**
 * A payment's identity on the tape: the day and the lot. Two payments by one lot
 * on one day are one receipt here, which is what the sample tape holds.
 */
export function receiptKey(row: Receipt): string {
	return `${row.date}-${row.unitId}`;
}

/**
 * The receipt a reader gets before picking one: the newest payment on the tape,
 * so `window.print()` on arrival puts a real page on paper rather than a blank
 * one. Same-day rows keep the order they were written in.
 */
export function newestReceipt(receipts: Receipt[]): Receipt | null {
	const ordered = receipts
		.map((row, index) => ({ row, index }))
		.sort((a, b) => a.row.date.localeCompare(b.row.date) || a.index - b.index);
	return ordered.at(-1)?.row ?? null;
}
