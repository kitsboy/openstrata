/**
 * Evergreen House — fictional 40-lot Vancouver strata used as the MVP demo.
 * Every fee is entitlement × $4.50, so the books can be checked by hand.
 * $0.60 of each point goes to the CRF and $3.90 stays in operating.
 */

export const BTC_CAD_CENTS = 13_582_000;
export const FEE_POINT_CENTS = 450;
export const CRF_POINT_CENTS = 60;
export const OP_POINT_CENTS = 390;
export const LEVY_POINT_CENTS = 3600;
export const TOTAL_ENTITLEMENT = 6000;
export const LATE_FEE_CENTS = 5000;

export type Occupancy = 'owner' | 'tenant' | 'vacant' | 'short-term';
export type FormK = 'signed' | 'missing' | 'n/a';
export type PayMethod = 'PAD' | 'E-transfer' | 'Lightning' | 'Bitcoin' | 'Cheque' | 'Unpaid';
export type Tone = 'arrears' | 'formk' | 'short-term' | 'levy' | 'vacant' | 'tenant' | 'owner';

export interface Unit {
	id: string;
	floor: number;
	lot: number;
	type: string;
	sqft: number;
	beds: number;
	baths: number;
	entitlement: number;
	owner: string;
	ownerKind: 'individual' | 'corporation';
	ownerLives: string;
	occupancy: Occupancy;
	tenant: string | null;
	tenantSince: string | null;
	formK: FormK;
	ev: boolean;
	parking: string[];
	locker: string;
	pets: string;
	feeArrearsMonths: number;
	levyOwing: number;
	lateOwing: number;
	fineOwing: number;
	prepaidOctober: boolean;
	payMethod: PayMethod;
	eht: string;
	svt: string;
	uht: string;
	role: string | null;
	phone: string;
	email: string;
	notes: string;
}

const lower = [
	{ suffix: '01', type: 'Studio', sqft: 548, beds: 0, baths: 1, entitlement: 98 },
	{ suffix: '02', type: 'Studio', sqft: 562, beds: 0, baths: 1, entitlement: 102 },
	{ suffix: '03', type: '1 Bedroom', sqft: 688, beds: 1, baths: 1, entitlement: 118 },
	{ suffix: '04', type: '1 Bedroom', sqft: 704, beds: 1, baths: 1, entitlement: 122 },
	{ suffix: '05', type: '1 Bedroom', sqft: 736, beds: 1, baths: 1, entitlement: 128 },
	{ suffix: '06', type: '1 Bed + Den', sqft: 804, beds: 1, baths: 1, entitlement: 142 },
	{ suffix: '07', type: '1 Bed + Den', sqft: 828, beds: 1, baths: 1, entitlement: 148 },
	{ suffix: '08', type: '2 Bedroom', sqft: 972, beds: 2, baths: 2, entitlement: 168 },
	{ suffix: '09', type: '2 Bedroom', sqft: 1018, beds: 2, baths: 2, entitlement: 176 },
	{ suffix: '10', type: '2 Bed + Den', sqft: 1136, beds: 2, baths: 2, entitlement: 198 }
];

const upper = [
	{ suffix: '01', type: '1 Bedroom', sqft: 760, beds: 1, baths: 1, entitlement: 128 },
	{ suffix: '02', type: '1 Bedroom', sqft: 792, beds: 1, baths: 1, entitlement: 134 },
	{ suffix: '03', type: '1 Bed + Den', sqft: 880, beds: 1, baths: 1, entitlement: 150 },
	{ suffix: '04', type: '2 Bedroom', sqft: 960, beds: 2, baths: 2, entitlement: 156 },
	{ suffix: '05', type: '2 Bedroom', sqft: 1004, beds: 2, baths: 2, entitlement: 162 },
	{ suffix: '06', type: '2 Bedroom', sqft: 1088, beds: 2, baths: 2, entitlement: 178 },
	{ suffix: '07', type: '2 Bed + Den', sqft: 1164, beds: 2, baths: 2, entitlement: 184 },
	{ suffix: '08', type: '2 Bed + Den', sqft: 1288, beds: 2, baths: 2, entitlement: 210 },
	{ suffix: '09', type: '3 Bedroom', sqft: 1396, beds: 3, baths: 2, entitlement: 228 },
	{ suffix: '10', type: '3 Bedroom', sqft: 1540, beds: 3, baths: 2, entitlement: 270 }
];

