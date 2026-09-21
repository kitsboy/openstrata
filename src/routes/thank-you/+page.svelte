<script lang="ts">
	import { onMount } from 'svelte';
	import StartHere from '$lib/components/StartHere.svelte';
	import HeroArt from '$lib/components/HeroArt.svelte';
	import { copy } from '$lib/i18n';
	import { thanksVariantFor, thanksSteps } from '$lib/thankyou';

	// The real end of an OpenStrata flow. The wizard completion card and the
	// donate modal both link here; `?from=` selects the honest variant so the
	// visitor is told exactly what happened, not a generic "thanks".
	let from = $state<string | null>(null);

	onMount(() => {
		from = new URLSearchParams(window.location.search).get('from');
	});

	const variant = $derived(thanksVariantFor(from));
</script>

<svelte:head>
	<title>{$copy.thanksPageTitle}</title>
	<meta name="description" content={$copy.thanksMetaDescription} />
	<meta name="robots" content="noindex, follow" />
</svelte:head>

<section class="page-hero">
	<HeroArt variant="signal" />
	<div class="mx-auto max-w-7xl px-6 py-16">
		<span class="inline-flex rounded-full bg-success/10 px-4 py-1.5 text-xs font-bold text-success">
			{variant.kicker}
		</span>
		<h1 class="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">{variant.title}</h1>
		<p class="mt-4 max-w-3xl text-lg leading-relaxed text-slate-600">{variant.lead}</p>
		<div class="mt-6 flex flex-wrap gap-3">
			<a
				href="/tools/wizard"
				class="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white no-underline transition-colors hover:bg-brand-500"
				>{$copy.thanksBackToWizard} →</a
			>
			<a
				href="/tools"
				class="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-6 py-3 text-sm font-semibold text-slate-600 no-underline transition-colors hover:bg-slate-200"
				>{$copy.thanksSeeEveryModule}</a
			>
		</div>
	</div>
</section>

<StartHere step={3} />

<div class="mx-auto max-w-4xl px-6 py-12">
	<h2 class="text-2xl font-bold text-slate-900">{$copy.thanksNextTitle}</h2>
	<ol class="mt-6 space-y-4">
		{#each thanksSteps as step, i}
			<li class="glass-card flex gap-4 rounded-2xl p-5">
				<span
					class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700"
					aria-hidden="true">{i + 1}</span
				>
				<div>
					<h3 class="font-bold text-slate-800">{step.title}</h3>
					<p class="mt-1 text-sm leading-relaxed text-slate-600">{step.body}</p>
				</div>
			</li>
		{/each}
	</ol>

	<div
		class="mt-8 rounded-2xl border border-brand-200 bg-brand-50/50 p-5 text-sm leading-relaxed text-slate-600"
	>
		<strong class="text-slate-800">{$copy.thanksNoHiddenSteps}</strong>
		{$copy.thanksNoHiddenStepsBody}
	</div>

	<div class="mt-8 flex flex-wrap gap-3">
		<a
			href="/docs"
			class="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-600 no-underline transition-colors hover:bg-slate-200"
			>{$copy.thanksFrameworkDocs}</a
		>
		<a
			href="/compliance"
			class="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-600 no-underline transition-colors hover:bg-slate-200"
			>{$copy.thanksComplianceRef}</a
		>
		<a
			href="mailto:hello@giveabit.io?subject=OpenStrata"
			class="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-600 no-underline transition-colors hover:bg-slate-200"
			>hello@giveabit.io</a
		>
	</div>
</div>
