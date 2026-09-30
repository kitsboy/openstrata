/**
 * User manual — canonical English source.
 *
 * Long-form guide copy lives here (the same pattern as data.ts and legal.ts) so
 * the manual has one authoring home instead of copy spread across templates.
 * Only page chrome comes from the shared i18n catalog; body content stays
 * English until reviewed translations exist.
 *
 * Honesty rules for anything added here:
 *  - Numbers come from marketing.ts / strata-tool.ts, never re-typed by hand.
 *  - Nothing claims a feature is live when the roadmap says otherwise.
 *  - Demo data is always labelled as demo.
 */

import { hermesPositioning, revenueTiers, bcfsaFacts } from './marketing';
import { getToolStats } from '$lib/strata-tool';

const stats = getToolStats();

export type ManualCard = { title: string; desc: string; href: string; label: string };

/** Section headings — kept with the copy they introduce, not in templates. */
export const manualHeadings = {
	whoFor: 'Who it is for',
	whatItIsNot: 'What it is not',
	limitsNote:
		'The limits matter as much as the features. Nothing in this manual overrides them, and nothing on this site should be quoted as a promise they contradict.',
	beforeYouStart: 'Before you start',
	sixSteps: 'The six steps',
	costs: 'What it costs',
	trouble: 'If something looks wrong'
} as const;

/** The manual hub — every entry links to a page that actually exists. */
export const manualSections: ManualCard[] = [
	{
		title: 'Welcome to OpenStrata',
		desc: 'What the platform is, who it is for, and what it deliberately is not.',
		href: '/docs/manual/welcome',
		label: 'Start here'
	},
	{
		title: 'Quick start',
		desc: 'From a new building to a running one — the six steps, in order.',
		href: '/docs/manual/getting-started',
		label: '6 steps'
	},
	{
		title: 'Framework documentation',
		desc: 'Architecture, the docs folder, and the install SOP for self-hosters.',
		href: '/docs',
		label: 'Technical'
	},
	{
		title: 'BC compliance reference',
		desc: 'SPA workflows, quorum, voting thresholds, retention, and Form B / Form F windows.',
		href: '/compliance',
		label: 'Legal'
	},
	{
		title: `${stats.total} Strata Tool modules`,
		desc: 'Every module, and whether it is live, in beta, or still planned.',
		href: '/tools',
		label: 'Modules'
	},
	{
		title: 'Template library',
		desc: 'Form B, Form F, complaint notices, meeting agendas, minutes, and budgets.',
		href: '/templates',
		label: 'Documents'
	},
	{
		title: 'Questions and answers',
		desc: 'Plain-language answers to the questions owners actually ask.',
		href: '/faq',
		label: 'FAQ'
	},
	{
		title: 'What is live today',
		desc: `${stats.live} modules live, ${stats.beta} in beta, ${stats.planned} planned — phase by phase.`,
		href: '/roadmap',
		label: 'Roadmap'
	}
];

/** Who the platform is built for — mirrors the three GTM paths in marketing.ts. */
export const welcomeAudiences = [
	{
		title: 'Owners and strata councils',
		body: 'Run your own building: units, fees, meetings, bylaw complaints, and records. Owners managing their own strata do not need a brokerage licence — but a corporation cannot be managed for someone else without one.'
	},
	{
		title: 'Licensed brokerages and managers',
		body: `${hermesPositioning.tagline} The brokerage stays the licensed entity; OpenStrata is the software it operates on, with separate trust funds per corporation enforced by the data model.`
	},
	{
		title: 'Builders, auditors, and technical partners',
		body: 'The building configuration is a portable JSON document, the ledger is hash-chained, and evidence packages (CRT-ready) export in one step. Nothing is locked in.'
	}
];

/** What the software actually does — each line maps to a page or module on the site. */
export const welcomeCapabilities = [
	{
		title: 'Separate money, per corporation',
		body: 'Operating fund and reserve fund are modelled separately, because co-mingling trust money is illegal. The CRF allocation rule (minimum 10% of annual contributions) is a field, not a footnote.'
	},
	{
		title: 'Statutory clocks that do not slip',
		body: 'The 14-day bylaw approval window and the 7-day Form B delivery window are tracked as deadlines, with forms issued from the same ledger.'
	},
	{
		title: 'Governance with a record',
		body: 'Quorum, unit-weighted ballots, and meeting notices are calculated from the eligible-voter set, and every result can be printed and exported.'
	},
	{
		title: 'Answers with citations',
		body: 'Rosa answers BC strata questions only from the compliance corpus and cites the source. When she cannot ground an answer, she says so instead of guessing.'
	},
	{
		title: 'Fiat today, Bitcoin when you want it',
		body: 'E-transfer and fiat rails work now. Sovereign rails are optional: a watch-only council xpub, multisig PSBT signing, and OpenTimestamps proofs for court-ready evidence. OpenStrata never holds the keys and never custodies funds.'
	},
	{
		title: `Portability — ${stats.total} modules, one export`,
		body: 'Your building configuration, ledger, and evidence bundles leave the platform in open formats. Data sovereignty is the product, not a feature.'
	}
];