const names = [
	'Mei Lin Chen',
	'Andre Bouchard',
	'Sofia Rossi',
	'Chidi Okonkwo',
	'Hannah Bergstrom',
	'Northwater Holdings Ltd.',
	'Owen MacLeod',
	'Grace Kim',
	'Samir Haddad',
	'Ellen Voss',
	'Daniel Cho',
	'Amrita Shah',
	'Lukas Meier',
	'Yara Nasser',
	'Nora Ibrahim',
	'Felix Nguyen',
	'Ruth Adelakun',
	'Hana Suzuki',
	'Victor Lang',
	'Edith Bernard',
	'Colin Fraser',
	'Aisha Rahman',
	'Benoit Gagnon',
	'Tara Singh',
	'Priya Nandakumar',
	'Omar Farouk',
	'Jillian Crowe',
	'Helen Cho',
	'Marcus Webb',
	'Ingrid Solberg',
	'Kenji Watanabe',
	'Pauline Moreau',
	'Carmen Alvarez',
	'Robert Ellis',
	'Fatima Diallo',
	'Pacifica Estate Corp.',
	'Sandra Okello',
	'Wei Zhang',
	'Nadia Petrov',
	'David Singh'
];

type Story = Partial<
	Pick<
		Unit,
		| 'occupancy'
		| 'tenant'
		| 'tenantSince'
		| 'formK'
		| 'ownerKind'
		| 'ownerLives'
		| 'ev'
		| 'feeArrearsMonths'
		| 'levyOwing'
		| 'lateOwing'
		| 'fineOwing'
		| 'prepaidOctober'
		| 'payMethod'
		| 'eht'
		| 'svt'
		| 'uht'
		| 'role'
		| 'pets'
		| 'notes'
	>
> & { extraParking?: string[] };

const EHT_OK = 'Declared February 3, 2026 as a principal residence.';
const SVT_OK = 'Declared March 31, 2026 as a principal residence.';
const UHT_OK =
	'Excluded owner if this person is a Canadian citizen or permanent resident holding the lot in their own name. No UHT return.';

