<script lang="ts">
	/**
	 * The Form K register, as a page a council can print.
	 *
	 * The health score has always charged a missing Form K without showing the
	 * list it was counting. This page is that list: the tenanted lots, the day each
	 * window closed, whether the form is on file, and how long a missing one has
	 * been missing — ordered by what it costs, so the reader works from the top.
	 *
	 * Every rule lives in `form-k-register.ts`: only a closed window is a gap, the
	 * points come from the same `formKPenalty` the gauge adds, and a filing recorded
	 * on this device counts from its own day. The page reads storage after mount
	 * because it is prerendered; until then it prints the register as the book has
	 * it, which is the state the lot sheets start from too.
	 */
	import { onMount } from 'svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import { copy, fill, formatDate, formatNumber, locale } from '$lib/i18n';
	import { building, units } from '$lib/demo/building';
	import { formKRegister } from '$lib/form-k-register';
	import { readFiledForms, type FiledForms } from '$lib/form-k';
	import { FORM_K_CAP, FORM_K_EACH } from '$lib/health';

	const asOf = building.asOf;

	let filedForms = $state<FiledForms>({});
	onMount(() => {
		filedForms = readFiledForms();
	});

	const register = $derived(formKRegister(units, filedForms, asOf));
	/** Gaps the 15-point cap does not reach — they are listed, and they cost nothing. */
	const uncounted = $derived(
		Math.max(0, register.gaps - Math.floor(FORM_K_CAP / FORM_K_EACH))
	);
</script>

<svelte:head>
	<title>{$copy.formKRegisterTitle} · {building.name}</title>
</svelte:head>

<div class="mx-auto max-w-5xl px-4 py-8 sm:px-6">
	<PageHeader
		kicker={fill($copy.formKRegisterKicker, {
			date: formatDate(asOf, $locale, { dateStyle: 'long' })
		})}
		title={$copy.formKRegisterTitle}
		lede={$copy.formKRegisterLede}
	/>

	<div class="mb-5 flex flex-wrap items-center gap-2 no-print">
		<button
			class="rounded-xl bg-slab px-4 py-2 text-sm font-bold text-slab-ink transition-colors hover:bg-slab-raised"
			onclick={() => window.print()}>{$copy.formKRegisterPrint}</button
		>
		<a
			class="rounded-xl border border-border bg-surface-2 px-4 py-2 text-sm font-semibold text-slate-600 no-underline"
			href="/units">{$copy.formKRegisterBack}</a
		>
		<span class="text-xs text-slate-500">{$copy.formKRegisterPrintNote}</span>
	</div>

	<section class="rounded-2xl border border-border bg-surface-2 p-5">
		<p class="text-sm leading-relaxed text-slate-700">
			{#if register.gaps === 0}
				{$copy.formKRegisterClear}
			{:else}
				{fill($copy.formKRegisterSummary, {
					gaps: formatNumber(register.gaps, $locale),
					lots: formatNumber(register.tenanted, $locale),
					points: formatNumber(register.cost, $locale)
				})}
			{/if}
		</p>
		{#if uncounted > 0}
			<p class="mt-1 text-xs leading-relaxed text-slate-500">
				{fill($copy.formKRegisterCapped, { n: formatNumber(uncounted, $locale) })}
			</p>
		{/if}

		<div class="mt-4 overflow-x-auto">
			<table class="w-full min-w-[680px] text-sm">
				<thead class="text-left text-xs uppercase tracking-wide text-slate-400">
					<tr class="border-b border-border">
						<th class="py-2 pr-3">{$copy.formKRegisterLot}</th>
						<th class="py-2 pr-3">{$copy.formKRegisterTenant}</th>
						<th class="py-2 pr-3">{$copy.formKRegisterSince}</th>
						<th class="py-2 pr-3">{$copy.formKRegisterClosed}</th>
						<th class="py-2 pr-3">{$copy.formKRegisterOnFile}</th>
						<th class="py-2 pr-3 text-right">{$copy.formKRegisterDaysPast}</th>
						<th class="py-2 text-right">{$copy.formKRegisterCost}</th>
					</tr>
				</thead>
				<tbody>
					{#each register.rows as row (row.unitId)}
						<tr class="border-b border-border last:border-0">
							<th scope="row" class="py-2 pr-3 text-left font-bold tabular-nums">
								<a class="text-slate-900 no-underline" href="/units/{row.unitId}">{row.unitId}</a>
							</th>
							<td class="py-2 pr-3 text-slate-800">{row.tenant}</td>
							<td class="whitespace-nowrap py-2 pr-3 text-xs tabular-nums text-slate-500"
								>{formatDate(row.since, $locale, { dateStyle: 'medium' })}</td
							>
							<td class="whitespace-nowrap py-2 pr-3 text-xs tabular-nums text-slate-500">
								{#if row.open}
									{fill($copy.formKRegisterOpen, {
										date: formatDate(row.closes, $locale, { dateStyle: 'medium' })
									})}
								{:else}
									{formatDate(row.closes, $locale, { dateStyle: 'medium' })}
								{/if}
							</td>
							<td class="py-2 pr-3">
								<span
									class="font-semibold {row.onFile ? 'text-emerald-700' : 'text-rose-700'}"
								>{row.onFile ? $copy.yesLabel : $copy.noLabel}</span>
								{#if row.recordedOn}
									<span class="block text-[11px] tabular-nums text-slate-400"
										>{formatDate(row.recordedOn, $locale, { dateStyle: 'medium' })}</span
									>
								{/if}
							</td>
							<td class="py-2 pr-3 text-right tabular-nums text-slate-700">
								{row.open || row.onFile ? '—' : formatNumber(row.pastDays, $locale)}
							</td>
							<td class="py-2 text-right font-semibold tabular-nums {row.cost > 0
								? 'text-rose-700'
								: 'text-slate-400'}">
								{row.cost > 0 ? `−${formatNumber(row.cost, $locale)}` : '—'}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		<p class="mt-4 text-xs leading-relaxed text-slate-500">{$copy.formKRegisterNote}</p>
	</section>
</div>
