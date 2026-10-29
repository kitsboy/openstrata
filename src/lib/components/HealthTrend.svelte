<script lang="ts">
	/**
	 * Six months of the compliance-health score, and the three inputs behind it.
	 *
	 * Nothing on this panel is a stored number. Each point is the gauge's own
	 * formula (`$lib/health`) run at that month's end over the charges, the lot
	 * register and the tracked deadlines — so the line and the gauge cannot
	 * disagree, and a reader can follow any point back to the records that made
	 * it. The three rows under the chart say what each input costs today, where
	 * it stood in the first month, and the month it moved.
	 *
	 * The chart is deliberately small: the number that matters is the last one,
	 * and the six columns are there to show which way it walked. Every column is
	 * a button, because a point on a chart that nobody can open is a claim with
	 * no working underneath it: clicking one lists the charges that were late at
	 * that month end and the lots whose Form K window had closed, from the same
	 * functions the score itself read.
	 */
	import { copy, fill, formatDate, formatNumber, locale } from '$lib/i18n';
	import { healthTrend, monthDetail, type MonthCharge } from '$lib/demo/health';
	import { money } from '$lib/demo/format';
	import { accountingHref } from '$lib/period-link';
	import type { FiledForms } from '$lib/form-k';
	import type { HealthKey, TrendPoint } from '$lib/health';
	import Icon from './Icon.svelte';

	/**
	 * `filed` is the Form Ks the reader has recorded on this device. The detail
	 * opened from a point is rebuilt with them, so a form filed after a month
	 * closed does not erase that month's gap from the list underneath it.
	 */
	let { rows = healthTrend(), filed = {} }: { rows?: TrendPoint[]; filed?: FiledForms } =
		$props();

	/** The period whose records are open under the chart, if any. */
	let open = $state<string | null>(null);

	/**
	 * Which cut of the charges the open month lists: everything still standing at
	 * that month end, or only the charges that carry a date in the month itself.
	 * The second cut answers the question the first one raises — how much of this
	 * is the month's own doing and how much was already owing when it opened.
	 */
	let cut = $state<'all' | 'month'>('all');

	/** The open point, so the detail can print the score that month scored. */
	const openRow = $derived(rows.find((row) => row.period === open) ?? null);
	const openDetail = $derived(openRow ? monthDetail(openRow.asOf, filed) : null);

	/** The rows the open cut lists, and their own total. */
	const shown = $derived(
		!openDetail ? [] : cut === 'month' ? openDetail.datedInMonth : openDetail.charges
	);
	const shownCents = $derived(
		!openDetail ? 0 : cut === 'month' ? openDetail.datedInMonthCents : openDetail.pastDueCents
	);

	/** A fee, a late fee, a fine or the levy — the words the ledger already uses. */
	function what(charge: MonthCharge): string {
		switch (charge.kind) {
			case 'fee':
				return fill($copy.lotSheetFee, { month: monthLong(charge.period ?? charge.due.slice(0, 7)) });
			case 'late':
				// The late fee that follows a given month's fee, dated the 5th.
				return fill($copy.lotSheetLate, { month: monthLong(charge.period ?? charge.due.slice(0, 7)) });
			case 'fine':
				return $copy.lotSheetFine;
			case 'levy':
				return $copy.lotSheetLevy;
		}
	}

	function toggle(period: string) {
		// A new month opens on the full list, so the total under the heading is the
		// same figure the point above it scored before any cut is applied.
		if (open !== period) cut = 'all';
		open = open === period ? null : period;
	}

	const labels = $derived<Record<HealthKey, string>>({
		deadlines: $copy.healthTrendDeadlines,
		arrears: $copy.healthTrendArrears,
		formK: $copy.healthTrendFormK
	});

	const first = $derived(rows[0]);
	const last = $derived(rows[rows.length - 1]);
	const moved = $derived(last.score - first.score);

	/** A fiscal period's month name in the reader's language. */
	function monthName(period: string): string {
		return formatDate(`${period}-01`, $locale, { month: 'short' });
	}

	function monthLong(period: string): string {
		return formatDate(`${period}-01`, $locale, { month: 'long' });
	}

	/** Bars take the gauge's own tones, so 56 reads as amber in both places. */
	function tone(score: number): string {
		return score >= 90 ? 'good' : score >= 70 ? 'fair' : score >= 50 ? 'watch' : 'bad';
	}

	interface InputRow {
		key: HealthKey;
		label: string;
		/** The points this input costs today, after its cap. */
		now: number;
		/** The same figure in the first month of the window. */
		then: number;
		/** Every month this input grew, oldest first. */
		grew: string[];
	}

	const inputs = $derived.by<InputRow[]>(() => {
		const keys: HealthKey[] = ['deadlines', 'arrears', 'formK'];
		return keys.map((key) => {
			const grew: string[] = [];
			rows.forEach((row, index) => {
				if (index > 0 && row.penalties[key] > rows[index - 1].penalties[key]) {
					grew.push(monthLong(row.period));
				}
			});
			return {
				key,
				label: labels[key],
				now: last.penalties[key],
				then: first.penalties[key],
				grew
			};
		});
	});