const stories: Record<string, Story> = {
	'101': {
		ev: true,
		payMethod: 'E-transfer',
		pets: 'One cat, Miso',
		notes: 'EV charger approved in 2025. Owner paid the stall wiring. Load study still covers the building cap.'
	},
	'102': {
		role: 'Vice-president',
		pets: 'None',
		notes: 'Council vice-president since 2024. Holds hardware key 2 of the 3-of-5 war-chest multisig.'
	},
	'104': {
		feeArrearsMonths: 1,
		lateOwing: LATE_FEE_CENTS,
		payMethod: 'Unpaid',
		notes:
			'Chidi is visiting family and missed September. He wrote on September 22 that the e-transfer will arrive October 3. The $50 late fee has already attached.'
	},
	'105': {
		occupancy: 'tenant',
		tenant: 'Jonah Reid',
		tenantSince: '2024-11-01',
		ownerLives: 'Calgary',
		payMethod: 'E-transfer',
		notes: 'Owner lives in Calgary. Tenant has been in place since November 2024. Form K is signed.'
	},
	'106': {
		occupancy: 'tenant',
		tenant: 'Leila Farooq',
		tenantSince: '2023-04-01',
		ownerKind: 'corporation',
		ownerLives: 'Corporate register — Calgary',
		payMethod: 'E-transfer',
		uht: 'Affected-owner watch. A corporation is often not an excluded owner. Northwater asks its own accountant whether a UHT-2900 is still required. The strata does not file it.',
		svt: 'Tenanted all year. A tenancy exemption is the usual result, and the corporation still has to declare by March 31.',
		notes: 'Long-term tenant. Form K signed. Corporate owner is on the UHT watch list for the owner desk, not for a strata filing.'
	},
	'108': {
		levyOwing: 180_000,
		notes:
			'Parkade levy balance $1,800. Fees are current. Grace is on a plan of $300 a month. Form F stays withheld until the levy is clear.'
	},
	'110': {
		payMethod: 'Cheque',
		pets: 'One dog, under the leash rule',
		notes: 'Pays by cheque, mailed to the treasurer. Caretaker walks it to the credit union.'
	},
	'201': {
		occupancy: 'vacant',
		ownerLives: 'North Vancouver — moved out',
		eht: 'Watch. Listed for sale on September 8, 2026. A listing exemption may apply. The owner confirms that with the City.',
		svt: 'Owner-occupied until August 2026, now listed. The next declaration has to describe the change.',
		notes:
			'Listed at $899,000 (demo asking price). Harbour Notary requested Form B on September 28. It is due October 5. Form F can be issued — nothing is owing.'
	},
	'203': {
		prepaidOctober: true,
		notes: 'PAD pulled September fees and Lukas also prepaid October on September 28.'
	},
	'204': {
		occupancy: 'tenant',
		tenant: 'Chris Dalton',
		tenantSince: '2025-06-01',
		ownerLives: 'Burnaby',
		notes: 'Form K signed. Yara lives in Burnaby and rents the lot out.'
	},
	'205': {
		role: 'Secretary',
		notes: 'Council secretary. Prepares notices, Form B, Form F, and the minute book.'
	},
	'207': {
		feeArrearsMonths: 3,
		lateOwing: 15_000,
		levyOwing: 355_200,
		payMethod: 'Unpaid',
		notes:
			'July, August, and September fees, three late fees, and $3,552 of the parkade levy. Demand letter went August 20. The lawyer is preparing a lien. Form F is withheld. Council decides on October 20 whether to file.'
	},
	'208': {
		ev: true,
		notes: 'Second EV charger on the P2 row. Owner paid the installation.'
	},
	'209': {
		occupancy: 'tenant',
		tenant: 'Mara Singh',
		tenantSince: '2026-09-01',
		formK: 'missing',
		ownerLives: 'Seattle',
		payMethod: 'E-transfer',
		notes:
			'Tenant moved in September 1. Form K was due September 15 and is missing. The 14-day reminder has already fired. Owner pays fees from Seattle.'
	},
	'210': {
		payMethod: 'Cheque',
		notes: 'Cheque payer. Edith drops it in the treasurer’s mailbox on the last business day.'
	},
	'302': {
		payMethod: 'E-transfer',
		notes:
			'Purchase completed September 15, 2026 from the estate of L. Okada. Move fee paid. Welcome package delivered the same day.'
	},
	'303': {
		occupancy: 'tenant',
		tenant: 'Emily Zhao',
		tenantSince: '2025-02-01',
		ownerLives: 'Victoria',
		notes: 'Form K signed. Owner is in Victoria.'
	},
	'305': {
		ev: true,
		payMethod: 'Lightning',
		pets: 'None',
		notes:
			'Demo owner. Priya pays the October fee with Lightning so a new resident can see the rail. September is already settled.'
	},
	'308': {
		role: 'President',
		prepaidOctober: true,
		pets: 'One dog, Pepper',
		extraParking: ['P41'],
		notes:
			'Council president. Rents extra stall P41 at $100 a month. Prepaid October. Hardware key 1 of the war chest. Declares a conflict if her own lot is on the agenda.'
	},
	'309': {
		occupancy: 'short-term',
		tenant: 'Rotating guests',
		tenantSince: '2026-07-01',
		formK: 'missing',
		fineOwing: 20_000,
		eht: 'Watch. Nightly stays usually do not count as a tenancy for the Empty Homes Tax. The owner declares, not the strata.',
		svt: 'Watch. Short-term use is a declaration problem for Marcus. See the bylaw file before anyone describes this lot as tenanted.',
		notes:
			'Bylaw 9.2 bans stays under 30 days. Ingrid in 310 complained on August 28. Hearing on September 15. Fine of $200 posted September 16 and unpaid. The ceiling in the bylaw is $200 a day. The regulation would have allowed up to $1,000 a day if the bylaw said so.'
	},
	'310': {
		notes: 'Complained in writing about lot 309 on August 28. She is the witness on the bylaw file.'
	},
	'401': {
		ev: true,
		prepaidOctober: true,
		payMethod: 'PAD',
		notes: 'Prepaid October by PAD top-up. EV charger on the P1 row.'
	},
	'403': {
		role: 'Member at large',
		levyOwing: 270_000,
		notes:
			'Levy plan of $450 a month, $2,700 left. Monthly fees are current. Carmen sits on council and leaves the room when her levy is discussed.'
	},
	'404': {
		occupancy: 'vacant',
		ownerLives: 'Toronto',
		payMethod: 'E-transfer',
		eht: 'Watch. Empty since March 2026. Principal-residence exemption is unlikely. The 2025 declaration was filed late, on February 20, 2026.',
		svt: 'Watch. Not a principal residence. The 2026 declaration is due March 31, 2027. The 2025 vacancy return is the owner’s tax, not the strata’s.',
		uht: UHT_OK,
		notes: 'Fees are current. Vacancy taxes are the owner’s problem. The strata keeps the occupancy record he will need.'
	},
	'406': {
		occupancy: 'tenant',
		tenant: 'Neil Park',
		tenantSince: '2026-08-01',
		ownerKind: 'corporation',
		ownerLives: 'Corporate — Hong Kong, local agent in Vancouver',
		payMethod: 'E-transfer',
		uht: 'Affected-owner watch. Foreign corporation. The owner’s accountant decides if a UHT return is due. Strata does not file UHT-2900 for an owner.',
		svt: 'Watch. Tenant only since August 1, 2026, so part of 2026 may still be exposed. Declaration is the corporation’s, due March 31, 2027.',
		eht: 'Watch. Tenancy started August 1. The City decides whether the year qualifies. Point the agent at the occupancy record.',
		notes: 'Local agent: Demo Property Desk. Form K signed August 2.'
	},
	'407': {
		occupancy: 'tenant',
		tenant: 'Joseph Okello',
		tenantSince: '2026-09-01',
		formK: 'missing',
		ownerLives: 'Kelowna',
		payMethod: 'E-transfer',
		notes: 'Owner’s nephew moved in September 1. Form K was due September 15 and has not arrived.'
	},
	'410': {
		role: 'Treasurer',
		payMethod: 'Bitcoin',
		extraParking: ['P42'],
		pets: 'None',
		notes:
			'Treasurer. September fee was the quarterly on-chain payment. The other months go by PAD. Rents stall P42 at $100. Hardware key 3 of the war chest. The watch-only xpub is what this app stores.'
	}
};

