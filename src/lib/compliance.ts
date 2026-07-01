/**
 * BC Strata compliance knowledge base — SPA + BCFSA.
 * Source of truth for Hermes app architecture, workflows, and governance logic.
 * Retain and extend; Rosa RAG corpus should cite these statutory references.
 */

export const regulatoryFramework = {
	jurisdiction: 'BC',
	primaryActs: ['Strata Property Act (SPA)', 'Strata Property Regulation', 'BCFSA licensing'],
	regulator: 'BC Financial Services Authority (BCFSA)',
	disputeBody: 'Civil Resolution Tribunal (CRT)',
	agentRole: 'Licensed strata management company acts as agent for democratically elected Strata Council',
	contact: 'hello@giveabit.io'
} as const;

/** Five functional pillars — every Hermes module maps to one of these */
export const functionalDomains = [
	{
		id: 'financial',
		icon: '💰',
		title: 'Financial Management & Trust Accounting',
		summary: 'Separate funds that cannot be co-mingled. Multi-account trust isolation is mandatory.',
		funds: [
			{ name: 'Operating Fund', purpose: 'Daily/annual expenses — utilities, minor repairs, landscaping', dbKey: 'fund_operating' },
			{ name: 'Contingency Reserve Fund (CRF)', purpose: 'Long-term capital — roofing, elevators, major systems', dbKey: 'fund_crf', mandatoryPct: 10 },
			{ name: 'Special Levies', purpose: 'One-off accounts per voter-approved capital project', dbKey: 'fund_special_levy' },
			{ name: 'Accounts Receivable', purpose: 'Monthly strata fees, move-in/out fees, fines collection', dbKey: 'fund_ar' }
		],
		features: [
			'Automated billing and collection workflows',
			'Form B (Information Certificate) issuance — 7-day statutory deadline',
			'Form F (Certificate of Payment) — blocks conveyancing if balance due',
			'Ledger isolation per fund — no cross-fund transfers without resolution',
			'Ziggy CRF cap enforcement before any capital spend'
		],
		statutoryRefs: ['SPA s.92–96 (funds)', 'SPA s.256 (Form B)', 'SPA s.257 (Form F)']
	},
	{
		id: 'assets',
		icon: '🏗️',
		title: 'Physical Asset & Operational Maintenance',
		summary: 'Track common property vs strata lots, depreciation reports, and vendor compliance.',
		funds: [],
		features: [
			'Common Property vs Strata Lot boundary tracking',
			'Depreciation Report module — updated every 5 years, 30-year capital projection',
			'Link depreciation line items to CRF budget allocations',
			'Vendor/contract management with WCB insurance verification',
			'Preventative maintenance scheduling and work-order triggers',
			'EPR 2026 energy performance reporting (Metro Vancouver)'
		],
		statutoryRefs: ['SPA s.94 (depreciation reports)', 'SPA s.1 (definitions: common property, strata lot)']
	},
	{
		id: 'governance',
		icon: '⚖️',
		title: 'Governance, Compliance & Record Keeping',
		summary: 'Bylaw enforcement with CRT-proof timelines. SPA s.35 retention mandates.',
		funds: [],
		features: [
			'Bylaw enforcement state machine — complaint → notice → hearing → vote → fine',
			'14-day minimum response window — system must lock fine actions',
			'Fine caps: $200 standard infraction, $1,000 short-term rental/Airbnb',
			'Official document retention per SPA s.35 (6 years to permanent)',
			'CRT evidence export — unalterable PDF of notices, communications, ledger',
			'Form K occupant registry (SPA s.146)'
		],
		statutoryRefs: ['SPA s.35 (records)', 'SPA s.124–128 (bylaws/fines)', 'SPA s.146 (Form K)']
	},
	{
		id: 'meetings',
		icon: '🗳️',
		title: 'Meeting Logistics',
		summary: 'AGMs, SGMs, Council meetings — quorum hardcoded, hybrid/electronic voting supported.',
		funds: [],
		features: [
			'AGM/SGM/Council meeting scheduling and notifications',
			'Proxy tracking and token-based digital voting',
			'Hybrid and fully electronic meetings (permanent SPA amendments)',
			'Quorum calculator with 30-minute delay reschedule trigger',
			'Voting engine: majority, 3/4, 80%, unanimous — abstentions excluded',
			'Council president tie-breaker vote (Standard Bylaws)'
		],
		statutoryRefs: ['SPA s.19', 'SPA s.48 (quorum)', 'SPA s.49–51 (voting)']
	},
	{
		id: 'conveyancing',
		icon: '📄',
		title: 'Real Estate Transactions',
		summary: 'Forms B & F for conveyancing — lawyer requests block sales when balances are due.',
		funds: [],
		features: [
			'Form F: Certificate of Payment — $0.00 balance required',
			'Form B: fees, arrears, pending CRT/court cases, CRF balance summary',
			'Withheld state until arrears cleared',
			'7-day delivery deadline from request date',
			'EPR non-compliance disclosure on Form B'
		],
		statutoryRefs: ['SPA s.256 (Form B)', 'SPA s.257 (Form F)', 'SPA s.258 (timing)']
	}
] as const;

