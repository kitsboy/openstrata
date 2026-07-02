/**
 * Hermes Strata Tool — full module map covering licensed management company operations.
 * Maps to BCFSA brokerage requirements + SPA compliance.
 */

export type ToolStatus = 'live' | 'beta' | 'planned';

export interface StrataToolModule {
	id: string;
	domain: string;
	icon: string;
	title: string;
	desc: string;
	bcfsaRelevant: boolean;
	spaRef?: string;
	status: ToolStatus;
	features: string[];
	savings?: string;
	href?: string;
}

export const toolDomains = [
	{ id: 'financial', label: 'Financial & Trust', icon: '💰', color: 'brand' },
	{ id: 'assets', label: 'Assets & Maintenance', icon: '🏗️', color: 'bc-green' },
	{ id: 'governance', label: 'Governance & Compliance', icon: '⚖️', color: 'bc-blue' },
	{ id: 'meetings', label: 'Meetings & Voting', icon: '🗳️', color: 'purple' },
	{ id: 'conveyancing', label: 'Real Estate & Forms', icon: '📄', color: 'amber' },
	{ id: 'people', label: 'People & Units', icon: '👥', color: 'teal' },
	{ id: 'sovereign', label: 'Sovereign & Proof', icon: '₿', color: 'bitcoin' }
] as const;

