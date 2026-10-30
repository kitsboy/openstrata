<script lang="ts">
	import PageHeader from '$lib/components/PageHeader.svelte';
	import { copy, fill, formatDate, formatNumber, locale } from '$lib/i18n';
	import { money } from '$lib/demo/format';
	import { LEVY_PLAN_CENTS, charges } from '$lib/demo/arrears';
	import { LATE_FEE_CENTS, balance, building, formF, getUnit, monthlyFeeCents, type Unit } from '$lib/demo/building';
	import { events } from '$lib/demo/schedule';
	import { addDays, dayIn, daysBetween, daysPastDue, periodOf } from '$lib/arrears';
	import { FORM_K_DAYS } from '$lib/health';
	import { account, billedMonths, forLot, upcoming, type AccountLine } from '$lib/lot-sheet';
	import ArrearsLetterSheet from '$lib/components/ArrearsLetterSheet.svelte';
	import LevyLetterSheet from '$lib/components/LevyLetterSheet.svelte';
	import InsuranceNoticeSheet from '$lib/components/InsuranceNoticeSheet.svelte';
	import { lotLevyLetter } from '$lib/demo/levy-letter';
	import { lotInsuranceNotice } from '$lib/demo/insurance-notice';
	import FormFCertificateSheet from '$lib/components/FormFCertificateSheet.svelte';
	import { formFCertificate } from '$lib/form-f-certificate';
	import { arrearsLetter } from '$lib/arrears-letter';
	import {
		clearFormK,
		filedOn,
		recordFormK,
		readFiledForms,
		writeFiledForms,
		type FiledForms
	} from '$lib/form-k';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const asOf = building.asOf;
	const unit: Unit = $derived(getUnit(data.lot));

	/**
	 * A Form K the council has recorded, device-local. Read after mount because the
	 * sheet is prerendered without storage, and passed to nothing that decides the
	 * money: a filing changes the paperwork, not the balance.
	 */
	let filedForms = $state<FiledForms>({});
	let formKDate = $state(asOf);
	onMount(() => {
		filedForms = readFiledForms();
	});
	const recordedOn = $derived(filedOn(filedForms, unit.id));

	function fileFormK(event: SubmitEvent) {
		event.preventDefault();
		const next = recordFormK(filedForms, unit.id, formKDate);
		filedForms = next;
		writeFiledForms(next);
	}

	function undoFormK() {
		const next = clearFormK(filedForms, unit.id);
		filedForms = next;
		writeFiledForms(next);
	}
	/**
	 * The certificate a notary asks for, behind a button. The working page and the
	 * certificate are never on the paper together: the page is the lot's record,
	 * the certificate is one statement of its balance.
	 */
	let certificate = $state(false);
	const formFCert = $derived(formFCertificate(unit, charges(asOf), asOf));
	/**
	 * The same money as a letter to the owner, behind its own button. One page at a
	 * time: a letter and a working sheet are never on the paper together.
	 */
	let letter = $state(false);
	const ownerLetter = $derived(arrearsLetter(unit, charges(asOf), asOf, LATE_FEE_CENTS));

	/**
	 * The other two letters this lot can be sent, behind their own buttons: the
	 * demand for its share of the parkade levy, and the notice of what the
	 * building's policy does and does not cover. A settled lot has no levy letter
	 * at all, so the button is not offered rather than printing a letter for
	 * nothing.
	 */
	let levyLetterOpen = $state(false);
	let insuranceOpen = $state(false);
	const levyDoc = $derived(lotLevyLetter(unit.id));
	const insuranceDoc = $derived(lotInsuranceNotice(unit.id));

	const due = $derived(balance(unit));
	const lotCharges = $derived(charges(asOf).filter((charge) => charge.unitId === unit.id));

	// The account covers the fiscal year to the statement date. October is due
	// tomorrow, so it is a dated item below, not a line in the ledger.
	const lines = $derived(
		account(lotCharges, {
			feeCents: monthlyFeeCents(unit.entitlement),
			months: billedMonths(building.fiscalStart, asOf),
			asOf
		})
	);

	const nextFee = $derived(upcoming(lotCharges, asOf).find((charge) => charge.kind === 'fee') ?? null);
	const levyPlan = $derived(LEVY_PLAN_CENTS[unit.id] ?? null);

	function monthName(day: string): string {
		return formatDate(`${periodOf(day)}-01`, $locale, { month: 'long' });
	}

	function lineLabel(line: AccountLine): string {
		if (line.kind === 'fee') return fill($copy.lotSheetFee, { month: monthName(line.date) });
		if (line.kind === 'late') return fill($copy.lotSheetLate, { month: monthName(line.date) });
		if (line.kind === 'fine') return $copy.lotSheetFine;
		return $copy.lotSheetLevy;
	}

	// What is dated for this lot and still ahead: the next fee, the late fee that
	// would follow it, and anything on the calendar that names this lot. Titles
	// from the calendar are sample records and stay as written; only the fee lines
	// are composed from the catalog.
	const dated = $derived.by(() => {
		const items: Array<{ date: string; title: string }> = [];
		if (nextFee) {
			items.push({
				date: nextFee.due,
				title: fill($copy.lotSheetFee, { month: monthName(nextFee.due) })
			});
		}
		if (nextFee && (unit.feeArrearsMonths > 0 || due.late > 0)) {
			const attach = dayIn(periodOf(nextFee.due), 5);
			items.push({
				date: attach,
				title: fill($copy.lotSheetLate, { month: monthName(attach) })
			});
		}
		for (const event of forLot(events, unit.id, asOf)) {
			items.push({ date: event.date, title: event.title });
		}
		return items.sort((a, b) => a.date.localeCompare(b.date));
	});

	function daysLabel(day: string): string {
		const days = daysPastDue(asOf, day);
		if (days === 0) return $copy.next30Today;
		if (days === 1) return $copy.next30Tomorrow;
		return fill($copy.calPopDueIn, { n: days });
	}

	const occupancy = $derived(
		unit.occupancy === 'owner'
			? $copy.unitsOccOwner
			: unit.occupancy === 'vacant'
				? $copy.unitsOccVacant
				: unit.occupancy === 'short-term'
					? $copy.unitsOccShortTerm
					: unit.occupancy
	);