/** Bylaw enforcement — exact statutory order; CRT will overturn if skipped */
export const bylawEnforcementWorkflow = [
	{
		step: 1,
		day: 'Day 1',
		title: 'Receive Written Complaint',
		action: 'Owner submits complaint. System logs against target unit. Evidence required (photo, audio, log).',
		systemLock: null,
		crtRisk: 'Complaint without written record is inadmissible'
	},
	{
		step: 2,
		day: 'Day 2–5',
		title: 'Issue Notice of Complaint',
		action: 'Auto-generate formal warning to owner (and tenant if applicable). Minimum 14 days to respond in writing or request hearing.',
		systemLock: null,
		crtRisk: 'Notice must specify bylaw breached and response deadline'
	},
	{
		step: 3,
		day: 'Minimum 14 days',
		title: 'Review Window',
		action: 'System locks fine-imposition actions. Monitor for written response upload or Council Hearing request.',
		systemLock: 'BLOCK_FINE_ACTIONS',
		crtRisk: 'Fining before 14-day window = automatic CRT overturn'
	},
	{
		step: 4,
		day: 'Next Council Meeting',
		title: 'Council Decision & Minutes',
		action: 'Council reviews response. Vote on breach. Decision to fine must be recorded explicitly in meeting minutes.',
		systemLock: 'REQUIRE_QUORUM + REQUIRE_MINUTES',
		crtRisk: 'Fine without council vote in minutes is void'
	},
	{
		step: 5,
		day: 'Post-Meeting',
		title: 'Issue Notice of Fine',
		action: 'If approved: add fine to unit ledger ($200 max standard, $1,000 STR/Airbnb). Issue official Fine Notice.',
		systemLock: null,
		crtRisk: 'Fine amount exceeding statutory cap is unenforceable'
	}
] as const;

/** Forms B & F conveyancing workflow */
export const conveyancingWorkflow = [
	{
		step: 1,
		form: 'Form F',
		title: 'Certificate of Payment',
		action: 'Lawyer requests Form F. App checks unit ledger. If balance > $0, flag WITHHELD state. Sale blocked until cleared.',
		deadline: null,
		blocking: true
	},
	{
		step: 2,
		form: 'Form B',
		title: 'Information Certificate',
		action: 'Comprehensive summary: current strata fees, arrears, pending CRT/court cases, CRF balance, EPR disclosure if applicable.',
		deadline: '7 days from request (statutory)',
		blocking: false
	},
	{
		step: 3,
		form: null,
		title: 'Clear & Release',
		action: 'Once arrears paid and Form F shows $0.00, release withheld state. Lawyer proceeds with conveyancing.',
		deadline: null,
		blocking: false
	}
] as const;

