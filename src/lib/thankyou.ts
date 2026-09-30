/**
 * The thank-you page's flow prose — canonical English, not machine-translated.
 *
 * This page tells a person what *just happened* to their data and what to do
 * next ("nothing was published, emailed, or charged"). That is an operational
 * honesty statement, not page chrome: a loose translation of it is a materially
 * false statement in the worst place. Same rule as `documents.ts`, `manual.ts`
 * and `custody.ts` — the chrome around the prose goes through the catalog, the
 * prose itself does not.
 */

export type ThanksVariant = {
	kicker: string;
	title: string;
	lead: string;
};

export const thanksVariants: Record<string, ThanksVariant> = {
	default: {
		kicker: 'Action complete',
		title: 'Thank you — that worked.',
		lead: 'Your action went through. Below is what happened and the next step from here.'
	},
	wizard: {
		kicker: 'Configuration generated',
		title: 'Thank you — your strata configuration is ready.',
		lead: 'OpenStrata generated the operating setup for your building: units, funds, rails, and bylaws mapped to your jurisdiction. Nothing was registered or published — the JSON on the previous screen is yours to keep, edit, or hand to your council.'
	},
	donate: {
		kicker: 'Support received',
		title: 'Thank you — your sats keep this free.',
		lead: 'Your Lightning payment settled peer-to-peer. No account was created and nothing was custodied; open-source strata tooling stays free for every community.'
	},
	contact: {
		kicker: 'Message received',
		title: 'Thank you — your message is queued.',
		lead: 'A human on the Give A Bit team reads every message. Expect a reply within a few business days — we answer in plain language, not sales language.'
	},
	demo: {
		kicker: 'Demo requested',
		title: 'Thank you — your walkthrough request is in.',
		lead: 'We will walk your council through OpenStrata on real numbers from your own building, with no obligation and no data upload required.'
	}
};

export type ThanksStep = { title: string; body: string };

export const thanksSteps: ThanksStep[] = [
	{
		title: 'Keep your configuration',
		body: 'Use Download config on the wizard screen. It is a plain JSON document — portable, versionable, and yours. OpenStrata never holds a copy.'
	},
	{
		title: 'Register the building in your workspace',
		body: 'Sign in and use Register this building so balances, deadlines, and the hash-chained ledger attach to a real workspace instead of a browser tab.'
	},
	{
		title: 'Connect your host (or stay in demo)',
		body: 'Sovereign rails run on your own host: fiat, on-chain, and Lightning. Until then you are in demo mode with sample data — we label it clearly, always.'
	},
	{
		title: 'Set the legal baseline',
		body: 'Compliance dates and Form B/F windows are tracked from your jurisdiction. Rosa answers from official sources with citations; she never guesses.'
	}
];

/** Resolve the `?from=` variant; unknown or missing values fall back to default. */
export function thanksVariantFor(from: string | null | undefined): ThanksVariant {
	return (from && thanksVariants[from]) || thanksVariants.default;
}