function emailFor(name: string): string {
	const slug = name
		.toLowerCase()
		.replace(/&/g, 'and')
		.replace(/[^a-z0-9]+/g, '.')
		.replace(/^\.|\.$/g, '');
	return `${slug}@owners.demo.invalid`;
}

function buildUnits(): Unit[] {
	const list: Unit[] = [];
	let lot = 0;
	for (const floor of [1, 2, 3, 4]) {
		const tmpl = floor === 4 ? upper : lower;
		for (const plan of tmpl) {
			lot += 1;
			const id = `${floor}${plan.suffix}`;
			const story = stories[id] ?? {};
			const occupancy = story.occupancy ?? 'owner';
			const formK: FormK =
				story.formK ??
				(occupancy === 'owner' || occupancy === 'vacant'
					? 'n/a'
					: occupancy === 'short-term'
						? 'missing'
						: 'signed');
			const stall = `P${String(lot).padStart(2, '0')}`;
			list.push({
				id,
				floor,
				lot,
				type: plan.type,
				sqft: plan.sqft,
				beds: plan.beds,
				baths: plan.baths,
				entitlement: plan.entitlement,
				owner: names[lot - 1] ?? 'Owner',
				ownerKind: story.ownerKind ?? 'individual',
				ownerLives: story.ownerLives ?? 'Vancouver',
				occupancy,
				tenant: story.tenant ?? null,
				tenantSince: story.tenantSince ?? null,
				formK,
				ev: story.ev ?? false,
				parking: [stall, ...(story.extraParking ?? [])],
				locker: `L${String(lot).padStart(2, '0')}`,
				pets: story.pets ?? 'None on file',
				feeArrearsMonths: story.feeArrearsMonths ?? 0,
				levyOwing: story.levyOwing ?? 0,
				lateOwing: story.lateOwing ?? 0,
				fineOwing: story.fineOwing ?? 0,
				prepaidOctober: story.prepaidOctober ?? false,
				payMethod: story.payMethod ?? 'PAD',
				eht: story.eht ?? EHT_OK,
				svt: story.svt ?? SVT_OK,
				uht: story.uht ?? UHT_OK,
				role: story.role ?? null,
				phone: `604-555-${String(100 + lot).padStart(4, '0')}`,
				email: emailFor(names[lot - 1] ?? 'owner'),
				notes: story.notes ?? 'Fees current. No open compliance item.'
			});
		}
	}
	return list;
}

