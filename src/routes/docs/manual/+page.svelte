<script lang="ts">
	// Manual hub. Every card points at a route that exists — no dead links, and
	// no component logic beyond rendering the content module.
	import { copy } from '$lib/i18n';
	import Card from '$lib/components/Card.svelte';
	import { manualSections } from '$lib/manual';
</script>

<svelte:head>
	<title>{$copy.manualTitle} — OpenStrata</title>
	<meta name="description" content={$copy.manualIntro} />
</svelte:head>

<section class="border-b border-border bg-gradient-to-b from-brand-50/50 to-transparent">
	<div class="mx-auto max-w-7xl px-6 py-16">
		<span class="inline-flex rounded-full bg-brand-100 px-4 py-1.5 text-xs font-bold text-brand-700"
			>{$copy.helpCentre}</span
		>
		<h1 class="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">{$copy.manualTitle}</h1>
		<p class="mt-4 max-w-3xl text-lg leading-relaxed text-slate-600">{$copy.manualIntro}</p>
		<div class="mt-6 flex flex-wrap gap-3">
			<a
				href="/docs/manual/welcome"
				class="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white no-underline transition-colors hover:bg-brand-500"
				>{$copy.manualWelcomeTitle} →</a
			>
			<a
				href="/docs/manual/getting-started"
				class="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-6 py-3 text-sm font-semibold text-slate-600 no-underline transition-colors hover:bg-slate-200"
				>{$copy.quickStart} →</a
			>
		</div>
	</div>
</section>

<div class="mx-auto max-w-7xl px-6 py-12">
	<h2 class="mb-6 text-2xl font-bold text-slate-900">{$copy.manualSections}</h2>
	<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
		{#each manualSections as section}
			<Card hover class="flex flex-col">
				<span class="text-[10px] font-bold uppercase tracking-wider text-brand-600"
					>{section.label}</span
				>
				<h3 class="mt-2 font-bold text-slate-800">{section.title}</h3>
				<p class="mt-1 text-sm leading-relaxed text-slate-500">{section.desc}</p>
				<a
					href={section.href}
					class="mt-4 inline-flex text-sm font-semibold text-brand-600 no-underline transition-colors hover:text-brand-700"
					>{$copy.manualReadMore} →</a
				>
			</Card>
		{/each}
	</div>

	<div
		class="mt-10 rounded-2xl border border-brand-200 bg-brand-50/50 p-5 text-sm leading-relaxed text-slate-600"
	>
		<strong class="text-slate-800">{$copy.needAHand}</strong>
		{$copy.visitResourceCentre} —
		<a href="mailto:hello@giveabit.io" class="text-brand-600 hover:underline">hello@giveabit.io</a
		>
	</div>
</div>