export const strataToolModules: StrataToolModule[] = [
	// Financial & Trust
	{ id: 'trust-ledger', domain: 'financial', icon: '🏦', title: 'Multi-Account Trust Ledger', desc: 'Isolated Operating, CRF, Special Levy accounts per BCFSA trust rules', bcfsaRelevant: true, spaRef: 'SPA s.92–96', status: 'live', features: ['Fund isolation', 'No co-mingling', 'Auto CRF 10%', 'Audit trail'], savings: 'Eliminates trust fund violations' },
	{ id: 'fee-billing', domain: 'financial', icon: '📨', title: 'Automated Fee Billing', desc: 'Monthly strata fees, move-in/out, fines — auto-generate and track AR', bcfsaRelevant: true, status: 'live', features: ['Per-unit schedules', 'Late notices', 'Lien tracking', 'Form G prep'], savings: '4 hrs → 15 min/month' },
	{ id: 'etransfer', domain: 'financial', icon: '💸', title: 'E-Transfer Reconciliation', desc: 'Auto-match payments to units via reference codes', bcfsaRelevant: true, status: 'live', features: ['Reference codes', 'Proof upload', 'Auto-ledger', 'Bank feed ready'], savings: '$2,400/yr labour' },
	{ id: 'lightning-pay', domain: 'financial', icon: '⚡', title: 'Lightning Instant Pay', desc: 'LNURL QR with 15-min CAD rate lock for strata fees', bcfsaRelevant: false, status: 'beta', features: ['BOLT-12 offers', 'Recurring invoices', 'Satohash stamp', 'No custody'], savings: 'vs 3% credit cards' },
	{ id: 'invoice-psbt', domain: 'financial', icon: '🔐', title: 'Invoice → PSBT Workflow', desc: 'Ziggy parses invoices, CRF cap check, 3-of-5 multisig council approval', bcfsaRelevant: true, status: 'beta', features: ['CRF cap enforce', 'PO match', 'Matrix notify', 'Auto reconcile'], savings: 'Zero unauthorized spends' },
	{ id: 'war-chest', domain: 'financial', icon: '🛡️', title: 'BTC War Chest', desc: '1–2% annual DCA into multisig treasury hedge', bcfsaRelevant: false, status: 'planned', features: ['Council vote required', 'Watch-only', 'Form B disclosure', 'PSBT only'], savings: 'Inflation hedge' },
	{ id: 'sub-accounts', domain: 'financial', icon: '📊', title: 'Transparent Sub-Accounts', desc: 'Rolling Pool, Garden, Tax, Contingency — owner-visible ledgers', bcfsaRelevant: true, status: 'planned', features: ['Editable splits', 'Vote-gated', 'Real-time balance', 'Export'], savings: 'Trust through transparency' },

	// Assets
	{ id: 'common-property', domain: 'assets', icon: '🏢', title: 'Common Property Tracker', desc: 'Boundary map: common property vs strata lots', bcfsaRelevant: false, spaRef: 'SPA s.1', status: 'planned', features: ['Asset registry', 'Maintenance log', 'Insurance binders'], savings: '—' },
	{ id: 'depreciation', domain: 'assets', icon: '📉', title: 'Depreciation Report Hub', desc: '5-year renewal cycle, 30-year capital projection linked to CRF', bcfsaRelevant: false, spaRef: 'SPA s.94', status: 'beta', features: ['Renewal alerts', 'CRF linkage', 'Engineer credentials'], savings: 'Avoid Form B disclosure hits' },
	{ id: 'epr-monitor', domain: 'assets', icon: '⚡', title: 'EPR 2026 Monitor', desc: 'Metro Van energy performance reporting with kW and EV cap', bcfsaRelevant: false, status: 'live', features: ['Pro credentials', 'Progress ring', 'Breach alerts', 'Load-share'], savings: '—' },
	{ id: 'vendor-mgmt', domain: 'assets', icon: '🔧', title: 'Vendor & Contract Manager', desc: 'Service contracts, WCB insurance verification, PM scheduling', bcfsaRelevant: true, status: 'planned', features: ['WCB check', 'Contract expiry', 'Work orders', 'Insurance certs'], savings: 'Liability reduction' },

	// Governance
	{ id: 'bylaw-engine', domain: 'governance', icon: '⚖️', title: 'Bylaw Enforcement Engine', desc: '5-step CRT-proof workflow with 14-day BLOCK_FINE_ACTIONS lock', bcfsaRelevant: false, spaRef: 'SPA s.124–128', status: 'live', features: ['Written complaint', 'Auto notices', '14-day lock', 'Fine caps $200/$1K'], savings: 'CRT overturn prevention' },
	{ id: 'record-retention', domain: 'governance', icon: '📁', title: 'SPA s.35 Archive', desc: 'Retention schedule: 2 years to permanent — auto-flag expiry', bcfsaRelevant: true, spaRef: 'SPA s.35', status: 'beta', features: ['10 document types', 'Expiry alerts', 'Immutable log'], savings: 'BCFSA audit ready' },
	{ id: 'crt-export', domain: 'governance', icon: '📤', title: 'CRT Evidence Export', desc: 'One-click PDF: notices, communications, ledger balances', bcfsaRelevant: false, status: 'beta', features: ['Satohash proofs', 'Timeline', 'Unalterable'], savings: '8 hrs → 1 click' },
	{ id: 'rosa-rag', domain: 'governance', icon: '🧠', title: 'Rosa Compliance RAG', desc: 'Strict SPA/RTA/CRT corpus with source citations only', bcfsaRelevant: false, status: 'beta', features: ['BC law packs', 'Citation only', 'Risk flags', 'Auto-remind'], savings: 'Instant legal answers' },
	{ id: 'form-k', domain: 'governance', icon: '📋', title: 'Form K Hub', desc: 'Occupant registry, evacuation manifest, 14-day reminders', bcfsaRelevant: false, spaRef: 'SPA s.146', status: 'live', features: ['Signed/Missing', 'CSV export', 'Bylaw checkbox'], savings: '—' },

	// Meetings
	{ id: 'meeting-scheduler', domain: 'meetings', icon: '📅', title: 'Meeting Scheduler', desc: 'AGM, SGM, Council — notifications, agendas, hybrid support', bcfsaRelevant: false, spaRef: 'SPA s.48', status: 'planned', features: ['Hybrid/electronic', 'Proxy tracking', 'Token voting'], savings: '—' },
	{ id: 'quorum-calc', domain: 'meetings', icon: '🔢', title: 'Quorum Calculator', desc: 'AGM 1/3 voters, Council majority, 30-min reschedule rule', bcfsaRelevant: false, status: 'live', features: ['Good standing check', '30-min trigger', '+7 day reschedule'], savings: 'Invalid meeting prevention' },
	{ id: 'voting-engine', domain: 'meetings', icon: '✅', title: 'Voting Engine', desc: 'Majority, 3/4, 80%, unanimous — abstentions excluded', bcfsaRelevant: false, spaRef: 'SPA s.49–51', status: 'beta', features: ['4 threshold types', 'Tie-breaker rule', 'Satohash stamp'], savings: '—' },

	// Conveyancing
	{ id: 'form-f', domain: 'conveyancing', icon: '🟢', title: 'Form F Generator', desc: 'Certificate of Payment — WITHHELD if balance > $0', bcfsaRelevant: true, spaRef: 'SPA s.257', status: 'live', features: ['Ledger check', 'WITHHELD flag', 'Auto-release'], savings: '2 hrs → 5 min' },
	{ id: 'form-b', domain: 'conveyancing', icon: '📄', title: 'Form B Generator', desc: '7-day statutory deadline — fees, arrears, CRT, CRF, EPR', bcfsaRelevant: true, spaRef: 'SPA s.256', status: 'live', features: ['Deadline tracker', 'EPR disclosure', 'Pending cases'], savings: '2 hrs → 5 min' },

	// People
	{ id: 'unit-matrix', domain: 'people', icon: '🏠', title: 'Unit & Occupancy Matrix', desc: 'All suites with status, rent, EHT/SVT, Form K, EV charger', bcfsaRelevant: false, status: 'live', features: ['Add/remove units', 'Tenant link', 'Alert states'], savings: '—' },
	{ id: 'nostr-identity', domain: 'people', icon: '🔗', title: 'Nostr Unit Identity', desc: 'Attach npub to suite for payments, votes, Satohash proofs', bcfsaRelevant: false, status: 'planned', features: ['NIP-05', 'Lightning Address', 'Agent pay'], savings: '—' },
	{ id: 'building-template', domain: 'people', icon: '🏗️', title: 'Building Template Wizard', desc: 'Onboard new strata in 30 min — units, funds, services, rails, bylaws', bcfsaRelevant: true, status: 'live', features: ['BC template', '8-step wizard', 'JSON export', 'Custom sub-accounts', 'Service toggles'], savings: '30 days → 30 min', href: '/tools/wizard' },

	// Sovereign
	{ id: 'satohash-stamp', domain: 'sovereign', icon: '⏱️', title: 'Satohash Proof Layer', desc: 'OTS-stamp payments, votes, rules, leases to Bitcoin', bcfsaRelevant: false, status: 'planned', features: ['60-sec stamp', 'Zero custody', 'CRT-ready', 'API hook'], savings: 'Court-grade proof' },
	{ id: 'multisig', domain: 'sovereign', icon: '🔑', title: 'External Multisig Watch', desc: 'Import xpub — Hermes watches, never holds keys', bcfsaRelevant: false, status: 'beta', features: ['3-of-5 PSBT', 'Hardware wallet', 'Unchained/Casa'], savings: '—' },
	{ id: 'openstrata-port', domain: 'sovereign', icon: '🌐', title: 'OpenStrata Export', desc: 'Portable identity and history when switching managers', bcfsaRelevant: false, status: 'planned', features: ['Nostr events', 'No lock-in', 'Verify all'], savings: '—' }
];

export function getToolStats() {
	return {
		total: strataToolModules.length,
		live: strataToolModules.filter((m) => m.status === 'live').length,
		beta: strataToolModules.filter((m) => m.status === 'beta').length,
		planned: strataToolModules.filter((m) => m.status === 'planned').length,
		bcfsaModules: strataToolModules.filter((m) => m.bcfsaRelevant).length
	};
}