/** Quorum rules — hardcode in meeting module */
export const quorumRules = [
	{
		meetingType: 'AGM / SGM',
		requirement: '1/3 of eligible voters (in person or proxy)',
		formula: 'Math.ceil(eligibleVoters / 3)',
		conditions: 'Voters must be in good standing — no registered lien / Form G for unpaid fees',
		delayRule: '30-Minute Rule: if quorum not met within 30 min of start, reschedule +7 days. At delayed meeting, whoever shows up = quorum.',
		spaRef: 'SPA s.48, s.19'
	},
	{
		meetingType: 'Council Meeting',
		requirement: 'Majority of council members',
		formula: '5 members → quorum 3; 7 members → quorum 4',
		conditions: 'No official business or voting if quorum not met',
		delayRule: null,
		spaRef: 'SPA s.48'
	}
] as const;

/** Voting thresholds — abstentions always excluded from calculation */
export const votingThresholds = [
	{
		name: 'Majority Vote',
		threshold: '>50%',
		denominator: 'Votes cast (yes + no only) by those present or proxy',
		abstentions: 'Ignored',
		usedFor: ['Annual operating budget', 'Electing council', 'Passing rules'],
		formula: 'yes / (yes + no) > 0.5'
	},
	{
		name: '3/4 Vote',
		threshold: '≥75%',
		denominator: 'Yes + no votes by those present or proxy',
		abstentions: 'Ignored',
		usedFor: ['Changing bylaws', 'CRF spending', 'Special levies', 'Changing common property use'],
		formula: 'yes / (yes + no) >= 0.75'
	},
	{
		name: '80% Vote',
		threshold: '≥80%',
		denominator: 'All eligible voters in entire building — present or not',
		abstentions: 'N/A — non-voters count against',
		usedFor: ['Winding up (dissolving) strata corporation', 'Selling entire property to developer'],
		formula: 'yes / totalEligibleVoters >= 0.80'
	},
	{
		name: 'Unanimous Vote',
		threshold: '100%',
		denominator: 'All eligible voters in building',
		abstentions: 'N/A',
		usedFor: ['Rare statutory requirements — check Rosa RAG per resolution type'],
		formula: 'yes === totalEligibleVoters'
	}
] as const;

export const tieBreakerRule = {
	description: 'If Council Meeting vote ties, Council President casts deciding second vote',
	exception: 'Does not apply if strata has only 2 units',
	source: 'BC Standard Bylaws'
} as const;

/** SPA s.35 record retention — permanent knowledge for Rosa + archive module */
export const recordRetention = [
	{ document: 'Registered bylaws', retention: 'Permanent', spaRef: 'SPA s.35(2)(a)' },
	{ document: 'Rules', retention: 'Permanent', spaRef: 'SPA s.35(2)(b)' },
	{ document: 'Meeting minutes (AGM, SGM, Council)', retention: 'Permanent', spaRef: 'SPA s.35(2)(c)' },
	{ document: 'Correspondence sent/received by council', retention: '2 years', spaRef: 'SPA s.35(2)(d)' },
	{ document: 'Financial records & statements', retention: '6 years', spaRef: 'SPA s.35(2)(e)' },
	{ document: 'Income tax records', retention: '6 years', spaRef: 'SPA s.35(2)(f)' },
	{ document: 'Contracts involving strata corp', retention: '6 years after expiry', spaRef: 'SPA s.35(2)(g)' },
	{ document: 'Engineering / depreciation reports', retention: 'Permanent', spaRef: 'SPA s.35(2)(h)' },
	{ document: 'Owner lists & Form K records', retention: 'Permanent', spaRef: 'SPA s.35(2)(i)' },
	{ document: 'Legal opinions', retention: 'Permanent', spaRef: 'SPA s.35(2)(j)' }
] as const;

