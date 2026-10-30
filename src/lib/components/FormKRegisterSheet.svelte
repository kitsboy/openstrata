<script lang="ts">
	/**
	 * The Form K register on one printed page.
	 *
	 * The register has its own page at /units/register, which is the screen a
	 * council works from. This is the sheet the AGM package carries: the same
	 * rows, from the same `formKRegister` call, so the package cannot disagree
	 * with the register or with the score.
	 *
	 * Paper values, not theme tokens, like every printable sheet here.
	 */
	import BrandMark from './BrandMark.svelte';
	import { copy, fill, formatDate, formatNumber, locale } from '$lib/i18n';
	import { building } from '$lib/demo/building';
	import { FORM_K_CAP, FORM_K_EACH } from '$lib/health';
	import type { Register } from '$lib/form-k-register';

	let { register }: { register: Register } = $props();

	/** Gaps the 15-point cap does not reach — listed, and costing nothing. */
	const uncounted = $derived(
		Math.max(0, register.gaps - Math.floor(FORM_K_CAP / FORM_K_EACH))
	);
	const long = { day: 'numeric', month: 'long', year: 'numeric' } as const;
</script>

<article class="print-doc register-doc" aria-labelledby="register-sheet-title">
	<header class="print-letterhead">
		<div class="print-brand">
			<BrandMark size={30} />
			<div>
				<p class="print-org">{building.name}</p>
				<p class="print-org-line">{building.legalName}</p>
				<p class="print-org-line">{building.address}, {building.city}, {building.province} {building.postal}</p>
				<p class="print-org-line">Strata Plan {building.plan}</p>
			</div>
		</div>
		<dl class="print-ref">
			<dt>{$copy.yearSheetFiscal}</dt>
			<dd>{building.fiscalLabel}</dd>
			<dt>{$copy.yearSheetBooksTo}</dt>
			<dd>{building.asOfLabel}</dd>
		</dl>
	</header>

	<div class="print-rule" aria-hidden="true"></div>

	<div class="print-title-block">
		<h1 id="register-sheet-title">{$copy.formKRegisterTitle}</h1>
		<p class="print-subtitle">
			{fill($copy.formKRegisterKicker, {
				date: formatDate(register.asOf, $locale, long)
			})}
		</p>
	</div>

	<p class="print-note">
		{#if register.gaps === 0}
			{$copy.formKRegisterClear}
		{:else}
			{fill($copy.formKRegisterSummary, {
				gaps: formatNumber(register.gaps, $locale),
				lots: formatNumber(register.tenanted, $locale),
				points: formatNumber(register.cost, $locale)
			})}
		{/if}
		{#if uncounted > 0}
			{fill($copy.formKRegisterCapped, { n: formatNumber(uncounted, $locale) })}
		{/if}
	</p>

	<div class="register-table-wrap">
		<table class="register-table">
			<caption class="sr-only">{$copy.formKRegisterTitle}</caption>
			<thead>
				<tr>
					<th scope="col" class="lot">{$copy.formKRegisterLot}</th>
					<th scope="col" class="who">{$copy.formKRegisterTenant}</th>
					<th scope="col" class="date">{$copy.formKRegisterSince}</th>
					<th scope="col" class="date">{$copy.formKRegisterClosed}</th>
					<th scope="col" class="file">{$copy.formKRegisterOnFile}</th>
					<th scope="col" class="num">{$copy.formKRegisterDaysPast}</th>
					<th scope="col" class="num">{$copy.formKRegisterCost}</th>
				</tr>
			</thead>
			<tbody>
				{#each register.rows as row (row.unitId)}
					<tr>
						<th scope="row" class="lot">{row.unitId}</th>
						<td class="who">{row.tenant}</td>
						<td class="date">{formatDate(row.since, $locale, { dateStyle: 'medium' })}</td>
						<td class="date">
							{#if row.open}
								{fill($copy.formKRegisterOpen, {
									date: formatDate(row.closes, $locale, { dateStyle: 'medium' })
								})}
							{:else}
								{formatDate(row.closes, $locale, { dateStyle: 'medium' })}
							{/if}
						</td>
						<td class="file">
							<span class="file-state {row.onFile ? 'on' : 'off'}">
								{row.onFile ? $copy.yesLabel : $copy.noLabel}
							</span>
							{#if row.recordedOn}
								<span class="file-note">{formatDate(row.recordedOn, $locale, { dateStyle: 'medium' })}</span>
							{/if}
						</td>
						<td class="num">{row.open || row.onFile ? '—' : formatNumber(row.pastDays, $locale)}</td>
						<td class="num cost">{row.cost > 0 ? `−${formatNumber(row.cost, $locale)}` : '—'}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<p class="print-basis">{$copy.formKRegisterNote}</p>

	<footer class="print-foot">
		<p>{fill($copy.formKRegisterSheetFooter, { plan: building.plan })}</p>
	</footer>
</article>

<style>
	.register-doc {
		width: 100%;
		max-width: 52rem;
		margin: 0 auto;
		padding: 1.8rem 2.1rem 1rem;
		border: 1px solid #dfe4e8;
		border-radius: 14px;
		background: #ffffff;
		color: #14181c;
		font-family: Georgia, 'Times New Roman', serif;
		font-size: 9pt;
		line-height: 1.35;
		box-shadow: 0 24px 60px rgba(16, 45, 59, 0.16);
	}
	.print-letterhead {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1.5rem;
	}
	.print-letterhead > * {
		min-width: 0;
	}
	.print-brand {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		color: #f0801a;
	}
	.print-org {
		margin: 0;
		font-size: 13.5pt;
		font-weight: 700;
		letter-spacing: -0.01em;
		line-height: 1.15;
	}
	.print-org-line {
		margin: 1px 0 0;
		color: #5a6672;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 7pt;
		letter-spacing: 0.02em;
	}
	.print-ref {
		flex: 0 1 auto;
		max-width: 58mm;
		margin: 0;
		text-align: right;
	}
	.print-ref dt {
		color: #5a6672;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 6.4pt;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}
	.print-ref dd {
		margin: 1px 0 4px;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 7.6pt;
		overflow-wrap: anywhere;
	}
	.print-rule {
		height: 2px;
		margin: 9px 0;
		background: linear-gradient(90deg, #f0801a 0%, #f0801a 22%, #dfe4e8 22%, #dfe4e8 100%);
	}
	.print-title-block h1 {
		margin: 0;
		font-size: 16pt;
		font-weight: 700;
		letter-spacing: -0.015em;
		line-height: 1.1;
	}
	.print-subtitle {
		margin: 3px 0 0;
		color: #3f4a55;
		font-size: 9pt;
	}
	.print-note {
		margin: 8px 0 0;
		padding: 4px 7px;
		border: 1px solid #e4d8c8;
		border-radius: 4px;
		background: #fdfaf5;
		color: #4b5563;
		font-size: 7.4pt;
	}
	.register-table-wrap {
		margin: 8px 0 0;
		overflow-x: auto;
	}
	.register-table {
		width: 100%;
		min-width: 560px;
		border-collapse: collapse;
		font-size: 7.6pt;
		table-layout: fixed;
	}
	.register-table thead th {
		padding: 4px 6px;
		border-bottom: 1px solid #c9cfd4;
		background: #f7f9fa;
		color: #3f4a55;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 6.2pt;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-align: left;
		text-transform: uppercase;
	}
	.register-table th,
	.register-table td {
		padding: 3px 6px;
		border-bottom: 1px solid #e8ecef;
		text-align: left;
		vertical-align: top;
	}
	.register-table tbody th.lot {
		font-weight: 700;
	}
	.register-table .lot {
		width: 14mm;
		white-space: nowrap;
		font-variant-numeric: tabular-nums;
	}
	.register-table .who {
		width: auto;
	}
	.register-table .date {
		width: 27mm;
		white-space: nowrap;
		font-size: 7pt;
		color: #4b5563;
		font-variant-numeric: tabular-nums;
	}
	.register-table .file {
		width: 22mm;
	}
	.register-table .num {
		width: 17mm;
		text-align: right;
		white-space: nowrap;
		font-variant-numeric: tabular-nums;
	}
	.register-table .cost {
		font-weight: 700;
	}
	.file-state {
		font-weight: 700;
	}
	.file-state.on {
		color: #14181c;
	}
	.file-state.off {
		color: #8a3b12;
	}
	.file-note {
		display: block;
		color: #7a858f;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 6.2pt;
	}
	.print-basis {
		margin: 7px 0 0;
		color: #5a6672;
		font-size: 7pt;
		line-height: 1.35;
	}
	.print-foot {
		margin-top: 6px;
		padding-top: 4px;
		border-top: 1px solid #dfe4e8;
		color: #5a6672;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 6.2pt;
		letter-spacing: 0.02em;
	}
	.print-foot p {
		margin: 0;
	}

	@media print {
		.register-table-wrap {
			overflow: visible;
		}
		.register-table {
			min-width: 0;
		}
		.register-table tr {
			break-inside: avoid;
		}
	}

	@media (max-width: 640px) {
		.register-doc {
			padding: 1.2rem 1rem;
			border-radius: 10px;
			font-size: 8pt;
		}
		.print-letterhead {
			flex-direction: column;
			gap: 6px;
		}
		.print-ref {
			text-align: left;
		}
	}
</style>