/** The honest limits. Read this before promising anything to a council. */
export const welcomeLimits = [
	{
		title: 'It is software, not a management company',
		body: `${hermesPositioning.model}. Services that require a licence must still be performed by a licensed brokerage.`
	},
	{
		title: 'It does not give legal advice',
		body: 'OpenStrata provides process support and general information, not legal advice. Legal and professional review is required before acting on anything compliance-related.'
	},
	{
		title: 'It never holds the money or the keys',
		body: 'Funds stay with your bank or your council wallets. Council keys stay on council hardware wallets — custody is 0%.'
	},
	{
		title: 'Demo data is always labelled demo',
		body: 'Until your own host is connected, the dashboard shows sample data and says so on the page. If a number is labelled demo, it is not your building.'
	},
	{
		title: 'Some modules are still planned',
		body: `Live: ${stats.live}. In beta: ${stats.beta}. Planned: ${stats.planned}. The roadmap page carries the current split — check it before quoting a feature to anyone.`
	}
];

export const quickStartPrereqs = [
	'Any modern browser — nothing to install to browse the demo.',
	'An email address, if you want a workspace to attach a registered building to.',
	'For sovereign rails only: a host you control, plus the council hardware wallets.',
	'A plain understanding of your jurisdiction — compliance dates are calculated, not assumed.'
];

export type QuickStartStep = {
	step: number;
	title: string;
	body: string;
	action?: { label: string; href: string };
};

export const quickStartSteps: QuickStartStep[] = [
	{
		step: 1,
		title: 'Look around in demo mode',
		body: 'Every tool works with sample data so you can judge the workflow before committing anything. The page will tell you when you are looking at demo data — believe it.',
		action: { label: 'Open the tools', href: '/tools' }
	},
	{
		step: 2,
		title: 'Generate your building configuration',
		body: 'The wizard walks your jurisdiction, entity, units, funds, payment rails, and bylaws. It produces a configuration — it does not register anything with any authority.',
		action: { label: 'Building wizard', href: '/tools/wizard' }
	},
	{
		step: 3,
		title: 'Keep the configuration',
		body: 'Download the JSON. It is a plain document: portable, versionable, yours. OpenStrata does not keep a copy, and nothing is published anywhere.'
	},
	{
		step: 4,
		title: 'Register the building in a workspace',
		body: 'Sign in and register the building so balances, deadlines, forms, and the hash-chained ledger attach to a real workspace instead of a browser tab.',
		action: { label: 'Sign in', href: '/' }
	},
	{
		step: 5,
		title: 'Connect your host — or stay in demo',
		body: 'Sovereign operation means your own backend. Set PUBLIC_API_BASE_URL at build time (or openstrata-api-base in the browser) and sign in. Until then, demo mode stays clearly labelled.'
	},
	{
		step: 6,
		title: 'Set the legal baseline',
		body: 'Confirm jurisdiction dates, Form B / Form F windows, council roles, and the CRF allocation. Rosa answers from official sources with citations and flags anything date-dependent for review.'
	}
];

/** Commercial facts, taken from the published pricing tiers — no invented numbers. */
export const quickStartPricing = revenueTiers.map((tier) => ({
	tier: tier.tier,
	price: tier.price,
	note: tier.priceNote,
	target: tier.target
}));

export const quickStartFaq = [
	{
		q: 'Do I need a licence to use this?',
		a: `No licence is needed to self-manage your own strata — owners may do that. Providing strata management services to other corporations requires a licensed brokerage under BCFSA rules. ${bcfsaFacts.selfManageException}`
	},
	{
		q: 'Does it cost anything to try?',
		a: `The self-hosted tier is free and open source. Paid tiers are per unit per month, published in full on the pricing page — the same numbers the pitch deck uses.`
	},
	{
		q: 'Where does my data live?',
		a: 'In your workspace, on your host when you connect one. The public site is static: it does not store your building, your balances, or your documents while you are browsing.'
	},
	{
		q: 'Is my data secure?',
		a: 'Three concrete properties, no adjectives: funds are never custodied by OpenStrata, council keys never leave council hardware wallets, and ledger entries are hash-chained so tampering is detectable. What the platform cannot promise is your own host’s hardening — that part is yours.'
	},
	{
		q: 'Can I get my data back out?',
		a: 'Yes, by design. The building configuration is portable JSON, the ledger exports to CSV, and evidence packages (certificates, CPT bundles) print or export for auditors and the CRT.'
	},
	{
		q: 'Do you handle tax reporting?',
		a: 'No. The ledger produces clean, exportable records; your accountant or auditor decides what they mean for your filings.'
	}
];

/** Fast answers for the "something looks wrong" class of question. */
export const quickStartTrouble = [
	{
		symptom: 'Everything says Demo',
		fix: 'Expected — no host is connected. Sign in and set the API base to flip from demo to live; the badge is honest, not broken.'
	},
	{
		symptom: 'The balances are not my building’s balances',
		fix: 'You are looking at sample data on a page labelled demo. Register the building in a workspace to see real balances.'
	},
	{
		symptom: 'Sign-in fails',
		fix: 'The server is unreachable, so the app has fallen back to demo data rather than pretending. Check the host address and that the backend is running.'
	},
	{
		symptom: 'A module I want says “planned”',
		fix: 'It is not built yet. The roadmap page carries the phase and the current live / beta / planned counts — quote those, not the marketing copy.'
	},
	{
		symptom: 'Nothing was registered or emailed',
		fix: 'Correct. Generating a configuration publishes nothing. Registration, filing, and delivery are separate, deliberate actions.'
	}
];