/** Decouple regional terminology for Canada → US expansion */
export const localizationMap = [
	{ bc: 'Strata Corporation', us: 'HOA / Condo Association', dbElement: 'Entity_Master' },
	{ bc: 'Strata Lot', us: 'Unit / Condo / Parcel', dbElement: 'Property_ID' },
	{ bc: 'Common Property', us: 'Common Elements / Common Areas', dbElement: 'Asset_Shared' },
	{ bc: 'Strata Council', us: 'Board of Directors / HOA Board', dbElement: 'Governance_Board' },
	{ bc: 'Bylaws & Rules', us: 'CC&Rs (Covenants, Conditions & Restrictions)', dbElement: 'Compliance_Rules' },
	{ bc: 'Contingency Reserve Fund (CRF)', us: 'Reserve Fund', dbElement: 'Long_Term_Asset_Account' },
	{ bc: 'Form B / Form F', us: 'Estoppel / Resale Certificate', dbElement: 'Real_Estate_Closing_Doc' },
	{ bc: 'Civil Resolution Tribunal (CRT)', us: 'Small claims / arbitration (varies by state)', dbElement: 'Dispute_Forum' },
	{ bc: 'BCFSA licensed agent', us: 'Community association manager (CAM) license', dbElement: 'Agent_License' }
] as const;

/** Architecture mandates from compliance review */
export const architectureMandates = [
	{
		id: 'trust-isolation',
		title: 'Multi-Account Trust Isolation',
		desc: 'Ledger must enforce fund segregation. Operating, CRF, and Special Levy accounts cannot co-mingle. US states (FL, CA) have similar reserve segregation — design once, config per jurisdiction.'
	},
	{
		id: 'hybrid-meetings',
		title: 'Hybrid & Electronic Meetings',
		desc: 'BC permanently amended SPA for fully electronic or hybrid AGMs/SGMs. Token-based digital voting, proxy tracking, real-time attendance.'
	},
	{
		id: 'crt-export',
		title: 'CRT Evidence Export Package',
		desc: 'Bylaw module must export unalterable PDF history: notices, text communications, ledger balances. This is the legal evidence package for CRT filings.'
	},
	{
		id: 'workflow-locks',
		title: 'Statutory Workflow Locks',
		desc: 'Backend enforces exact timelines (14-day bylaw window, 7-day Form B, 30-min quorum delay). Rosa flags any manual override attempt.'
	},
	{
		id: 'i18n-layer',
		title: 'Localization Engine Day One',
		desc: 'Database uses neutral keys (Entity_Master, Property_ID). UI layer maps BC/US/EU terminology via config.yaml — never hardcode regional labels in schema.'
	}
] as const;

/** Hermes module → functional domain mapping */
export const moduleDomainMap = [
	{ module: 'Form K Hub', domain: 'governance', trigger: '14-day auto-reminder on missing Form K' },
	{ module: 'EPR 2026 Monitor', domain: 'assets', trigger: 'Breach alert → Form B disclosure flag' },
	{ module: 'Tax/Occupancy Matrix', domain: 'financial', trigger: 'EHT/SVT auto-flag from utility signatures' },
	{ module: 'Dual Pay Treasury', domain: 'financial', trigger: 'CRF 10% block on capital invoice' },
	{ module: 'Bylaw Enforcement Engine', domain: 'governance', trigger: 'BLOCK_FINE_ACTIONS until day 14' },
	{ module: 'Forms B/F Generator', domain: 'conveyancing', trigger: 'WITHHELD on arrears > $0' },
	{ module: 'Meeting & Voting', domain: 'meetings', trigger: 'Reschedule +7d on quorum fail at 30 min' },
	{ module: 'Depreciation Tracker', domain: 'assets', trigger: '5-year renewal reminder' },
	{ module: 'CRT Export', domain: 'governance', trigger: 'On-demand PDF evidence package' }
] as const;