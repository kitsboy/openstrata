<script lang="ts">
	import { copy } from '$lib/i18n';
	import Card from '$lib/components/Card.svelte';
	import PageToc from '$lib/components/PageToc.svelte';
	import {
		manualHeadings,
		quickStartPrereqs,
		quickStartSteps,
		quickStartPricing,
		quickStartFaq,
		quickStartTrouble
	} from '$lib/manual';
</script>

<svelte:head>
	<title>{$copy.quickStart} — OpenStrata</title>
	<meta name="description" content={$copy.manualStartIntro} />
</svelte:head>

<section class="border-b border-border bg-gradient-to-b from-brand-50/50 to-transparent">
	<div class="mx-auto max-w-7xl px-6 py-16">
		<span class="inline-flex rounded-full bg-brand-100 px-4 py-1.5 text-xs font-bold text-brand-700"
			>{$copy.manualTitle}</span
		>
		<h1 class="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">{$copy.quickStart}</h1>
		<p class="mt-4 max-w-3xl text-lg leading-relaxed text-slate-600">{$copy.manualStartIntro}</p>
		<div class="mt-6 flex flex-wrap gap-3">
			<a
				href="/tools/wizard"
				class="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white no-underline transition-colors hover:bg-brand-500"
				>{$copy.wizardTitle} →</a
			>
			<a
				href="/faq"
				class="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-6 py-3 text-sm font-semibold text-slate-600 no-underline transition-colors hover:bg-slate-200"
				>{$copy.faqTitle}</a
			>
		</div>
	</div>
</section>

<div class="mx-auto max-w-4xl px-6 py-12">
	<PageToc />

	<section class="mb-14">
		<h2 class="text-2xl font-bold text-slate-900">{manualHeadings.beforeYouStart}</h2>
		<ul class="mt-6 space-y-3">
			{#each quickStartPrereqs as item}
				<li class="flex gap-3 text-sm leading-relaxed text-slate-600">
					<span class="text-brand-600" aria-hidden="true">•</span>
					<span>{item}</span>
				</li>
			{/each}
		</ul>
	</section>

	<section class="mb-14">
		<h2 class="text-2xl font-bold text-slate-900">{manualHeadings.sixSteps}</h2>
		<ol class="mt-6 space-y-4">
			{#each quickStartSteps as item}
				<li class="glass-card flex gap-4 rounded-2xl p-5">
					<span
						class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700"
						aria-hidden="true">{item.step}</span
					>
					<div>
						<h3 class="font-bold text-slate-800">{item.title}</h3>
						<p class="mt-1 text-sm leading-relaxed text-slate-600">{item.body}</p>
						{#if item.action}
							<a
								href={item.action.href}
								class="mt-3 inline-flex text-sm font-semibold text-brand-600 no-underline transition-colors hover:text-brand-700"
								>{item.action.label} →</a
							>
						{/if}
					</div>
				</li>
			{/each}
		</ol>
	</section>

	<section class="mb-14">
		<h2 class="text-2xl font-bold text-slate-900">{manualHeadings.costs}</h2>
		<p class="mt-2 text-sm leading-relaxed text-slate-500">{$copy.pitchDataNote}</p>
		<div class="mt-6 grid gap-4 sm:grid-cols-2">
			{#each quickStartPricing as tier}
				<Card hover>
					<div class="flex items-baseline justify-between gap-3">
						<h3 class="font-bold text-slate-800">{tier.tier}</h3>
						<span class="text-sm font-bold text-brand-600">{tier.price}</span>
					</div>
					<p class="mt-2 text-sm leading-relaxed text-slate-600">{tier.target}</p>
					<p class="mt-1 text-xs uppercase tracking-wide text-slate-400">{tier.note}</p>
				</Card>
			{/each}
		</div>
		<a
			href="/pitch"
			class="mt-4 inline-flex text-sm font-semibold text-brand-600 no-underline transition-colors hover:text-brand-700"
			>{$copy.pricingTiers} →</a
		>
	</section>

	<section class="mb-14">
		<h2 class="text-2xl font-bold text-slate-900">{$copy.faqTitle}</h2>
		<div class="mt-6 space-y-4">
			{#each quickStartFaq as item}
				<Card>
					<h3 class="font-bold text-slate-800">{item.q}</h3>
					<p class="mt-2 text-sm leading-relaxed text-slate-600">{item.a}</p>
				</Card>
			{/each}
		</div>
	</section>

	<section class="mb-14">
		<h2 class="text-2xl font-bold text-slate-900">{manualHeadings.trouble}</h2>
		<div class="mt-6 space-y-4">
			{#each quickStartTrouble as item}
				<Card class="border-l-2 border-l-brand-300">
					<h3 class="text-sm font-bold text-slate-800">{item.symptom}</h3>
					<p class="mt-1 text-sm leading-relaxed text-slate-600">{item.fix}</p>
				</Card>
			{/each}
		</div>
	</section>

	<section>
		<h2 class="text-2xl font-bold text-slate-900">{$copy.whatsNext}</h2>
		<div class="mt-6 flex flex-wrap gap-3">
			<a
				href="/docs/manual"
				class="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-6 py-3 text-sm font-semibold text-slate-600 no-underline transition-colors hover:bg-slate-200"
				>{$copy.manualSections}</a
			>
			<a
				href="/compliance"
				class="inline-flex items-center gap-2 rounded-xl bg-bc-blue/5 px-6 py-3 text-sm font-semibold text-bc-blue no-underline transition-colors hover:bg-bc-blue/10"
				>{$copy.complianceKb}</a
			>
			<a
				href="/roadmap"
				class="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-6 py-3 text-sm font-semibold text-slate-600 no-underline transition-colors hover:bg-slate-200"
				>{$copy.roadmap}</a
			>
		</div>
	</section>
</div>