export const units: Unit[] = buildUnits();

export const building = {
	name: 'Evergreen House',
	legalName: 'The Owners, Strata Plan LMS 2847',
	plan: 'LMS 2847',
	address: '4100 Cambie Street',
	city: 'Vancouver',
	province: 'BC',
	postal: 'V5Z 2Y1',
	yearBuilt: 1998,
	construction: 'Four-storey wood frame, one elevator, one level of parkade',
	lots: 40,
	floors: 4,
	asOf: '2026-09-30',
	asOfLabel: 'September 30, 2026',
	fiscalStart: '2026-04-01',
	fiscalEnd: '2027-03-31',
	fiscalLabel: 'April 1, 2026 – March 31, 2027',
	priorFiscalLabel: 'April 1, 2025 – March 31, 2026',
	management: 'Self-managed. No brokerage contract.',
	caretaker: 'Bill Hargreaves, contractor, $3,000 a month, WCB certificate on file, contract to March 31, 2027',
	concierge: 'Samira El-Masri, employee since September 1, 2026, 10 hours a week at the evening desk',
	accountant: 'North Shore Tax Co-op (demo) — compilation, T2, and T1044',
	lawyer: 'False Creek Law (demo) — lien file for lot 207 and the levy trust',
	cra: {
		bn: '847362915',
		rc: '847362915 RC0001',
		rp: '847362915 RP0001',
		rt: 'No GST account',
		yearEnd: 'March 31',
		claim: 'Non-profit exemption under Income Tax Act s.149(1)(l)'
	},
	banks: {
		operating: {
			institution: 'Coastal Community Credit Union (demo)',
			account: '1002847',
			name: 'LMS 2847 Operating'
		},
		crf: {
			institution: 'Coastal Community Credit Union (demo)',
			account: '1002848',
			name: 'LMS 2847 Contingency Reserve'
		},
		levy: {
			institution: 'Coastal Community Credit Union (demo)',
			account: '1002849',
			name: 'LMS 2847 Levy — Parkade Membrane'
		}
	},
	payTo: {
		etransfer: 'fees@lms2847.invalid',
		bitcoin: 'bc1q-demo-lms2847-do-not-send',
		lightning: 'lnbc1demo-lms2847-do-not-pay',
		bolt12: 'lno1demo-lms2847-monthly-do-not-pay'
	},
	insurance: {
		broker: 'Harbour Insurance Brokers (demo)',
		policy: 'HH-2847-26',
		term: 'April 1, 2026 – March 31, 2027',
		premiumCents: 4_860_000,
		waterDeductibleCents: 2_500_000,
		quakeDeductible: '10% of the insured value, minimum $100,000',
		appraisal: 'Booked October 22, 2026, before the broker markets the April 2027 renewal'
	},
	amenities: ['Roof deck', 'Bike room (20 racks)', 'Workshop bay', 'Enterphone', 'Recycling room', '8 EV-ready stalls, 4 chargers installed'],
	visitors: '4 visitor stalls, V1–V4, 2-hour limit overnight with a pass from the caretaker'
} as const;

export const bylaws = [
	{ name: 'Fees', rule: 'Due on the 1st, including weekends. A $50 late fee attaches on the 5th if the lot is still short.' },
	{ name: 'Rentals', rule: 'Long-term rentals are allowed. Form K is due within two weeks. Stays under 30 days are banned. Fine is $200 a day.' },
	{ name: 'Pets', rule: 'Two pets. Leash or carry in the lobby and the elevator.' },
	{ name: 'Smoking', rule: 'No smoking or vaping on common property or balconies.' },
	{ name: 'Moves', rule: '$200, booked with the caretaker, never on a Sunday or a statutory holiday.' },
	{ name: 'Quiet hours', rule: '10:00 pm to 7:00 am.' },
	{ name: 'Insurance', rule: 'The strata insures the building and common property. Each owner insures contents, liability, and their own improvements.' }
] as const;

