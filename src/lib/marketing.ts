/** Facts, savings math, and competitive positioning for presentations */

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
		{ method: 'Hermes Auto E-Transfer', rate: 0, fixed: 0, annualCost: 600, label: '~$50/mo reconciliation' },
		{ method: 'Lightning (1%)', rate: 0.01, fixed: 0, annualCost: 3000, label: '~1% routing fee' },
		{ method: 'Hermes + Lightning', rate: 0.005, fixed: 0, annualCost: 1500, label: 'Blended 0.5%' }
	],
	managerSavings: [
		{ task: 'Monthly fee reconciliation', traditional: '4 hrs', hermes: '15 min', saving: '94%' },
		{ task: 'Form B generation', traditional: '2 hrs', hermes: '5 min', saving: '96%' },
		{ task: 'Bylaw complaint tracking', traditional: '3 hrs', hermes: 'Auto workflow', saving: '100%' },
		{ task: 'AGM quorum calculation', traditional: '1 hr', hermes: 'Real-time', saving: '100%' },
		{ task: 'CRT evidence package', traditional: '8 hrs', hermes: '1-click export', saving: '88%' }
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