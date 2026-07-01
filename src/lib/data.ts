export const jurisdictions = [
	{ code: 'BC', name: 'British Columbia', flag: '🇨🇦', active: true, laws: ['SPA', 'RTA', 'EPR 2026'] },
	{ code: 'ON', name: 'Ontario', flag: '🇨🇦', active: false, laws: ['Condo Act'] },
	{ code: 'AB', name: 'Alberta', flag: '🇨🇦', active: false, laws: ['Condo Act'] },
	{ code: 'US-WA', name: 'Washington', flag: '🇺🇸', active: false, laws: ['RCW 64.34'] },
	{ code: 'EU', name: 'European Union', flag: '🇪🇺', active: false, laws: ['Multi-lang'] }
] as const;

export const currencies = [
	{ code: 'CAD', symbol: '$', name: 'Canadian Dollar', primary: true },
	{ code: 'BTC', symbol: '₿', name: 'Bitcoin', primary: false },
	{ code: 'USD', symbol: '$', name: 'US Dollar', primary: false },
	{ code: 'EUR', symbol: '€', name: 'Euro', primary: false }
] as const;

export const jobCategories = [
	{
		id: 'engineering',
		label: 'Engineering',
		jobs: [
			{ title: 'Senior Full-Stack Developer', location: 'Vancouver, BC · Remote', type: 'Full-time', salary: '$120k–$160k CAD' },
			{ title: 'Bitcoin/Lightning Protocol Engineer', location: 'Remote · Global', type: 'Full-time', salary: '$140k–$180k CAD' },
			{ title: 'PWA/Mobile Developer (SvelteKit)', location: 'Vancouver, BC', type: 'Contract', salary: '$90–$120/hr' },
			{ title: 'DevOps — Docker/Tailscale/Umbrel', location: 'Remote', type: 'Part-time', salary: '$80–$100/hr' }
		]
	},
	{
		id: 'compliance',
		label: 'Compliance & Legal',
		jobs: [
			{ title: 'BC Strata Manager (Licensed)', location: 'Metro Vancouver', type: 'Full-time', salary: '$75k–$95k CAD' },
			{ title: 'Rosa RAG Corpus Specialist', location: 'Remote · BC', type: 'Contract', salary: '$70–$90/hr' },
			{ title: 'CRT/SPA Compliance Analyst', location: 'Victoria, BC', type: 'Full-time', salary: '$65k–$85k CAD' }
		]
	},
	{
		id: 'treasury',
		label: 'Treasury & Finance',
		jobs: [
			{ title: 'Ziggy Treasury Coordinator', location: 'Remote', type: 'Full-time', salary: '$85k–$110k CAD' },
			{ title: 'Multisig Operations Specialist', location: 'Vancouver, BC', type: 'Full-time', salary: '$90k–$115k CAD' },
			{ title: 'CRF Reserve Fund Accountant', location: 'Metro Vancouver', type: 'Part-time', salary: '$55–$75/hr' }
		]
	},
	{
		id: 'community',
		label: 'Community & Support',
		jobs: [
			{ title: 'Strata Council Educator', location: 'BC-wide · Travel', type: 'Contract', salary: '$60–$80/hr' },
			{ title: 'Resident Support — Bilingual (EN/FR)', location: 'Remote', type: 'Full-time', salary: '$50k–$65k CAD' },
			{ title: 'Give A Bit Community Ambassador', location: 'Canada-wide', type: 'Part-time', salary: 'Volunteer + BTC' }
		]
	}
] as const;

export const rssFeeds = [
	{ id: 'bc-housing', title: 'BC Housing & Strata Updates', source: 'BC Government', url: 'https://www2.gov.bc.ca/gov/content/housing-tenancy/strata-housing/rss', category: 'Regulation' },
	{ id: 'crt-decisions', title: 'CRT Strata Decisions', source: 'Civil Resolution Tribunal', url: 'https://decisions.civilresolutionbc.ca/rss', category: 'Legal' },
	{ id: 'metro-van-rental', title: 'Metro Vancouver Rental Market', source: 'CMHC', url: 'https://www.cmhc-schl.gc.ca/rss/rental-market', category: 'Market Data' },
	{ id: 'giveabit-blog', title: 'Give A Bit — Sovereign Finance', source: 'Give A Bit', url: 'https://giveabit.io/blog/rss.xml', category: 'Bitcoin' },
	{ id: 'bitcoin-news', title: 'Bitcoin Core & Protocol News', source: 'Bitcoin Optech', url: 'https://bitcoinops.org/en/newsletters/rss/', category: 'Bitcoin' },
	{ id: 'strata-twitter', title: 'BC Strata Twitter List', source: 'X/Twitter', url: 'https://twitter.com/i/lists/strata-bc', category: 'Social' }
] as const;