export const depreciation = {
	firm: 'RJC Engineers (demo)',
	dated: 'June 12, 2024',
	nextDue: 'June 12, 2029',
	recommendedAnnualCents: 4_800_000,
	fundedAnnualCents: 4_320_000,
	projects: [
		{ year: '2025–26', item: 'Parkade membrane', cents: 21_600_000, status: 'Special levy in progress' },
		{ year: '2028', item: 'Boiler and hot water', cents: 6_500_000, status: 'In the 30-year plan' },
		{ year: '2029', item: 'Elevator modernization', cents: 21_000_000, status: 'Scoping study paid from the CRF this year' },
		{ year: '2030', item: 'Envelope reseal', cents: 19_000_000, status: 'In the 30-year plan' },
		{ year: '2031', item: 'Roof replacement', cents: 48_000_000, status: 'In the 30-year plan' }
	]
} as const;

export const councilSeats = [
	{ role: 'President', unitId: '308', since: 'May 2024', duty: 'Chairs meetings. Hardware key 1.' },
	{ role: 'Vice-president', unitId: '102', since: 'May 2024', duty: 'Steps in for the chair. Hardware key 2.' },
	{ role: 'Treasurer', unitId: '410', since: 'May 2025', duty: 'Books, Form F balances, war-chest watch. Hardware key 3.' },
	{ role: 'Secretary', unitId: '205', since: 'May 2025', duty: 'Notices, minutes, Form B and Form K chase list.' },
	{ role: 'Member at large', unitId: '403', since: 'May 2026', duty: 'Bylaw hearings. Leaves the room for her own levy.' }
] as const;

export function monthlyFeeCents(entitlement: number): number {
	return entitlement * FEE_POINT_CENTS;
}

export function crfPortionCents(entitlement: number): number {
	return entitlement * CRF_POINT_CENTS;
}

export function operatingPortionCents(entitlement: number): number {
	return entitlement * OP_POINT_CENTS;
}

export function isUnitId(id: string): boolean {
	return units.some((unit) => unit.id === id);
}

export function getUnit(id: string): Unit {
	return units.find((unit) => unit.id === id) ?? units.find((unit) => unit.id === '305')!;
}

export function payReference(unitId: string, period = '202610'): string {
	return `LMS2847-${unitId}-${period}`;
}

export interface Balance {
	fee: number;
	october: number;
	arrears: number;
	late: number;
	fine: number;
	levy: number;
	total: number;
	crfPart: number;
	operatingPart: number;
}

/** What the pay desk asks for on September 30: clear the past, and pay October before it is late. */
export function balance(unit: Unit): Balance {
	const fee = monthlyFeeCents(unit.entitlement);
	const october = unit.prepaidOctober ? 0 : fee;
	const arrears = fee * unit.feeArrearsMonths;
	return {
		fee,
		october,
		arrears,
		late: unit.lateOwing,
		fine: unit.fineOwing,
		levy: unit.levyOwing,
		total: october + arrears + unit.lateOwing + unit.fineOwing + unit.levyOwing,
		crfPart: crfPortionCents(unit.entitlement),
		operatingPart: operatingPortionCents(unit.entitlement)
	};
}

export function formF(unit: Unit): 'clear' | 'withheld' {
	if (unit.feeArrearsMonths > 0 || unit.lateOwing > 0 || unit.fineOwing > 0 || unit.levyOwing > 0) return 'withheld';
	return 'clear';
}

export function tone(unit: Unit): Tone {
	if (unit.feeArrearsMonths > 0 || unit.lateOwing > 0) return 'arrears';
	if (unit.occupancy === 'short-term') return 'short-term';
	if (unit.formK === 'missing') return 'formk';
	if (unit.levyOwing > 0) return 'levy';
	if (unit.occupancy === 'vacant') return 'vacant';
	if (unit.occupancy === 'tenant') return 'tenant';
	return 'owner';
}