</script>

<svelte:head>
	<title>{unit.id} — {unit.owner} · {building.name}</title>
</svelte:head>

<div class="mx-auto max-w-5xl px-4 py-8 sm:px-6">
	<div class:hidden={certificate || letter || levyLetterOpen || insuranceOpen}>
	<PageHeader
		kicker={fill($copy.lotSheetKicker, {
			date: formatDate(asOf, $locale, { dateStyle: 'long' })
		})}
		title="{unit.id} — {unit.owner}"
		lede={$copy.lotSheetLede}
	/>

	<div class="mb-6 flex flex-wrap items-center gap-2 no-print">
		<button
			class="rounded-xl bg-slab px-4 py-2 text-sm font-bold text-slab-ink transition-colors hover:bg-slab-raised"
			onclick={() => window.print()}
		>{$copy.lotSheetPrint}</button>
		<a
			class="rounded-xl border border-border bg-surface-2 px-4 py-2 text-sm font-semibold text-slate-600 no-underline"
			href="/units?lot={unit.id}"
		>{$copy.goBack}</a>
		<button
			class="rounded-xl border border-border bg-surface-2 px-4 py-2 text-sm font-semibold text-slate-700"
			onclick={() => (certificate = true)}>{$copy.ffCertShow}</button
		>
		<button
			class="rounded-xl border border-border bg-surface-2 px-4 py-2 text-sm font-semibold text-slate-700"
			onclick={() => (letter = true)}>{$copy.arrearsLetterShow}</button
		>
		{#if levyDoc?.issuable}
			<button
				class="rounded-xl border border-border bg-surface-2 px-4 py-2 text-sm font-semibold text-slate-700"
				onclick={() => (levyLetterOpen = true)}>{$copy.levyLetterShow}</button
			>
		{/if}
		<button
			class="rounded-xl border border-border bg-surface-2 px-4 py-2 text-sm font-semibold text-slate-700"
			onclick={() => (insuranceOpen = true)}>{$copy.insuranceNoticeShow}</button
		>
		<span class="text-xs text-slate-500">{$copy.lotSheetPrintNote}</span>
	</div>

	<div class="grid gap-4 lg:grid-cols-[320px_1fr]">
		<aside class="h-fit rounded-2xl border border-border bg-surface-2 p-5">
			<p class="text-xs font-bold uppercase tracking-wide text-slate-400">{$copy.unitsToClear}</p>
			<p class="mt-1 text-3xl font-bold tabular-nums text-slate-900">{money(due.total)}</p>
			<p class="mt-1 text-sm text-slate-500">{fill($copy.unitsSpec, {
				type: unit.type,
				sqft: unit.sqft,
				floor: unit.floor
			})}</p>

			<dl class="mt-4 space-y-1 text-sm text-slate-600">
				<div class="flex justify-between gap-3"><dt>{$copy.unitsMonthlyFee}</dt><dd class="tabular-nums">{money(due.fee)}</dd></div>
				<div class="flex justify-between gap-3"><dt>{$copy.accColOctober}</dt><dd class="tabular-nums">{unit.prepaidOctober ? $copy.unitsOctoberPaid : money(due.october)}</dd></div>
				<div class="flex justify-between gap-3"><dt>{$copy.accColBehind}</dt><dd class="tabular-nums">{money(due.arrears)}</dd></div>
				<div class="flex justify-between gap-3"><dt>{$copy.accColLate}</dt><dd class="tabular-nums">{money(due.late)}</dd></div>
				<div class="flex justify-between gap-3"><dt>{$copy.accColFine}</dt><dd class="tabular-nums">{money(due.fine)}</dd></div>
				<div class="flex justify-between gap-3"><dt>{$copy.accColLevy}</dt><dd class="tabular-nums">{money(due.levy)}</dd></div>
				<div class="flex justify-between gap-3 border-t border-border pt-1 font-semibold text-slate-900"><dt>{$copy.accColTotal}</dt><dd class="tabular-nums">{money(due.total)}</dd></div>
			</dl>

			{#if levyPlan}
				<p class="mt-3 text-xs leading-relaxed text-slate-500">{fill($copy.accAgePlanLine, { amount: money(levyPlan) })}</p>
			{/if}
			<p class="mt-3 text-xs leading-relaxed text-slate-500">{fill($copy.unitsFeeSplit, {
				operating: money(due.operatingPart),
				crf: money(due.crfPart)
			})}</p>
		</aside>

		<div class="min-w-0 space-y-4">
			<section class="rounded-2xl border border-border bg-surface-2 p-5">
				<h2 class="font-bold text-slate-900">{$copy.lotSheetAccount}</h2>
				<p class="mt-1 text-sm text-slate-500">{$copy.lotSheetAccountHint}</p>
				<div class="mt-3 overflow-x-auto">
					<table class="w-full min-w-[520px] text-sm">
						<thead class="text-left text-xs uppercase tracking-wide text-slate-400">
							<tr class="border-b border-border">
								<th class="py-2 pr-3">{$copy.payColDate}</th>
								<th class="py-2 pr-3"><span class="sr-only">{$copy.accColAccount}</span></th>
								<th class="py-2 pr-3 text-right">{$copy.lotSheetCharged}</th>
								<th class="py-2 pr-3 text-right">{$copy.lotSheetCleared}</th>
								<th class="py-2 text-right">{$copy.lotSheetStill}</th>
							</tr>
						</thead>
						<tbody>
							{#each lines as line (line.date + line.kind + (line.period ?? ''))}
								<tr class="border-b border-border last:border-0">
									<td class="whitespace-nowrap py-2 pr-3 text-xs tabular-nums text-slate-500">{formatDate(line.date, $locale, { day: 'numeric', month: 'short' })}</td>
									<td class="py-2 pr-3 text-slate-800">{lineLabel(line)}</td>
									<td class="py-2 pr-3 text-right tabular-nums">{money(line.charge)}</td>
									<td class="py-2 pr-3 text-right tabular-nums {line.cleared ? 'text-emerald-700' : 'text-slate-400'}">{line.cleared ? `−${money(line.cleared)}` : '—'}</td>
									<td class="py-2 text-right font-semibold tabular-nums">{money(line.still)}</td>
								</tr>
							{/each}
						</tbody>
						<tfoot>
							<tr class="border-t border-border bg-slate-50">
								<td class="py-2 pr-3 font-bold" colspan="4">{$copy.lotSheetStill}</td>
								<td class="py-2 text-right font-bold tabular-nums">{money(lines.at(-1)?.still ?? 0)}</td>
							</tr>
						</tfoot>
					</table>
				</div>
			</section>

			<div class="grid gap-4 sm:grid-cols-2">
				<!-- Anchored: the health trend links a Form K gap straight here, so the
				     claim about a closed window lands on the dates it is made from. -->
				<section id="forms" class="scroll-mt-24 rounded-2xl border border-border bg-surface-2 p-5">
					<h2 class="font-bold text-slate-900">{$copy.lotSheetForms}</h2>
					<ul class="mt-2 space-y-2 text-sm text-slate-600">
						<li>
							<span class="font-semibold text-slate-800">{$copy.accColFormF}:</span>
							<span class={formF(unit) === 'withheld' ? 'font-semibold text-rose-700' : 'text-emerald-700'}>{formF(unit)}</span>
							<span class="mt-0.5 block text-xs leading-relaxed text-slate-500">
								{formF(unit) === 'withheld' ? $copy.lotSheetFormFWithheld : $copy.lotSheetFormFClear}
							</span>
						</li>
						<li>
							<span class="font-semibold text-slate-800">{$copy.unitsFormK}</span> {unit.formK}
							{#if unit.formK === 'missing' && unit.tenantSince}
								<span class="mt-0.5 block text-xs leading-relaxed text-slate-500">
									{fill($copy.lotSheetFormKWindow, {
										since: formatDate(unit.tenantSince, $locale),
										closed: formatDate(addDays(unit.tenantSince, FORM_K_DAYS), $locale)
									})}
									· {fill($copy.healthTrendPastWindow, {
										days: formatNumber(daysBetween(unit.tenantSince, asOf) - FORM_K_DAYS, $locale)
									})}
								</span>
								{#if recordedOn}
									<div class="mt-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2">
										<p class="text-xs font-semibold text-emerald-900">
											{fill($copy.lotSheetFormKFiled, { date: formatDate(recordedOn, $locale) })}
										</p>
										<p class="mt-1 text-xs leading-relaxed text-emerald-900/80">
											{$copy.lotSheetFormKFiledNote}
										</p>
										<button
											class="mt-2 text-xs font-semibold text-emerald-900 underline no-print"
											onclick={undoFormK}>{$copy.lotSheetFormKClear}</button
										>
									</div>
								{:else}
									<form class="mt-2 flex flex-wrap items-end gap-2 no-print" onsubmit={fileFormK}>
										<label class="text-xs font-semibold text-slate-700" for="form-k-date">
											{$copy.lotSheetFormKDate}
											<input
												id="form-k-date"
												type="date"
												bind:value={formKDate}
												class="mt-1 block rounded-lg border border-border bg-surface px-2 py-1 text-xs"
											/>
										</label>
										<button
											type="submit"
											class="rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-xs font-semibold text-slate-700"
											>{$copy.lotSheetFormKFile}</button
										>
									</form>
								{/if}
							{/if}
						</li>
						{#if unit.id === '201'}
							<li class="text-xs leading-relaxed text-slate-500">{fill($copy.unitsFormBNote, {
								requested: formatDate('2026-09-28', $locale),
								due: formatDate('2026-10-05', $locale)
							})}</li>
						{/if}
					</ul>
				</section>

				<section class="rounded-2xl border border-border bg-surface-2 p-5">
					<h2 class="font-bold text-slate-900">{$copy.lotSheetNext}</h2>
					{#if dated.length > 0}
						<ul class="mt-2 space-y-2 text-sm text-slate-600">
							{#each dated as item (item.date + item.title)}
								<li class="flex flex-wrap items-baseline justify-between gap-2 border-b border-border pb-1 last:border-0 last:pb-0">
									<span class="min-w-0 flex-1">
										<span class="block tabular-nums text-xs text-slate-400">{formatDate(item.date, $locale, { dateStyle: 'medium' })}</span>
										<span class="text-slate-800">{item.title}</span>
									</span>
									<span class="shrink-0 text-xs text-slate-500">{daysLabel(item.date)}</span>
								</li>
							{/each}
						</ul>
					{:else}
						<p class="mt-2 text-sm text-slate-500">{$copy.lotSheetNextEmpty}</p>
					{/if}
				</section>
			</div>

			<!-- Paper for a notary or a buyer does not need the tenant's name on it:
			     `no-print` drops this card from the printed sheet. -->
			<section class="rounded-2xl border border-border bg-surface-2 p-5 no-print">
				<h2 class="font-bold text-slate-900">{$copy.lotSheetTenancy}</h2>
				<dl class="mt-2 grid gap-x-6 gap-y-1 text-sm text-slate-600 sm:grid-cols-2">
					<div><dt class="inline font-semibold text-slate-800">{$copy.unitsLives}</dt> <dd class="inline">{occupancy}{unit.tenant ? ` — ${unit.tenant}` : ''}</dd></div>
					{#if unit.tenantSince}
						<div><dt class="inline font-semibold text-slate-800">{$copy.unitsTenantSince}</dt> <dd class="inline">{formatDate(unit.tenantSince, $locale)}</dd></div>
					{/if}
					<div><dt class="inline font-semibold text-slate-800">{$copy.unitsOwnerIsIn}</dt> <dd class="inline">{unit.ownerLives}</dd></div>
					<div><dt class="inline font-semibold text-slate-800">{$copy.unitsPaysBy}</dt> <dd class="inline">{unit.payMethod}</dd></div>
					<div><dt class="inline font-semibold text-slate-800">{$copy.unitsParking}</dt> <dd class="inline">{unit.parking.join(', ')} · {unit.locker}</dd></div>
					<div><dt class="inline font-semibold text-slate-800">{$copy.unitsPets}</dt> <dd class="inline">{unit.pets}</dd></div>
				</dl>
				<p class="mt-2 text-xs text-slate-400">{unit.email} · {unit.phone}</p>
				<p class="mt-3 text-sm leading-relaxed text-slate-700">{unit.notes}</p>
			</section>
		</div>
	</div>
	</div>

	{#if certificate}
		<div class="no-print mb-4 flex flex-wrap items-end justify-between gap-3">
			<p class="min-w-0 flex-1 basis-[24rem] text-sm leading-relaxed text-slate-600">{$copy.ffCertLede}</p>
			<div class="flex flex-wrap items-center gap-2">
				<button
					class="rounded-xl border border-border bg-surface-2 px-4 py-2 text-sm font-semibold text-slate-700"
					onclick={() => (certificate = false)}>{$copy.ffCertHide}</button
				>
				<button
					class="rounded-xl bg-slab px-4 py-2 text-sm font-bold text-slab-ink transition-colors hover:bg-slab-raised"
					onclick={() => window.print()}>{$copy.ffCertPrint}</button
				>
				<span class="text-xs text-slate-500">{$copy.ffCertPrintNote}</span>
			</div>
		</div>
		<FormFCertificateSheet certificate={formFCert} />
	{/if}

	{#if letter}
		<div class="no-print mb-4 flex flex-wrap items-end justify-between gap-3">
			<p class="min-w-0 flex-1 basis-[24rem] text-sm leading-relaxed text-slate-600">{$copy.arrearsLetterLede}</p>
			<div class="flex flex-wrap items-center gap-2">
				<button
					class="rounded-xl border border-border bg-surface-2 px-4 py-2 text-sm font-semibold text-slate-700"
					onclick={() => (letter = false)}>{$copy.arrearsLetterHide}</button
				>
				<button
					class="rounded-xl bg-slab px-4 py-2 text-sm font-bold text-slab-ink transition-colors hover:bg-slab-raised"
					onclick={() => window.print()}>{$copy.arrearsLetterPrint}</button
				>
				<span class="text-xs text-slate-500">{$copy.arrearsLetterPrintNote}</span>
			</div>
		</div>
		<ArrearsLetterSheet letter={ownerLetter} />
	{/if}

	{#if levyLetterOpen && levyDoc}
		<div class="no-print mb-4 flex flex-wrap items-end justify-end gap-3">
			<div class="flex flex-wrap items-center gap-2">
				<button
					class="rounded-xl border border-border bg-surface-2 px-4 py-2 text-sm font-semibold text-slate-700"
					onclick={() => (levyLetterOpen = false)}>{$copy.levyLetterHide}</button
				>
				<button
					class="rounded-xl bg-slab px-4 py-2 text-sm font-bold text-slab-ink transition-colors hover:bg-slab-raised"
					onclick={() => window.print()}>{$copy.levyLetterPrint}</button
				>
				<span class="text-xs text-slate-500">{$copy.arrearsLetterPrintNote}</span>
			</div>
		</div>
		<LevyLetterSheet letter={levyDoc} />
	{/if}

	{#if insuranceOpen && insuranceDoc}
		<div class="no-print mb-4 flex flex-wrap items-end justify-end gap-3">
			<div class="flex flex-wrap items-center gap-2">
				<button
					class="rounded-xl border border-border bg-surface-2 px-4 py-2 text-sm font-semibold text-slate-700"
					onclick={() => (insuranceOpen = false)}>{$copy.insuranceNoticeHide}</button
				>
				<button
					class="rounded-xl bg-slab px-4 py-2 text-sm font-bold text-slab-ink transition-colors hover:bg-slab-raised"
					onclick={() => window.print()}>{$copy.insuranceNoticePrint}</button
				>
				<span class="text-xs text-slate-500">{$copy.arrearsLetterPrintNote}</span>
			</div>
		</div>
		<InsuranceNoticeSheet notice={insuranceDoc} />
	{/if}
</div>
