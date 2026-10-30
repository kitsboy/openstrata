<script lang="ts">
	/**
	 * The building’s insurance on one page: the premium against the budget line,
	 * the two deductibles, and the dates a council has to act on.
	 *
	 * The earthquake deductible is printed as the formula the policy uses, not as
	 * a number, because these books carry no insured value. The sheet says that
	 * rather than inventing one. The arithmetic and the checks live in
	 * `insurance-summary`.
	 */
	import BrandMark from './BrandMark.svelte';
	import { copy, fill, formatDate, formatNumber, locale } from '$lib/i18n';
	import { money } from '$lib/demo/format';
	import { building } from '$lib/demo/building';
	import { docReference } from '$lib/documents';
	import type { InsuranceSummary } from '$lib/insurance-summary';

	let { summary }: { summary: InsuranceSummary } = $props();

	const long = (iso: string) => formatDate(iso, $locale, { dateStyle: 'long' });
	const percent = (bps: number) =>
		formatNumber(bps / 100, $locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
	const days = (n: number) =>
		n >= 0
			? fill($copy.insuranceDaysAhead, { days: formatNumber(n, $locale) })
			: fill($copy.insuranceDaysPast, { days: formatNumber(-n, $locale) });
</script>

<article class="print-doc insurance-doc" aria-labelledby="insurance-title">
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
			<dt>{$copy.hearingNoticeReference}</dt>
			<dd>{docReference('OS-INS', summary.termStart)}</dd>
			<dt>{$copy.insuranceTerm}</dt>
			<dd>{summary.termStart} – {summary.termEnd}</dd>
			<dt>{$copy.insuranceRenewal}</dt>
			<dd>{summary.renewalIso}</dd>
		</dl>
	</header>

	<div class="print-rule" aria-hidden="true"></div>

	<div class="print-title-block">
		<h1 id="insurance-title">{$copy.insuranceTitle}</h1>
		<p class="print-subtitle">
			{fill($copy.insuranceSubtitle, {
				policy: summary.policy,
				broker: summary.broker,
				term: `${summary.termStart} – ${summary.termEnd}`
			})}
		</p>
	</div>

	<h2 class="ins-h2">{$copy.insurancePremium}</h2>
	<table class="ins-table">
		<tbody>
			<tr>
				<th scope="row">{$copy.insurancePremium}</th>
				<td class="num">{money(summary.premiumCents)}</td>
			</tr>
			<tr>
				<th scope="row">{$copy.insuranceMonthly}</th>
				<td class="num">{money(summary.monthlyCents)}</td>
			</tr>
			<tr>
				<th scope="row">{$copy.insuranceExpensed}</th>
				<td class="num">{money(summary.expensedYtdCents)}</td>
			</tr>
			<tr class="total">
				<th scope="row">{$copy.accColAnnualBudget}</th>
				<td class="num">{money(summary.budgetAnnualCents)}</td>
			</tr>
		</tbody>
	</table>
	<p class="ins-check" class:bad={!summary.premiumMatchesBudget}>
		{#if summary.premiumMatchesBudget}
			{$copy.insurancePremiumOk}
		{:else}
			{fill($copy.insurancePremiumOff, {
				difference: money(Math.abs(summary.premiumCents - summary.budgetAnnualCents))
			})}
		{/if}
	</p>
	<p class="ins-check" class:bad={!summary.accrualMatches}>
		{#if summary.accrualMatches}
			{fill($copy.insuranceAccrualOk, {
				months: formatNumber(summary.accruedCents / summary.monthlyCents, $locale),
				amount: money(summary.accruedCents)
			})}
		{:else}
			{fill($copy.insuranceAccrualOff, {
				difference: money(Math.abs(summary.accruedCents - summary.expensedYtdCents))
			})}
		{/if}
	</p>

	<h2 class="ins-h2">{$copy.insuranceDeductibles}</h2>
	<table class="ins-table">
		<tbody>
			<tr>
				<th scope="row">{$copy.insuranceWater}</th>
				<td class="num">{money(summary.waterDeductibleCents)}</td>
			</tr>
			<tr>
				<th scope="row">{$copy.insuranceQuake}</th>
				<td class="num">
					{#if summary.quakeDeductibleCents === null}
						{percent(summary.quakeRateBps)}%
					{:else}
						{money(summary.quakeDeductibleCents)}
					{/if}
				</td>
			</tr>
		</tbody>
	</table>
	<p class="ins-note">
		{#if summary.quakeDeductibleCents === null}
			{fill($copy.insuranceQuakeRule, {
				rate: `${percent(summary.quakeRateBps)}%`,
				minimum: money(summary.quakeMinimumCents)
			})}
		{:else}
			{fill($copy.insuranceQuakeFigure, {
				value: money(summary.insuredValueCents ?? 0),
				amount: money(summary.quakeDeductibleCents)
			})}
			{fill($copy.insuranceQuakeRule, {
				rate: `${percent(summary.quakeRateBps)}%`,
				minimum: money(summary.quakeMinimumCents)
			})}
		{/if}
	</p>

	<h2 class="ins-h2">{$copy.insuranceDates}</h2>
	<dl class="ins-dates">
		<dt>{$copy.insuranceAppraisal}</dt>
		<dd>{long(summary.appraisalIso)} — {days(summary.daysToAppraisal)}</dd>
		<dt>{$copy.insuranceRenewal}</dt>
		<dd>{long(summary.renewalIso)} — {days(summary.daysToRenewal)}</dd>
		<dt>{$copy.insuranceTerm}</dt>
		<dd>{summary.termStart} – {summary.termEnd} · {formatNumber(summary.termDays, $locale)}</dd>
	</dl>
	<p class="ins-check" class:bad={!summary.appraisalBeforeRenewal}>
		{summary.appraisalBeforeRenewal ? $copy.insuranceOrderOk : $copy.insuranceOrderOff}
	</p>
	<p class="ins-check" class:bad={!summary.termEndsOnFiscalEnd}>
		{summary.termEndsOnFiscalEnd ? $copy.insuranceTermOk : $copy.insuranceTermOff}
	</p>

	<h2 class="ins-h2">{$copy.insuranceCost}</h2>
	<p class="ins-cost">
		{fill($copy.insuranceCostLine, {
			amount: money(summary.perLotMonthCents),
			lots: formatNumber(building.lots, $locale)
		})}
	</p>

	<p class="print-note">{$copy.insuranceBasis}</p>

	<footer class="print-foot">
		<p>{fill($copy.insuranceFooter, { plan: building.plan })}</p>
	</footer>
</article>

<style>
	.insurance-doc {
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
	.ins-h2 {
		margin: 12px 0 3px;
		font-size: 10.2pt;
		font-weight: 700;
	}
	.ins-table {
		width: 100%;
		max-width: 105mm;
		border-collapse: collapse;
		font-size: 9pt;
		table-layout: fixed;
	}
	.ins-table th,
	.ins-table td {
		padding: 2.5px 0;
		border-bottom: 1px solid #eceff2;
		text-align: left;
		overflow-wrap: anywhere;
	}
	.ins-table th {
		font-weight: 400;
	}
	.ins-table .num {
		text-align: right;
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}
	.ins-table .total th,
	.ins-table .total td {
		border-top: 1.5px solid #14181c;
		border-bottom: 0;
		font-weight: 700;
		padding-top: 4px;
	}
	.ins-check {
		margin: 4px 0 0;
		color: #3f6b46;
		font-size: 8.2pt;
	}
	.ins-check.bad {
		color: #a12a2a;
		font-weight: 600;
	}
	.ins-note {
		margin: 4px 0 0;
		color: #4b5563;
		font-size: 8.2pt;
	}
	.ins-dates {
		display: grid;
		grid-template-columns: 34mm 1fr;
		gap: 2px 10px;
		margin: 0;
		font-size: 9pt;
	}
	.ins-dates dt {
		color: #5a6672;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 7.2pt;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		padding-top: 1px;
	}
	.ins-dates dd {
		margin: 0;
	}
	.ins-cost {
		margin: 0;
		font-size: 9.4pt;
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
		.insurance-doc {
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
		.ins-table {
			max-width: none;
		}
		.ins-dates {
			grid-template-columns: 28mm 1fr;
		}
	}
</style>
