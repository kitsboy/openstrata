<script lang="ts">
	import PageHeader from '$lib/components/PageHeader.svelte';
	import Next30 from '$lib/components/Next30.svelte';
	import { copy, fill } from '$lib/i18n';
	import { money } from '$lib/demo/format';
	import { priorYear, sections, statusStyles } from '$lib/demo/tax';
	import { TAX_CATEGORIES } from '$lib/next30';

	let open = $state('position');
</script>

<svelte:head>
	<title>{$copy.taxPageTitle}</title>
</svelte:head>

<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6">
	<PageHeader kicker={$copy.taxKicker} title={$copy.taxHeading} lede={$copy.taxLede} />

	<Next30 categories={TAX_CATEGORIES} hint={$copy.next30TaxHint} />

	<div class="mb-8 overflow-x-auto">
		<div class="flex gap-2">
			{#each sections as section}
				<a href="#{section.id}" class="shrink-0 rounded-full border border-border bg-surface-2 px-3 py-1.5 text-xs font-semibold text-slate-600 no-underline hover:border-brand-300">
					{section.title}
				</a>
			{/each}
		</div>
	</div>

	<section class="mb-8 rounded-2xl border border-border bg-surface-2 p-5">
		<h2 class="font-bold text-slate-900">{$copy.taxPriorYear}</h2>
		<p class="text-sm text-slate-500">{priorYear.label}</p>
		<div class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
			<div><p class="text-xs text-slate-400">{$copy.taxRevenue}</p><p class="text-xl font-bold tabular-nums">{money(priorYear.revenue)}</p></div>
			<div><p class="text-xs text-slate-400">{$copy.taxOperating}</p><p class="text-xl font-bold tabular-nums">{money(priorYear.operatingExpenses)}</p></div>
			<div><p class="text-xs text-slate-400">{$copy.taxReserve}</p><p class="text-xl font-bold tabular-nums">{money(priorYear.crf)}</p></div>
			<div><p class="text-xs text-slate-400">{$copy.taxExcess}</p><p class="text-xl font-bold tabular-nums">{money(priorYear.excess)}</p></div>
		</div>
		<p class="mt-3 text-sm text-slate-600">{fill($copy.taxFundsLine, {
			assets: money(priorYear.assets),
			equity: money(priorYear.equity),
			passive: money(priorYear.passive)
		})}</p>
	</section>

	<div class="space-y-4">
		{#each sections as section}
			<article id={section.id} class="scroll-mt-36 rounded-2xl border border-border bg-surface-2 p-5 sm:p-6">
				<div class="flex flex-wrap items-start justify-between gap-3">
					<div>
						<p class="text-xs font-bold uppercase tracking-wide text-slate-400">{section.agency}</p>
						<h2 class="text-xl font-bold text-slate-900">{section.title}</h2>
					</div>
					<button class="rounded-full px-3 py-1 text-xs font-bold {statusStyles[section.status]}" onclick={() => (open = open === section.id ? '' : section.id)}>
						{section.statusLabel}
					</button>
				</div>
				<p class="mt-2 text-sm text-slate-500">{fill($copy.taxDueApplies, { due: section.deadline, appliesTo: section.appliesTo })}</p>
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
					<h3 class="mt-5 text-sm font-bold uppercase tracking-wide text-slate-500">{$copy.taxInOrder}</h3>
					<ol class="mt-2 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-slate-700">
						{#each section.steps as step}
							<li>{step}</li>
						{/each}
					</ol>
					<h3 class="mt-5 text-sm font-bold uppercase tracking-wide text-slate-500">{$copy.taxChecklist}</h3>
					<ul class="mt-2 space-y-1">
						{#each section.checklist as item}
							<li class="flex items-start gap-2 text-sm text-slate-700">
								<span class="mt-0.5 font-bold {item.done ? 'text-emerald-700' : 'text-amber-700'}">{item.done ? $copy.taxDone : $copy.taxOpen}</span>
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
					<button class="mt-3 text-sm font-semibold text-brand-700" onclick={() => (open = section.id)}>{$copy.taxReadSteps}</button>
				{/if}
			</article>
		{/each}
	</div>
</div>
