<script lang="ts">
	import { copy } from '$lib/i18n';
	import Card from '$lib/components/Card.svelte';
	import { manualHeadings, welcomeAudiences, welcomeCapabilities, welcomeLimits } from '$lib/manual';
</script>

<svelte:head>
	<title>{$copy.manualWelcomeTitle} — OpenStrata</title>
	<meta name="description" content={$copy.manualWelcomeIntro} />
</svelte:head>

<section class="border-b border-border bg-gradient-to-b from-brand-50/50 to-transparent">
	<div class="mx-auto max-w-7xl px-6 py-16">
		<span class="inline-flex rounded-full bg-brand-100 px-4 py-1.5 text-xs font-bold text-brand-700"
			>{$copy.manualTitle}</span
		>
		<h1 class="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">{$copy.manualWelcomeTitle}</h1>
		<p class="mt-4 max-w-3xl text-lg leading-relaxed text-slate-600">{$copy.manualWelcomeIntro}</p>
		<div class="mt-6 flex flex-wrap gap-3">
			<a
				href="/docs/manual/getting-started"
				class="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white no-underline transition-colors hover:bg-brand-500"
				>{$copy.quickStart} →</a
			>
			<a
				href="/docs"
				class="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-6 py-3 text-sm font-semibold text-slate-600 no-underline transition-colors hover:bg-slate-200"
				>{$copy.documentationHub}</a
			>
		</div>
	</div>
</section>

<div class="mx-auto max-w-4xl px-6 py-12">
	<section class="mb-14">
		<h2 class="text-2xl font-bold text-slate-900">{manualHeadings.whoFor}</h2>
		<div class="mt-6 space-y-4">
			{#each welcomeAudiences as audience}
				<Card>
					<h3 class="font-bold text-slate-800">{audience.title}</h3>
					<p class="mt-2 text-sm leading-relaxed text-slate-600">{audience.body}</p>
				</Card>
			{/each}
		</div>
	</section>

	<section class="mb-14">
		<h2 class="text-2xl font-bold text-slate-900">{$copy.whyItMattersLabel}</h2>
		<div class="mt-6 grid gap-4 sm:grid-cols-2">
			{#each welcomeCapabilities as item}
				<Card hover>
					<h3 class="font-bold text-slate-800">{item.title}</h3>
					<p class="mt-2 text-sm leading-relaxed text-slate-600">{item.body}</p>
				</Card>
			{/each}
		</div>
	</section>

	<section class="mb-14">
		<h2 class="text-2xl font-bold text-slate-900">{manualHeadings.whatItIsNot}</h2>
		<p class="mt-2 text-sm leading-relaxed text-slate-500">
			{manualHeadings.limitsNote}
		</p>
		<ul class="mt-6 space-y-4">
			{#each welcomeLimits as limit}
				<li class="glass-card flex gap-4 rounded-2xl p-5">
					<span class="mt-0.5 text-lg text-slate-400" aria-hidden="true">—</span>
					<div>
						<h3 class="font-bold text-slate-800">{limit.title}</h3>
						<p class="mt-1 text-sm leading-relaxed text-slate-600">{limit.body}</p>
					</div>
				</li>
			{/each}
		</ul>
	</section>

	<section>
		<h2 class="text-2xl font-bold text-slate-900">{$copy.whatsNext}</h2>
		<p class="mt-2 text-sm leading-relaxed text-slate-500">
			The manual walks the setup in order. Nothing is published or registered while you read.
		</p>
		<div class="mt-6 flex flex-wrap gap-3">
			<a
				href="/docs/manual/getting-started"
				class="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white no-underline transition-colors hover:bg-brand-500"
				>{$copy.quickStart} →</a
			>
			<a
				href="/docs/manual"
				class="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-6 py-3 text-sm font-semibold text-slate-600 no-underline transition-colors hover:bg-slate-200"
				>{$copy.manualSections}</a
			>
		</div>
	</section>
</div>