export const rssItems = [
	{ id: 1, feed: 'bc-housing', title: 'EPR 2026 Deadline: Metro Vancouver Strata Corporations Must Complete Energy Performance Reports', date: '2026-06-28', excerpt: 'All strata corporations in Metro Vancouver must file EPR reports by December 31, 2026. Non-compliance must be disclosed on Form B.' },
	{ id: 2, feed: 'crt-decisions', title: 'CRT-2026-1847: Owner Successfully Enforces EV Charger Installation Timeline', date: '2026-06-25', excerpt: 'Council must decide in writing within 3 months. Owner bears all installation costs per SPA s.124.' },
	{ id: 3, feed: 'metro-van-rental', title: 'Vancouver Vacancy Rate Drops to 0.9% — Rental Pressure Intensifies', date: '2026-06-20', excerpt: 'Average 1BR rent reaches $2,450/mo. Strata short-term rental bylaws under increased scrutiny.' },
	{ id: 4, feed: 'giveabit-blog', title: 'Hermes v2: Sovereign Strata Treasury on Bitcoin Rails', date: '2026-06-15', excerpt: '3-of-5 multisig PSBT workflow with LNURL CAD-pegged instant pay for strata fee collection.' },
	{ id: 5, feed: 'bitcoin-news', title: 'BOLT-12 Offers Now Supported in Major Lightning Implementations', date: '2026-06-10', excerpt: 'Reusable offers enable strata corporations to issue persistent Lightning invoices for monthly fees.' },
	{ id: 6, feed: 'strata-twitter', title: 'BC Strata Managers Association Annual Conference — September 2026', date: '2026-06-05', excerpt: 'Key topics: EPR compliance, Bitcoin treasury adoption, CRT enforcement trends.' }
] as const;

export const apiEndpoints = [
	{ method: 'GET', path: '/api/v1/strata/{id}', desc: 'Retrieve strata corporation profile, bylaws hash, and jurisdiction config' },
	{ method: 'GET', path: '/api/v1/units', desc: 'List all units with occupancy, EHT/SVT status, and Form K state' },
	{ method: 'POST', path: '/api/v1/invoices', desc: 'Submit invoice for Ziggy parsing, CRF cap check, and PSBT generation' },
	{ method: 'GET', path: '/api/v1/treasury/balance', desc: 'Real-time CAD ledger + BTC multisig balance with CRF 10% allocation' },
	{ method: 'POST', path: '/api/v1/payments/lightning', desc: 'Generate LNURL invoice with 15-min CAD rate lock for strata fees' },
	{ method: 'GET', path: '/api/v1/compliance/epr', desc: 'EPR 2026 progress, kW capacity, EV charger load-share analysis' },
	{ method: 'GET', path: '/api/v1/rosa/query', desc: 'Strict RAG query against BC SPA/RTA/CRT corpus with source citations' },
	{ method: 'GET', path: '/api/v1/feeds/rss', desc: 'Aggregated RSS feed output — BC housing, CRT, market data, Bitcoin news' },
	{ method: 'GET', path: '/api/v1/market/rates', desc: 'Live BTC/CAD, vacancy rates, rental indices for configured jurisdiction' },
	{ method: 'POST', path: '/api/v1/webhooks/email', desc: 'Inbound email webhook for document ingestion pipeline' },
	{ method: 'POST', path: '/api/v1/compliance/complaints', desc: 'Initiate bylaw enforcement workflow — Day 1 written complaint with evidence' },
	{ method: 'GET', path: '/api/v1/compliance/complaints/{id}/status', desc: 'Workflow state — BLOCK_FINE_ACTIONS lock until 14-day window elapses' },
	{ method: 'POST', path: '/api/v1/conveyancing/form-f', desc: 'Form F Certificate of Payment — WITHHELD if unit balance > $0' },
	{ method: 'POST', path: '/api/v1/conveyancing/form-b', desc: 'Form B Information Certificate — 7-day statutory delivery deadline' },
	{ method: 'POST', path: '/api/v1/meetings/quorum-check', desc: 'Calculate quorum per SPA s.48 — AGM 1/3 voters, Council majority' },
	{ method: 'POST', path: '/api/v1/meetings/vote', desc: 'Voting engine — majority/3-4/80%/unanimous with abstention exclusion' },
	{ method: 'POST', path: '/api/v1/compliance/crt-export', desc: 'Generate unalterable PDF evidence package for CRT filing' },
	{ method: 'GET', path: '/api/v1/records/retention', desc: 'SPA s.35 retention schedule — flags documents approaching expiry' }
] as const;