export const toneStyles: Record<Tone, { label: string; cell: string; pill: string }> = {
	arrears: {
		label: 'Fees behind',
		cell: 'bg-rose-50 text-rose-950 border-rose-300',
		pill: 'bg-rose-100 text-rose-800'
	},
	formk: {
		label: 'Form K missing',
		cell: 'bg-amber-50 text-amber-950 border-amber-300',
		pill: 'bg-amber-100 text-amber-900'
	},
	'short-term': {
		label: 'Short-term rental',
		cell: 'bg-fuchsia-50 text-fuchsia-950 border-fuchsia-300',
		pill: 'bg-fuchsia-100 text-fuchsia-900'
	},
	levy: {
		label: 'Levy balance',
		cell: 'bg-orange-50 text-orange-950 border-orange-300',
		pill: 'bg-orange-100 text-orange-900'
	},
	vacant: {
		label: 'Vacant',
		cell: 'bg-slate-100 text-slate-800 border-slate-300',
		pill: 'bg-slate-200 text-slate-700'
	},
	tenant: {
		label: 'Tenanted',
		cell: 'bg-sky-50 text-sky-950 border-sky-200',
		pill: 'bg-sky-100 text-sky-900'
	},
	owner: {
		label: 'Owner lives here',
		cell: 'bg-emerald-50 text-emerald-950 border-emerald-200',
		pill: 'bg-emerald-100 text-emerald-900'
	}
};

export function haystack(unit: Unit): string {
	return [unit.id, unit.owner, unit.tenant, unit.type, unit.role, unit.notes, unit.payMethod]
		.filter(Boolean)
		.join(' ')
		.toLowerCase();
}

export const floorsDesc = [4, 3, 2, 1].map((floor) => ({
	floor,
	units: units.filter((unit) => unit.floor === floor)
}));

export function countWhere(pred: (unit: Unit) => boolean): number {
	return units.filter(pred).length;
}

export const headcount = {
	lots: units.length,
	entitlement: units.reduce((sum, unit) => sum + unit.entitlement, 0),
	sqft: units.reduce((sum, unit) => sum + unit.sqft, 0),
	ownersLivingHere: countWhere((unit) => unit.occupancy === 'owner'),
	tenanted: countWhere((unit) => unit.occupancy === 'tenant'),
	vacant: countWhere((unit) => unit.occupancy === 'vacant'),
	shortTerm: countWhere((unit) => unit.occupancy === 'short-term'),
	formKMissing: countWhere((unit) => unit.formK === 'missing'),
	arrears: countWhere((unit) => unit.feeArrearsMonths > 0),
	formFWithheld: countWhere((unit) => formF(unit) === 'withheld'),
	ev: countWhere((unit) => unit.ev),
	prepaidOctober: countWhere((unit) => unit.prepaidOctober)
};

export const alerts = [
	{
		href: '/tax',
		tone: 'danger' as const,
		title: 'T2 and T1044 are due today',
		body: 'Both returns are for the year that ended March 31, 2026. The package is ready for council to release to the accountant before midnight.'
	},
	{
		href: '/pay',
		tone: 'warning' as const,
		title: 'October fees are due tomorrow',
		body: `${headcount.prepaidOctober} lots have already paid October. Everyone else owes their October fee on the 1st. Late fees attach on the 5th.`
	},
	{
		href: '/units?lot=207',
		tone: 'danger' as const,
		title: 'Form F withheld on lot 207',
		body: 'Ruth Adelakun owes three months of fees, late fees, and most of her parkade levy. A lien is the decision on the October 20 agenda.'
	},
	{
		href: '/units?lot=201',
		tone: 'warning' as const,
		title: 'Form B for lot 201 is due October 5',
		body: 'The lot is clear, so Form F can go out with it. Harbour Notary asked on September 28. The statute gives one week.'
	},
	{
		href: '/calendar',
		tone: 'info' as const,
		title: 'Fire inspection is Thursday, October 8',
		body: 'Coast Fire Protection, 9:00 am, meet in the lobby. The caretaker has the panel keys.'
	},
	{
		href: '/units?tone=formk',
		tone: 'warning' as const,
		title: `${headcount.formKMissing} Form Ks are missing`,
		body: 'Lots 209 and 407 have new tenants from September 1. Lot 309 is a short-term rental with no Form K at all.'
	}
];