</script>

<section class="health-trend" id="health-trend" aria-labelledby="health-trend-title">
	<header class="trend-head">
		<div>
			<p class="trend-kicker">{$copy.complianceHealth}</p>
			<h2 id="health-trend-title">{$copy.healthTrendTitle}</h2>
			<p class="trend-lede">{$copy.healthTrendLede}</p>
		</div>
		<div class="trend-now">
			<span class="trend-score">{last.score}<i>/100</i></span>
			<span class:down={moved < 0} class="trend-moved">
				{moved < 0 ? '↘' : moved > 0 ? '↗' : '→'}
				{#if moved !== 0}{Math.abs(moved)}{/if}
				{fill($copy.healthTrendSince, { month: monthLong(first.period) })}
			</span>
		</div>
	</header>

	<div class="trend-grid">
		<ol class="trend-bars" aria-label={$copy.healthTrendTitle}>
			{#each rows as row (row.period)}
				<li>
					<button
						type="button"
						class="bar-button"
						class:chosen={open === row.period}
						aria-pressed={open === row.period}
						aria-label={fill($copy.healthTrendOpenMonth, { month: monthLong(row.period) })}
						onclick={() => toggle(row.period)}
					>
						<span class="bar-score">{row.score}</span>
						<span class="bar-track" aria-hidden="true">
							<i class={tone(row.score)} style={`height: ${row.score}%`}></i>
						</span>
						<span class="bar-month">{monthName(row.period)}</span>
					</button>
				</li>
			{/each}
		</ol>

		<ul class="trend-inputs">
			{#each inputs as input (input.key)}
				<li>
					<span class="input-name">{input.label}</span>
					<span class="input-now">
						<b>{input.then}</b>
						<span aria-hidden="true">→</span>
						<b>{input.now}</b>
					</span>
					<span class="input-move">
						{#if input.grew.length > 0}
							<Icon name="alert" class="h-3 w-3" />
							{fill($copy.healthTrendMoved, { months: input.grew.join(', ') })}
						{:else}
							<span class="flat">{$copy.healthTrendFlat}</span>
						{/if}
					</span>
				</li>
			{/each}
		</ul>
	</div>

	{#if openRow && openDetail}
		<section class="trend-detail" aria-label={monthLong(openRow.period)}>
			<header class="detail-head">
				<div>
					<h3>{monthLong(openRow.period)} {openRow.period.slice(0, 4)}</h3>
					<p class="detail-score">{openRow.score}<i>/100</i> · {$copy.healthTrendDeadlines} {openRow.penalties.deadlines} · {$copy.healthTrendArrears} {openRow.penalties.arrears} · {$copy.healthTrendFormK} {openRow.penalties.formK}</p>
				</div>
				<div class="detail-actions">
					<!-- The same book, in the ladder: the date goes with the link so the
					     accounting page ages at this month's end rather than today. -->
					<a class="detail-books" href={accountingHref(openRow.period)}>
						{$copy.healthTrendOpenBooks}<span aria-hidden="true">→</span>
					</a>
					<button type="button" class="detail-close" onclick={() => (open = null)}>
						{$copy.healthTrendClose}<span aria-hidden="true">×</span>
					</button>
				</div>
			</header>

			<div class="detail-grid">
				<div class="detail-block">
					<h4>
						{$copy.healthTrendCharges}
						<span class="detail-total">{$copy.accAgePastDue} {shown.length > 0 ? money(shownCents) : '—'}</span>
					</h4>
					{#if openDetail.charges.length > 0}
						<div class="detail-cut" role="group" aria-label={$copy.healthTrendCharges}>
							<button
								type="button"
								class="cut-button"
								class:chosen={cut === 'all'}
								aria-pressed={cut === 'all'}
								onclick={() => (cut = 'all')}
								>{fill($copy.healthTrendCutAll, { n: formatNumber(openDetail.charges.length, $locale) })}</button
							>
							<button
								type="button"
								class="cut-button"
								class:chosen={cut === 'month'}
								aria-pressed={cut === 'month'}
								onclick={() => (cut = 'month')}
								>{fill($copy.healthTrendCutMonth, {
									month: monthName(openRow.period),
									n: formatNumber(openDetail.datedInMonth.length, $locale)
								})}</button
							>
						</div>
					{/if}
					{#if shown.length === 0}
						<p class="detail-empty">
							{cut === 'month'
								? fill($copy.healthTrendNoDated, { month: monthLong(openRow.period) })
								: $copy.healthTrendNoCharges}
						</p>
					{:else}
						<ul class="detail-list">
							{#each shown as charge (charge.unitId + charge.due + charge.kind)}
								<li>
									<a href={`/units/${charge.unitId}`}>{$copy.payLot} {charge.unitId}</a>
									<span class="detail-what">{what(charge)}</span>
									<time datetime={charge.due}>{formatDate(charge.due, $locale, { day: 'numeric', month: 'short', year: 'numeric' })}</time>
									<b>{money(charge.cents)}</b>
									<span class="detail-late">{formatNumber(charge.daysLate, $locale)} {$copy.deadlinesDays}</span>
								</li>
							{/each}
						</ul>
					{/if}
				</div>

				<div class="detail-block">
					<h4>
						{$copy.healthTrendFormK}
						{#if openDetail.formK.length > 0}<span class="detail-total">{openDetail.formK.length}</span>{/if}
					</h4>
					{#if openDetail.formK.length === 0}
						<p class="detail-empty">{$copy.healthTrendNoFormK}</p>
					{:else}
						<ul class="detail-list">
							{#each openDetail.formK as gap (gap.unitId)}
								<li>
									<!-- The gap is only a claim until the reader can see the tenancy date
									     and the window that closed: the anchor opens the forms card. -->
									<a href={`/units/${gap.unitId}#forms`}>{$copy.payLot} {gap.unitId}</a>
									<span class="detail-what">{fill($copy.unitsTenantSince, { date: formatDate(gap.tenantSince, $locale, { day: 'numeric', month: 'short', year: 'numeric' }) })}</span>
									<span class="detail-late">{fill($copy.healthTrendPastWindow, { days: formatNumber(gap.daysPastWindow, $locale) })}</span>
								</li>
							{/each}
						</ul>
					{/if}
				</div>
			</div>
		</section>
	{/if}

	<p class="trend-note">{$copy.healthTrendNote}</p>
</section>

<style>
	.health-trend {
		position: relative;
		margin-bottom: 18px;
		padding: 20px 22px 16px;
		border: 1px solid var(--line);
		border-radius: 16px;
		background: var(--paper);
	}
	.trend-head {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-start;
		justify-content: space-between;
		gap: 14px;
	}
	.trend-kicker {
		font-size: 10px;
		font-weight: 800;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--brand-text);
	}
	.trend-head h2 {
		margin-top: 3px;
		font-size: 19px;
		font-weight: 800;
		letter-spacing: -0.01em;
		color: var(--ink);
	}
	.trend-lede {
		max-width: 58ch;
		margin-top: 4px;
		font-size: 12.5px;
		line-height: 1.55;
		color: var(--muted);
	}
	.trend-now {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 2px;
	}
	.trend-score {
		font-size: 34px;
		font-weight: 900;
		line-height: 1;
		color: var(--ink);
	}
	.trend-score i {
		font-size: 12px;
		font-style: normal;
		font-weight: 700;
		color: var(--muted);
	}
	.trend-moved {
		font-family: 'DM Mono', monospace;
		font-size: 10px;
		font-weight: 700;
		color: var(--success-text);
	}
	.trend-moved.down {
		color: var(--warning-text);
	}

	.trend-grid {
		display: grid;
		grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
		gap: 22px;
		margin-top: 16px;
	}
	.trend-bars {
		display: flex;
		align-items: flex-end;
		gap: 8px;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.trend-bars li {
		display: flex;
		min-width: 0;
		flex: 1;
	}
	.bar-button {
		display: flex;
		width: 100%;
		min-width: 0;
		flex-direction: column;
		align-items: center;
		gap: 4px;
		padding: 4px 2px 2px;
		border: 1px solid transparent;
		border-radius: 9px;
		background: transparent;
		color: inherit;
		font: inherit;
		cursor: pointer;
	}
	.bar-button:hover {
		border-color: var(--line);
		background: var(--color-surface-3);
	}
	.bar-button.chosen {
		border-color: var(--ink);
		background: var(--color-surface-3);
	}
	.bar-button:focus-visible {
		outline: 2px solid var(--brand-text);
		outline-offset: 2px;
	}
	.bar-score {
		font-family: 'DM Mono', monospace;
		font-size: 11px;
		font-weight: 700;
		color: var(--ink);
	}
	.bar-track {
		display: flex;
		align-items: flex-end;
		width: 100%;
		height: 84px;
		overflow: hidden;
		border-radius: 6px;
		background: var(--color-surface-3);
	}
	.bar-track i {
		display: block;
		width: 100%;
		border-radius: 6px 6px 0 0;
		background: var(--purple);
	}
	.bar-track i.good {
		background: var(--success-text);
	}
	.bar-track i.fair {
		background: var(--brand-text);
	}
	.bar-track i.watch {
		background: var(--warning-text);
	}
	.bar-track i.bad {
		background: var(--danger-text);
	}
	.bar-month {
		font-size: 10px;
		font-weight: 600;
		color: var(--muted);
	}

	.trend-inputs {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.trend-inputs li {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		gap: 2px 10px;
		padding: 8px 10px;
		border: 1px solid var(--line);
		border-radius: 10px;
		background: var(--color-surface-3);
	}
	.input-name {
		font-size: 12px;
		font-weight: 700;
		color: var(--ink);
	}
	.input-now {
		display: flex;
		align-items: center;
		gap: 4px;
		font-family: 'DM Mono', monospace;
		font-size: 11px;
		color: var(--muted);
	}
	.input-now b {
		font-weight: 700;
		color: var(--ink);
	}
	.input-move {
		grid-column: 1 / -1;
		display: flex;
		align-items: center;
		gap: 4px;
		font-size: 10.5px;
		color: var(--warning-text);
	}
	.input-move .flat {
		color: var(--muted);
	}
	.trend-detail {
		margin-top: 16px;
		padding-top: 14px;
		border-top: 1px solid var(--line);
	}
	.detail-head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 12px;
	}
	.detail-head h3 {
		font-size: 15px;
		font-weight: 800;
		color: var(--ink);
	}
	.detail-score {
		margin-top: 2px;
		font-family: 'DM Mono', monospace;
		font-size: 10px;
		font-weight: 600;
		color: var(--muted);
	}
	.detail-score i {
		font-style: normal;
	}
	.detail-actions {
		display: flex;
		align-items: center;
		gap: 6px;
	}
	.detail-books {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		padding: 3px 10px;
		border: 1px solid var(--line);
		border-radius: 8px;
		background: var(--color-surface-3);
		color: var(--brand-text);
		font-size: 10px;
		font-weight: 800;
		text-decoration: none;
		white-space: nowrap;
	}
	.detail-books:hover {
		border-color: var(--brand-text);
	}
	.detail-close {
		display: inline-flex;
		align-items: center;
		gap: 5px;
		padding: 3px 9px;
		border: 1px solid var(--line);
		border-radius: 8px;
		background: var(--paper);
		color: var(--muted);
		font-size: 10px;
		font-weight: 700;
		cursor: pointer;
	}
	.detail-close:hover {
		color: var(--ink);
		border-color: var(--ink);
	}
	.detail-grid {
		display: grid;
		grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr);
		gap: 18px;
		margin-top: 12px;
	}
	.detail-block h4 {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 8px;
		padding-bottom: 5px;
		border-bottom: 1px solid var(--line);
		font-size: 10px;
		font-weight: 800;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--muted);
	}
	.detail-total {
		font-family: 'DM Mono', monospace;
		letter-spacing: 0;
		text-transform: none;
		color: var(--ink);
	}
	.detail-cut {
		display: flex;
		gap: 4px;
		margin: 6px 0 2px;
	}
	.cut-button {
		padding: 2px 8px;
		border: 1px solid var(--line);
		border-radius: 999px;
		background: transparent;
		color: var(--muted);
		font-family: inherit;
		font-size: 10px;
		font-weight: 700;
		cursor: pointer;
	}
	.cut-button:hover {
		color: var(--ink);
	}
	.cut-button.chosen {
		border-color: var(--ink);
		color: var(--ink);
		background: var(--color-surface-3);
	}
	.cut-button:focus-visible {
		outline: 2px solid var(--brand-text);
		outline-offset: 2px;
	}
	.detail-list {
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.detail-list li {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr) auto;
		align-items: baseline;
		gap: 2px 8px;
		padding: 6px 0;
		border-bottom: 1px solid var(--line);
		font-size: 11px;
		color: var(--muted);
	}
	.detail-list a {
		font-weight: 700;
		color: var(--ink);
		text-decoration: none;
		border-bottom: 1px solid var(--line);
		white-space: nowrap;
	}
	.detail-list a:hover {
		border-color: var(--ink);
	}
	.detail-what {
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.detail-list time {
		font-family: 'DM Mono', monospace;
		font-size: 10px;
		color: var(--faint);
		white-space: nowrap;
	}
	.detail-list b {
		/* Second row, under the description: the figure is the point of the row and
		   sits where the eye finishes, not squeezed between two labels. */
		grid-column: 2;
		justify-self: end;
		font-family: 'DM Mono', monospace;
		font-size: 11px;
		color: var(--ink);
		white-space: nowrap;
	}
	.detail-late {
		grid-column: 3;
		justify-self: end;
		font-family: 'DM Mono', monospace;
		font-size: 10px;
		color: var(--warning-text);
		white-space: nowrap;
	}
	.detail-empty {
		padding: 8px 0;
		font-size: 11px;
		color: var(--muted);
	}
	.trend-note {
		margin-top: 14px;
		padding-top: 10px;
		border-top: 1px solid var(--line);
		font-size: 10.5px;
		line-height: 1.5;
		color: var(--muted);
	}

	@media (max-width: 900px) {
		.trend-grid,
		.detail-grid {
			grid-template-columns: minmax(0, 1fr);
		}
		.health-trend {
			padding: 16px 14px 12px;
		}
	}
</style>
