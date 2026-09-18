<script lang="ts">
	import { onMount } from 'svelte';
	import StartHere from '$lib/components/StartHere.svelte';

	// The real end of a OpenStrata flow. The wizard completion card and the
	// donate modal both link here; `?from=` selects the honest variant so the
	// visitor is told exactly what happened, not a generic "thanks".
	const variants = {
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

	type SourceKey = keyof typeof variants;

	let source = $state<SourceKey>('default');

	onMount(() => {
		const from = new URLSearchParams(window.location.search).get('from') as SourceKey | null;
		if (from && from in variants) source = from;
	});

	const stepTitles = [
		'Keep your configuration',
		'Register the building in your workspace',
		'Connect your host (or stay in demo)',
		'Set the legal baseline'
	];
	const stepBodies = [
		'Use Download config on the wizard screen. It is a plain JSON document — portable, versionable, and yours. OpenStrata never holds a copy.',
		'Sign in and use Register this building so balances, deadlines, and the hash-chained ledger attach to a real workspace instead of a browser tab.',
		'Sovereign rails run on your own host: fiat, on-chain, and Lightning. Until then you are in demo mode with sample data — we label it clearly, always.',
		'Compliance dates and Form B/F windows are tracked from your jurisdiction. Rosa answers from official sources with citations; she never guesses.'
	];
</script>

<svelte:head>
	<title>Thank you — what happens next · OpenStrata</title>
	<meta
		name="description"
		content="What just happened on OpenStrata, and the four steps that come next: keep your configuration, register the building, connect your host, set the legal baseline."
	/>
	<meta name="robots" content="noindex, follow" />
</svelte:head>

<section class="page-hero">
	<div class="mx-auto max-w-7xl px-6 py-16">
		<span class="inline-flex rounded-full bg-success/10 px-4 py-1.5 text-xs font-bold text-success">
			{variants[source].kicker}
		</span>
		<h1 class="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">{variants[source].title}</h1>
		<p class="mt-4 max-w-3xl text-lg leading-relaxed text-slate-600">{variants[source].lead}</p>
		<div class="mt-6 flex flex-wrap gap-3">
			<a
				href="/tools/wizard"
				class="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white no-underline transition-colors hover:bg-brand-500"
				>Back to the wizard →</a
			>
			<a
				href="/tools"
				class="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-6 py-3 text-sm font-semibold text-slate-600 no-underline transition-colors hover:bg-slate-200"
				>See every module</a
			>
		</div>
	</div>
</section>

<StartHere step={3} />

<div class="mx-auto max-w-4xl px-6 py-12">
	<h2 class="text-2xl font-bold text-slate-900">What happens next</h2>
	<ol class="mt-6 space-y-4">
		{#each stepTitles as stepTitle, i}
			<li class="glass-card flex gap-4 rounded-2xl p-5">
				<span
					class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700"
					aria-hidden="true">{i + 1}</span
				>
				<div>
					<h3 class="font-bold text-slate-800">{stepTitle}</h3>
					<p class="mt-1 text-sm leading-relaxed text-slate-600">{stepBodies[i]}</p>
				</div>
			</li>
		{/each}
	</ol>

	<div
		class="mt-8 rounded-2xl border border-brand-200 bg-brand-50/50 p-5 text-sm leading-relaxed text-slate-600"
	>
		<strong class="text-slate-800">No hidden steps:</strong> nothing was published, emailed, or
		charged. OpenStrata is software — not an unlicensed management company — and it never holds the
		money: council keys stay on council hardware wallets.
	</div>

	<div class="mt-8 flex flex-wrap gap-3">
		<a
			href="/docs"
			class="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-600 no-underline transition-colors hover:bg-slate-200"
			>Framework docs</a
		>
		<a
			href="/compliance"
			class="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-600 no-underline transition-colors hover:bg-slate-200"
			>BC compliance reference</a
		>
		<a
			href="mailto:hello@giveabit.io?subject=OpenStrata"
			class="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-600 no-underline transition-colors hover:bg-slate-200"
			>hello@giveabit.io</a
		>
	</div>
</div>
