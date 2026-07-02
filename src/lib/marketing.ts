/** Facts, savings math, and competitive positioning for presentations */

export const pitchMeta = {
	version: '0.2.0',
	contact: 'hello@giveabit.io',
	github: 'https://github.com/kitsboy/openstrata',
	parent: 'https://giveabit.io',
	oneLiner:
		'BCFSA-aware strata operations software — cheaper, faster, and fewer errors than legacy management. Fiat rails today. Bitcoin sovereignty optional.'
} as const;

export const problemPoints = [
	'BCFSA requires licensed brokerages, Managing Brokers, and UBC Sauder certification',
	'Separate trust funds per corporation — co-mingling is illegal',
	'SPA mandates strict workflows: 14-day bylaw windows, 7-day Form B, quorum rules',
	'CRT resolves most disputes — evidence quality wins cases',
	'Credit cards cost strata 3%+ on fee collection ($9K+/year per 50-unit building)',
	'Managers spend hours on reconciliation, forms, and complaint tracking',
	'Legacy software is expensive, US-centric, and has zero Bitcoin/sovereignty path'
] as const;

export const revenueTiers = [
	{ tier: 'Self-hosted', price: 'Free', priceNote: 'open source', target: 'Developers, self-managed councils' },
	{ tier: 'Hermes Standard', price: '$4/unit/mo', priceNote: 'per unit', target: 'Licensed brokerages' },
	{ tier: 'Hermes Sovereign', price: '$6/unit + $49/bldg', priceNote: 'per month', target: '+ Lightning, Satohash proofs' },
	{ tier: 'Hermes Advanced', price: '+$99/bldg/mo', priceNote: 'add-on', target: 'Multisig, war chest, agent pay' }
] as const;

export const roadmapSnapshot = [
	{ phase: 1, timeline: 'Now', deliverable: 'Marketing site, compliance KB, Strata Tool hub', status: 'complete' as const },
	{ phase: 2, timeline: 'Q3 2026', deliverable: 'Building wizard, e-transfer auto-match', status: 'active' as const },
	{ phase: 3, timeline: 'Q4 2026', deliverable: 'Lightning Dual Pay, Satohash API', status: 'planned' as const },
	{ phase: 4, timeline: '2027', deliverable: 'War chest DCA, multisig PSBT, agent payments', status: 'planned' as const },
	{ phase: 5, timeline: '2028', deliverable: 'ON/AB/US expansion via config.yaml', status: 'planned' as const }
] as const;

export const bcfsaFacts = {
	regulator: 'BC Financial Services Authority (BCFSA)',
	act: 'Real Estate Services Act (RESA)',
	requirements: [
		'Register as licensed brokerage with BCFSA',
		'Hire a licensed Managing Broker to supervise all activities',
		'Every strata manager must hold valid BCFSA strata manager license',
		'Complete UBC Sauder Strata Management Licensing Course + exam',
		'Maintain separate trust funds per strata corporation',
		'Strict record-keeping per RESA and SPA',
		'Written strata management service agreement before commencing services'
	],
	selfManageException: 'Owners may self-manage their own strata without a license — but cannot provide management services to other corporations without full brokerage licensing.',
	refs: [
		'https://www.bcfsa.ca/industry-resources/real-estate-professional-resources/education-and-licensing/becoming-licensed/strata-management',
		'https://www.bcfsa.ca/industry-resources/real-estate-professional-resources/knowledge-base/strata-management-resources/working-with-strata-management-company'
	]
} as const;

export const hermesPositioning = {
	tagline: 'Software for licensed brokerages. Sovereignty for self-managed councils.',
	model: 'Technology platform — not an unlicensed management company',
	paths: [
		{
			id: 'brokerage',
			title: 'Licensed Brokerage Partner',
			desc: 'Hermes powers your BCFSA-compliant operations. Your Managing Broker supervises. We automate trust accounting, compliance, and payments.',
			legal: 'Fully compliant — software used by licensed entity'
		},
		{
			id: 'self-managed',
			title: 'Self-Managed Strata Council',
			desc: 'Owners managing their own building use Hermes directly. No brokerage license required when owners manage themselves.',
			legal: 'SPA-permitted self-management path'
		},
		{
			id: 'hybrid',
			title: 'Council + Licensed Oversight',
			desc: 'Council runs day-to-day in Hermes. Licensed manager provides brokerage oversight, Form B/F, and trust fund compliance.',
			legal: 'Best of both — efficiency + BCFSA compliance'
		}
	]
} as const;

export const costSavings = {
	scenario: { units: 50, monthlyFee: 500, buildings: 1 },
	paymentMethods: [
		{ method: 'Credit Card', rate: 0.03, fixed: 0.30, annualCost: 9000, label: '3% + $0.30/txn' },
		{ method: 'Manual E-Transfer', rate: 0, fixed: 0, annualCost: 2400, label: '~$200/mo manager labour' },
		{ method: 'Auto E-Transfer', rate: 0, fixed: 0, annualCost: 600, label: '~$50/mo reconciliation', recommended: true },
		{ method: 'Lightning (1%)', rate: 0.01, fixed: 0, annualCost: 3000, label: '~1% routing fee' },
		{ method: 'E-Transfer + Lightning', rate: 0.005, fixed: 0, annualCost: 1500, label: 'Blended 0.5%', recommended: true }
	],
	managerSavings: [
		{ task: 'Monthly fee reconciliation', traditional: '4 hrs', hermes: '15 min', saving: '94%', traditionalHrs: 4, hermesHrs: 0.25 },
		{ task: 'Form B generation', traditional: '2 hrs', hermes: '5 min', saving: '96%', traditionalHrs: 2, hermesHrs: 0.08 },
		{ task: 'Bylaw complaint tracking', traditional: '3 hrs', hermes: 'Auto workflow', saving: '100%', traditionalHrs: 3, hermesHrs: 0.05 },
		{ task: 'AGM quorum calculation', traditional: '1 hr', hermes: 'Real-time', saving: '100%', traditionalHrs: 1, hermesHrs: 0.02 },
		{ task: 'CRT evidence package', traditional: '8 hrs', hermes: '1-click export', saving: '88%', traditionalHrs: 8, hermesHrs: 1 }
	],
	annualFeeFlow: 300000 // 50 units × $500 × 12
} as const;

export const competitiveAdvantages = [
	{ metric: '94%', label: 'Less reconciliation time', vs: 'Manual spreadsheets' },
	{ metric: '$9K+', label: 'Annual card fee savings', vs: 'Per 50-unit building' },
	{ metric: '14-day', label: 'Bylaw lock enforced', vs: 'CRT overturn prevention' },
	{ metric: '7-day', label: 'Form B auto-deadline', vs: 'Statutory compliance' },
	{ metric: '0%', label: 'Bitcoin custody', vs: 'Keys stay external' },
	{ metric: '60 sec', label: 'Satohash proof stamp', vs: 'Court-ready timestamps' }
] as const;

export const productStack = [
	{ name: 'Hermes Strata', role: 'Operations', desc: 'Fees, compliance, governance, treasury, building templates' },
	{ name: 'Satohash', role: 'Proof', desc: 'OpenTimestamps on payments, votes, rules, leases — Bitcoin-anchored' },
	{ name: 'OpenStrata', role: 'Portability', desc: 'Nostr identity, sovereign data across platforms' }
] as const;

export const warChest = {
	allocPct: '1–2%',
	source: 'Annual operating budget or CRF line item',
	custody: '3-of-5 multisig — council hardware wallets',
	purpose: 'Weather fiat inflation without emergency special levy',
	disclosure: 'Form B includes war chest balance'
} as const;