export const units = [
	{ id: '101', floor: 1, sqft: 780, status: 'occupied', tenant: 'M. Chen', rent: 2450, eht: true, formK: 'signed', evCharger: false },
	{ id: '102', floor: 1, sqft: 820, status: 'occupied', tenant: 'J. Williams', rent: 2580, eht: true, formK: 'signed', evCharger: true },
	{ id: '201', floor: 2, sqft: 950, status: 'vacant', tenant: null, rent: 2890, eht: false, formK: 'missing', evCharger: false },
	{ id: '202', floor: 2, sqft: 1100, status: 'occupied', tenant: 'A. Patel', rent: 3100, eht: true, formK: 'signed', evCharger: false },
	{ id: '301', floor: 3, sqft: 1200, status: 'occupied', tenant: 'S. O\'Brien', rent: 3350, eht: true, formK: 'signed', evCharger: true },
	{ id: '302', floor: 3, sqft: 1450, status: 'short-term', tenant: 'Airbnb', rent: 4200, eht: true, formK: 'signed', evCharger: false }
] as const;

export const treasuryHistory = [
	{ month: 'Jan', income: 42000, expenses: 38500, crf: 4200 },
	{ month: 'Feb', income: 41800, expenses: 35200, crf: 4180 },
	{ month: 'Mar', income: 42100, expenses: 41000, crf: 4210 },
	{ month: 'Apr', income: 41900, expenses: 36800, crf: 4190 },
	{ month: 'May', income: 42200, expenses: 39500, crf: 4220 },
	{ month: 'Jun', income: 42450, expenses: 38100, crf: 4245 }
] as const;

export const rentalTrend = [
	{ month: 'Jan', avg: 2380, vacancy: 1.2 },
	{ month: 'Feb', avg: 2395, vacancy: 1.1 },
	{ month: 'Mar', avg: 2410, vacancy: 1.0 },
	{ month: 'Apr', avg: 2425, vacancy: 0.95 },
	{ month: 'May', avg: 2440, vacancy: 0.92 },
	{ month: 'Jun', avg: 2450, vacancy: 0.9 }
] as const;

export const faqItems = [
	{ category: 'Trust Accounting', q: 'Can operating and CRF funds be co-mingled?', a: 'No. SPA requires separate funds. Hermes enforces multi-account trust isolation — Operating, CRF, and Special Levy accounts are ledger-isolated.' },
	{ category: 'Conveyancing', q: 'What happens if a seller owes strata fees?', a: 'Form F shows balance due → WITHHELD state blocks the sale. Lawyer cannot proceed until arrears are cleared and Form F confirms $0.00.' },
	{ category: 'Bylaw Enforcement', q: 'How long before we can fine a bylaw violator?', a: 'Minimum 14 days after Notice of Complaint. System locks fine actions (BLOCK_FINE_ACTIONS) until the review window closes. CRT overturns early fines.' },
	{ category: 'Meetings', q: 'What if quorum is not met at an AGM?', a: '30-Minute Rule: if quorum not met within 30 min of start, meeting reschedules +7 days. At the delayed meeting, whoever shows up counts as quorum.' },
	{ category: 'Voting', q: 'Do abstentions count in vote calculations?', a: 'No. Majority and 3/4 votes use only yes/no from those present or by proxy. Abstentions are completely excluded. 80% votes use all eligible voters.' },
	{ category: 'Governance', q: 'Can we ban long-term rentals province-wide?', a: 'No — invalid province-wide. Short-term (Airbnb) bans are OK with fines up to $1,000/day.' },
	{ category: 'Governance', q: 'Are secret e-AGM ballots allowed?', a: 'No. Every voter must be verified for CRT-proof results.' },
	{ category: 'Infrastructure', q: 'Can we refuse an EV charger request?', a: 'No. Must decide in writing within 3 months. Owner pays all costs.' },
	{ category: 'Infrastructure', q: 'What if we miss the Dec 31 2026 EPR deadline?', a: 'No immediate fine, but must disclose on Form B — impacts mortgage and insurance. Owners can CRT-enforce.' },
	{ category: 'Bitcoin Rails', q: 'How does 3-of-5 multisig protect our treasury?', a: 'No single point of failure or theft. Requires 3 independent cryptographic keys to authorize any spend.' },
	{ category: 'Bitcoin Rails', q: 'How does invoice-payout matching work?', a: 'Ziggy cross-checks PO + invoice text. Side-by-side review required before any signature.' }
] as const;

export const donateInfo = {
	bitcoin: 'bc1qhermesstrata9giveabit7sovereign2treasury4multisig',
	lightning: 'lnurl1dp68gurn8ghj7um9wfcltv59uzn2umrwessxvcerwwd4x5tmw3h8',
	email: 'hello@giveabit.io'
} as const;