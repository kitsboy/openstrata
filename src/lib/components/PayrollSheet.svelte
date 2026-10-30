<script lang="ts">
	/**
	 * The month’s payroll on one page, as the worksheet a treasurer remits from.
	 *
	 * The pay and the remittance are two different amounts and the page keeps them
	 * apart: what the employee takes home, what goes to the CRA, and what the
	 * building spends. The checks at the foot are arithmetic a reader can redo,
	 * not a sentence asking to be trusted. The rules live in `payroll-sheet`.
	 */
	import BrandMark from './BrandMark.svelte';
	import { copy, fill, formatDate, formatNumber, locale } from '$lib/i18n';
	import { money } from '$lib/demo/format';
	import { building } from '$lib/demo/building';
	import { docReference } from '$lib/documents';
	import type { PayrollSheet } from '$lib/payroll-sheet';

	let { sheet }: { sheet: PayrollSheet } = $props();

	const long = (iso: string) => formatDate(iso, $locale, { dateStyle: 'long' });
	const rate = (bps: number) =>
		formatNumber(bps / 100, $locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
	const status = (ok: boolean) => (ok ? $copy.payrollAgrees : $copy.payrollDiffers);

	/** The rows a reader can add up themselves; every one is derived, not typed. */
	const checks = $derived([
		{
			line: `${money(sheet.grossCents)} = ${formatNumber(sheet.hours, $locale)} × ${money(sheet.rateCents)}`,
			ok: sheet.grossMatches
		},
		{
			line: `${money(sheet.netCents)} + ${money(sheet.employeeDeductionsCents)} = ${money(sheet.grossCents)}`,
			ok: sheet.netMatches
		},
		{
			line: `${money(sheet.employeeDeductionsCents)} + ${money(sheet.employerCents)} = ${money(sheet.remittanceCents)}`,
			ok: sheet.remittanceMatches
		},
		{
			line: `6210 + 6215 = ${money(sheet.postedWagesCents + sheet.postedEmployerCents)}`,
			ok: sheet.wageLineAgrees && sheet.employerLineAgrees
		},
		{
			line: `EI × ${formatNumber(sheet.rates.eiEmployerMultiplier, $locale, { maximumFractionDigits: 1 })} · CPP =`,
			ok: sheet.employerEiMatches && sheet.employerCppMatches
		},
		{ line: `${sheet.dueFromPayDate}`, ok: sheet.dueMatches }
	]);
</script>

<article class="print-doc payroll-doc" aria-labelledby="payroll-title">
	<header class="print-letterhead">
		<div class="print-brand">
			<BrandMark size={28} />
			<div>
				<p class="print-org">{building.name}</p>
				<p class="print-org-line">{building.legalName}</p>
				<p class="print-org-line">{building.address}, {building.city}, {building.province} {building.postal}</p>
				<p class="print-org-line">Strata Plan {building.plan}</p>
			</div>
		</div>
		<dl class="print-ref">
			<dt>{$copy.payrollReference}</dt>
			<dd>{docReference('OS-PAY', sheet.payDate)}</dd>
			<dt>{$copy.payColDate}</dt>
			<dd>{sheet.payDate}</dd>
			<dt>{$copy.accColDue}</dt>
			<dd>{sheet.dueDate}</dd>
		</dl>
	</header>

	<div class="print-rule" aria-hidden="true"></div>

	<div class="print-title-block">
		<h1 id="payroll-title">{$copy.payrollTitle}</h1>
		<p class="print-subtitle">
			{fill($copy.payrollSubtitle, {
				period: sheet.periodLabel,
				employee: sheet.employee,
				role: sheet.role
			})}
		</p>
	</div>

	<div class="pay-cols">
		<section>
			<h2 class="pay-h2">{$copy.payrollPayHeading}</h2>
			<table class="pay-table">
				<tbody>
					<tr>
						<th scope="row">{$copy.payrollHoursLine}</th>
						<td class="num">{formatNumber(sheet.hours, $locale)} × {money(sheet.rateCents)}</td>
					</tr>
					<tr>
						<th scope="row">{$copy.payrollGross}</th>
						<td class="num">{money(sheet.grossCents)}</td>
					</tr>
					<tr>
						<th scope="row">{$copy.payrollEiEmployee}</th>
						<td class="num">−{money(sheet.eiEmployeeCents)}</td>
					</tr>
					<tr>
						<th scope="row">{$copy.payrollCppEmployee}</th>
						<td class="num">−{money(sheet.cppEmployeeCents)}</td>
					</tr>
					<tr class="total">
						<th scope="row">{$copy.payrollNet}</th>
						<td class="num">{money(sheet.netCents)}</td>
					</tr>
				</tbody>
			</table>
		</section>

		<section>
			<h2 class="pay-h2">{$copy.payrollRemitHeading}</h2>
			<table class="pay-table">
				<tbody>
					<tr>
						<th scope="row">{$copy.payrollEiEmployee}</th>
						<td class="num">{money(sheet.eiEmployeeCents)}</td>
					</tr>
					<tr>
						<th scope="row">{$copy.payrollCppEmployee}</th>
						<td class="num">{money(sheet.cppEmployeeCents)}</td>
					</tr>
					<tr>
						<th scope="row">{$copy.payrollEiEmployer}</th>
						<td class="num">{money(sheet.eiEmployerCents)}</td>
					</tr>
					<tr>
						<th scope="row">{$copy.payrollCppEmployer}</th>
						<td class="num">{money(sheet.cppEmployerCents)}</td>
					</tr>
					<tr class="total">
						<th scope="row">{$copy.payrollDueTotal}</th>
						<td class="num">{money(sheet.remittanceCents)}</td>
					</tr>
				</tbody>
			</table>
			<p class="pay-due">
				{fill($copy.payrollDueLine, { date: long(sheet.dueDate), days: formatNumber(sheet.daysToDue, $locale) })}
			</p>
		</section>
	</div>

	<h2 class="pay-h2">{$copy.payrollCostHeading}</h2>
	<p class="pay-cost">
		{fill($copy.payrollCostLine, {
			amount: money(sheet.costCents),
			wages: money(sheet.grossCents),
			employer: money(sheet.employerCents)
		})}
	</p>

	<h2 class="pay-h2">{$copy.payrollChecksHeading}</h2>
	<ul class="pay-checks">
		{#each checks as check}
			<li class:bad={!check.ok}>
				<span class="pay-check-line">{check.line}</span>
				<span class="pay-check-status">{status(check.ok)}</span>
			</li>
		{/each}
	</ul>
	<p class="pay-note">
		{fill($copy.payrollNoTax, { annual: money(sheet.annualisedCents) })}
	</p>

	<p class="pay-note">
		{#if sheet.rates.confirmed}
			{fill($copy.payrollRatesLine, { year: sheet.rates.rateYear })}
			{fill($copy.payrollRatesDetail, {
				ei: rate(sheet.rates.eiEmployeeBps),
				cpp: rate(sheet.rates.cppBps),
				exempt: money(sheet.rates.cppExemptCents)
			})}
		{:else}
			{fill($copy.payrollRatesLine, { year: sheet.rates.rateYear })}
			{fill($copy.payrollUnconfirmed, {
				ei: rate(sheet.rates.eiEmployeeBps),
				cpp: rate(sheet.rates.cppBps),
				exempt: money(sheet.rates.cppExemptCents)
			})}
		{/if}
	</p>

	<p class="print-note">
		{$copy.payrollBasis}
	</p>

	<footer class="print-foot">
		<p>{fill($copy.payrollFooter, { plan: building.plan })}</p>
	</footer>
</article>

<style>
	.payroll-doc {
		width: 100%;
		max-width: 52rem;
		margin: 0 auto;
		padding: 2rem 2.25rem 1.5rem;
		border: 1px solid #dfe4e8;
		border-radius: 14px;
		background: #ffffff;
		color: #14181c;
		font-family: Georgia, 'Times New Roman', serif;
		font-size: 9.6pt;
		line-height: 1.4;
		box-shadow: 0 24px 60px rgba(16, 45, 59, 0.16);
	}
	.print-letterhead {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1.25rem;
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
		font-size: 14pt;
		font-weight: 700;
		letter-spacing: -0.01em;
		line-height: 1.15;
	}
	.print-org-line {
		margin: 1px 0 0;
		color: #5a6672;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 7.5pt;
		letter-spacing: 0.02em;
	}
	.print-ref {
		margin: 0;
		text-align: right;
	}
	.print-ref dt {
		color: #5a6672;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 6.8pt;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}
	.print-ref dd {
		margin: 1px 0 4px;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 8.4pt;
		font-weight: 500;
	}
	.print-rule {
		height: 2px;
		margin: 12px 0;
		background: linear-gradient(90deg, #f0801a 0%, #f0801a 22%, #dfe4e8 22%, #dfe4e8 100%);
	}
	.print-title-block h1 {
		margin: 0;
		font-size: 18pt;
		font-weight: 700;
		letter-spacing: -0.015em;
		line-height: 1.1;
	}
	.print-subtitle {
		margin: 3px 0 0;
		color: #3f4a55;
		font-size: 9.2pt;
	}
	.pay-cols {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 10mm;
		margin-top: 10px;
	}
	.pay-h2 {
		margin: 11px 0 3px;
		font-size: 10.2pt;
		font-weight: 700;
	}
	.pay-cols .pay-h2 {
		margin-top: 0;
	}
	.pay-table {
		width: 100%;
		border-collapse: collapse;
		font-size: 8.8pt;
		table-layout: fixed;
	}
	.pay-table th,
	.pay-table td {
		padding: 2.5px 0;
		border-bottom: 1px solid #eceff2;
		text-align: left;
		vertical-align: bottom;
		overflow-wrap: anywhere;
	}
	.pay-table th {
		font-weight: 400;
	}
	.pay-table .num {
		text-align: right;
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}
	.pay-table .total th,
	.pay-table .total td {
		border-top: 1.5px solid #14181c;
		border-bottom: 0;
		font-weight: 700;
		padding-top: 4px;
	}
	.pay-due {
		margin: 4px 0 0;
		color: #4b5563;
		font-size: 8pt;
	}
	.pay-cost {
		margin: 0;
		font-size: 9.2pt;
	}
	.pay-checks {
		margin: 0;
		padding: 0;
		list-style: none;
		font-size: 8.2pt;
	}
	.pay-checks li {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		padding: 2px 0;
		border-bottom: 1px solid #eceff2;
	}
	.pay-check-line {
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 7.8pt;
		overflow-wrap: anywhere;
	}
	.pay-check-status {
		color: #3f6b46;
		white-space: nowrap;
	}
	.pay-checks li.bad .pay-check-status {
		color: #a12a2a;
		font-weight: 700;
	}
	.pay-note {
		margin: 7px 0 0;
		color: #4b5563;
		font-size: 8pt;
	}
	.print-note {
		margin: 10px 0 2px;
		padding: 5px 8px;
		border: 1px solid #e4d8c8;
		border-radius: 5px;
		background: #fdfaf5;
		color: #4b5563;
		font-size: 7.8pt;
	}
	.print-foot {
		margin-top: 8px;
		padding-top: 6px;
		border-top: 1px solid #dfe4e8;
		color: #5a6672;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 6.8pt;
		letter-spacing: 0.02em;
	}
	.print-foot p {
		margin: 0;
	}

	@media (max-width: 640px) {
		.payroll-doc {
			padding: 1.4rem 1.15rem;
			border-radius: 10px;
		}
		.print-letterhead {
			flex-direction: column;
			gap: 8px;
		}
		.print-ref {
			text-align: left;
		}
		.pay-cols {
			grid-template-columns: 1fr;
			gap: 0;
		}
		.pay-cols .pay-h2 {
			margin-top: 10px;
		}
	}
</style>
