<script lang="ts">
	import PageHeader from '$lib/components/PageHeader.svelte';
	import { money } from '$lib/demo/format';
	import { priorYear, sections, statusStyles } from '$lib/demo/tax';

	let open = $state('position');
</script>

<svelte:head>
	<title>Tax and CRA — Evergreen House</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6">
	<PageHeader
		kicker="Strata returns, and the owner-tax desk"
		title="Tax and CRA"
		lede="Two returns are due today for the year that ended March 31, 2026. The year the building is living in is not filed until September 30, 2027. Owner taxes — empty homes, speculation, underused housing, property tax — are tracked here and paid by the owners."
	/>

	<div class="mb-8 overflow-x-auto">
		<div class="flex gap-2">
			{#each sections as section}
				<a href="#{section.id}" class="shrink-0 rounded-full border border-border bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 no-underline hover:border-brand-300">
					{section.title}
				</a>
			{/each}
		</div>
	</div>

	<section class="mb-8 rounded-2xl border border-border bg-white p-5">
		<h2 class="font-bold text-slate-900">Prior year, the one being filed today</h2>
		<p class="text-sm text-slate-500">{priorYear.label}</p>
		<div class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
			<div><p class="text-xs text-slate-400">Revenue</p><p class="text-xl font-bold tabular-nums">{money(priorYear.revenue)}</p></div>
			<div><p class="text-xs text-slate-400">Operating expenses</p><p class="text-xl font-bold tabular-nums">{money(priorYear.operatingExpenses)}</p></div>
			<div><p class="text-xs text-slate-400">Reserve contribution</p><p class="text-xl font-bold tabular-nums">{money(priorYear.crf)}</p></div>
			<div><p class="text-xs text-slate-400">Excess kept in the funds</p><p class="text-xl font-bold tabular-nums">{money(priorYear.excess)}</p></div>
		</div>
		<p class="mt-3 text-sm text-slate-600">Assets {money(priorYear.assets)}. Fund balances {money(priorYear.equity)}. Interest plus parking {money(priorYear.passive)}, which is why the T1044 is not optional.</p>
	</section>

	<div class="space-y-4">
		{#each sections as section}
			<article id={section.id} class="scroll-mt-36 rounded-2xl border border-border bg-white p-5 sm:p-6">
				<div class="flex flex-wrap items-start justify-between gap-3">
					<div>
						<p class="text-xs font-bold uppercase tracking-wide text-slate-400">{section.agency}</p>
						<h2 class="text-xl font-bold text-slate-900">{section.title}</h2>
					</div>
					<button class="rounded-full px-3 py-1 text-xs font-bold {statusStyles[section.status]}" onclick={() => (open = open === section.id ? '' : section.id)}>
						{section.statusLabel}
					</button>
				</div>
				<p class="mt-2 text-sm text-slate-500">Due {section.deadline}. Applies to {section.appliesTo}.</p>
				<p class="mt-3 text-sm leading-relaxed text-slate-700">{section.why}</p>

				{#if open === section.id || section.status === 'due'}
					<dl class="mt-4 grid gap-3 sm:grid-cols-2">
						{#each section.facts as fact}
							<div class="rounded-xl bg-slate-50 px-3 py-2">
								<dt class="text-[11px] font-bold uppercase tracking-wide text-slate-400">{fact.label}</dt>
								<dd class="text-sm text-slate-800">{fact.value}</dd>
							</div>
						{/each}
					</dl>
					<h3 class="mt-5 text-sm font-bold uppercase tracking-wide text-slate-500">Do it in this order</h3>
					<ol class="mt-2 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-slate-700">
						{#each section.steps as step}
							<li>{step}</li>
						{/each}
					</ol>
					<h3 class="mt-5 text-sm font-bold uppercase tracking-wide text-slate-500">Checklist</h3>
					<ul class="mt-2 space-y-1">
						{#each section.checklist as item}
							<li class="flex items-start gap-2 text-sm text-slate-700">
								<span class="mt-0.5 font-bold {item.done ? 'text-emerald-600' : 'text-amber-600'}">{item.done ? 'Done' : 'Open'}</span>
								<span>{item.label}</span>
							</li>
						{/each}
					</ul>
					{#if section.watchouts.length}
						<div class="mt-4 rounded-xl bg-amber-50 p-3">
							{#each section.watchouts as note}
								<p class="text-sm leading-relaxed text-amber-950">{note}</p>
							{/each}
						</div>
					{/if}
				{:else}
					<button class="mt-3 text-sm font-semibold text-brand-700" onclick={() => (open = section.id)}>Read the steps</button>
				{/if}
			</article>
		{/each}
	</div>
</div>
