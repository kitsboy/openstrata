import { building, getUnit, monthlyFeeCents, payReference, type PayMethod } from './building';

export interface Receipt {
	date: string;
	unitId: string;
	owner: string;
	method: PayMethod;
	cents: number;
	reference: string;
	note: string;
}

function receipt(date: string, unitId: string, method: PayMethod, note: string, period = '202609'): Receipt {
	const unit = getUnit(unitId);
	return {
		date,
		unitId,
		owner: unit.owner,
		method,
		cents: monthlyFeeCents(unit.entitlement),
		reference: payReference(unitId, period),
		note
	};
}

export const receipts: Receipt[] = [
	receipt('2026-09-01', '305', 'Lightning', 'September fee. Settled in a few seconds. CAD locked at $135,820 for the invoice window.'),
	receipt('2026-09-01', '410', 'Bitcoin', 'Quarterly on-chain fee from the treasurer’s own wallet. One confirmation. The strata only watches the address.'),
	receipt('2026-09-01', '101', 'E-transfer', 'Reference matched on its own. The memo was exactly the code.'),
	receipt('2026-09-02', '110', 'Cheque', 'Deposited by the treasurer. Cleared September 4.'),
	receipt('2026-09-04', '210', 'Cheque', 'Mailbox drop. Cleared September 8.'),
	receipt('2026-09-01', '308', 'PAD', 'September fee. October was prepaid later in the month and is not in this row.'),
	receipt('2026-09-01', '106', 'E-transfer', 'Corporate owner. Memo included the lot number and the month.'),
	receipt('2026-09-18', '302', 'E-transfer', 'First fee from the new owner, plus the $200 move fee recorded on a separate line.')
];

export const rails = [
	{
		id: 'etransfer',
		name: 'Interac e-Transfer',
		always: true,
		summary: 'The everyday rail. The payment memo is the whole reconciliation.',
		steps: [
			'Send the exact amount to fees@lms2847.invalid from the owner’s bank.',
			'Put the reference code in the message field. A cute memo such as “September!!” will not match.',
			'The treasurer’s bank feed lands in suspense until the code matches a lot and a month.',
			'A matched payment posts to that lot and splits itself between operating and the CRF. The owner does not send two payments.',
			'Keep the bank confirmation. It is the receipt if a buyer asks for Form F later.'
		]
	},
	{
		id: 'bitcoin',
		name: 'Bitcoin',
		always: true,
		summary: 'On-chain, for an owner who wants to pay from their own wallet. The strata never holds the keys.',
		steps: [
			'The screen locks the CAD amount for 15 minutes at the posted rate and shows the exact bitcoin.',
			'Pay that amount to the watch-only address. Do not round it. A different amount sits in suspense.',
			'One confirmation posts the receipt. The CAD amount, the sats, the rate, and the transaction id are stored together.',
			'Keys sit on council hardware wallets, 3 of 5. This software only watches.',
			'The address on this demo cannot be paid. A live building replaces it with a real watch-only address before anyone is asked to send funds.'
		]
	},
	{
		id: 'lightning',
		name: 'Lightning',
		always: true,
		summary: 'Same CAD fee, settled instantly, still not custody.',
		steps: [
			'The invoice is for the exact sats of the locked CAD amount and it expires in 15 minutes.',
			'The owner pays from any Lightning wallet. A BOLT 12 offer is the standing monthly version for people who want a reusable code.',
			'Payment posts the moment it settles. There is no three-day hold and no card fee.',
			'The receipt stores the payment hash next to the lot and the month.',
			'The invoice string on this demo is not payable. It exists so a council can see the shape of the screen.'
		]
	},
	{
		id: 'pad',
		name: 'Pre-authorized debit',
		always: false,
		summary: 'Most lots in this building are on PAD. It pulls on the 1st.',
		steps: [
			'The owner signs a PAD agreement once. It lists the monthly fee and warns them before a change.',
			'The pull on the 1st uses the same reference as an e-transfer.',
			'A failed PAD becomes an ordinary receivable the next morning, and the late fee still attaches on the 5th if it is not replaced.',
			'Cancelling PAD is a form, not a phone call to the caretaker.'
		]
	},
	{
		id: 'cheque',
		name: 'Cheque',
		always: false,
		summary: 'Still accepted. Two owners use it. It is the slow rail, not a second-class owner.',
		steps: [
			'Payable to The Owners, Strata Plan LMS 2847.',
			'Write the lot and the month on the memo line.',
			'The treasurer deposits it to the operating account and the book splits the CRF portion over to the reserve account the same week.',
			'Form F waits until the cheque clears.'
		]
	}
] as const;

export const payDestinations = building.payTo;

export const howMatchingWorks = [
	'Every payment, on every rail, is trying to fill one number: the lot balance for a month.',
	'The reference code is LMS2847, the lot, and the year-month. October 2026 for lot 305 is LMS2847-305-202610.',
	'Operating gets $3.90 per entitlement point. The CRF gets $0.60. A $576 fee is one payment, then a transfer between the strata’s own accounts.',
	'Special levy payments use the same owner and a different code, LMS2847-305-LEVY, and they land in the levy trust. They are not fees and they are not the CRF.',
	'Fines and late fees are named in the reference only if the owner is paying them on purpose. Otherwise the cash applies oldest fee first, then late fees, then fines, then the levy.',
	'Anything that does not match sits in suspense and shows up on the treasurer’s list the same day. It is not income until it is assigned.'
];
