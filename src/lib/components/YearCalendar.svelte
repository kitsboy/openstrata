<script lang="ts">
	/**
	 * The fiscal year as one printed wall chart.
	 *
	 * The calendar page is a month view: one month at a time, with a list beside
	 * it. A council pinning the year to the wall needs the other shape — twelve
	 * months in one grid, the statutory windows shaded, and every dated item
	 * listed underneath so nothing is only a dot. Both are built from the same
	 * schedule, so a date cannot be on one and missing from the other.
	 *
	 * Paper values, not theme tokens: dark mode cannot change what a council pins
	 * up. The arithmetic lives in `year-calendar.ts`.
	 */
	import { copy, fill, formatDate, formatNumber, locale } from '$lib/i18n';
	import { building } from '$lib/demo/building';
	import type { CalCategory } from '$lib/demo/schedule';
	import type { CalendarRow, WindowId, YearCalendar } from '$lib/year-calendar';

	let { calendar }: { calendar: YearCalendar } = $props();

	const DAY_COLUMNS = 31;

	const windowLabel = $derived<Record<WindowId, string>>({
		payroll: $copy.yearCalWindowPayroll,
		epr: $copy.yearCalWindowEpr,
		t2: $copy.yearCalWindowT2,
		svt: $copy.yearCalWindowSvt,
		t4: $copy.yearCalWindowT4,
		agm: $copy.yearCalWindowAgm
	});

	const windowRule = $derived<Record<WindowId, string>>({
		payroll: $copy.yearCalWindowPayrollRule,
		epr: $copy.yearCalWindowEprRule,
		t2: $copy.yearCalWindowT2Rule,
		svt: $copy.yearCalWindowSvtRule,
		t4: $copy.yearCalWindowT4Rule,
		agm: $copy.yearCalAfterRule
	});

	const categoryLabel = $derived<Record<CalCategory, string>>({
		fees: $copy.calCatFees,
		council: $copy.calCatCouncil,
		cra: $copy.calCatCra,
		'bc-tax': $copy.calCatBcTax,
		maintenance: $copy.calCatMaintenance,
		insurance: $copy.calCatInsurance,
		compliance: $copy.calCatCompliance,
		payroll: $copy.calCatPayroll
	});

	function monthLabel(row: CalendarRow): string {
		const date = `${row.month.year}-${String(row.month.month).padStart(2, '0')}-01`;
		return `${formatDate(date, $locale, { month: 'short' })} ${formatNumber(row.month.year, $locale, { useGrouping: false })}`;
	}

	/** A day cell's shading: a fill for the long windows, a bar for payroll. */
	function cellClass(windows: WindowId[]): string {
		const classes = ['cell'];
		if (windows.includes('epr')) classes.push('w-epr');
		if (windows.includes('svt')) classes.push('w-svt');
		if (windows.includes('payroll')) classes.push('w-payroll');
		if (windows.includes('t2') || windows.includes('t4')) classes.push('deadline');
		return classes.join(' ');
	}

	function shortDate(iso: string): string {
		return formatDate(iso, $locale, { day: 'numeric', month: 'short' });
	}

	function longDate(iso: string): string {
		return formatDate(iso, $locale, { day: 'numeric', month: 'short', year: 'numeric' });
	}

	const afterWindow = $derived(calendar.afterWindows[0]);
	const windowCount = $derived(calendar.windows.length);
	// The subtitle counts the year's own items; the AGM section counts its own.
	const itemCount = $derived(calendar.items.length);
</script>

<article class="print-doc year-cal-doc" aria-labelledby="year-cal-title">
	<header class="print-letterhead">
		<div class="print-brand">
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
		<h1 id="year-cal-title">{$copy.yearCalTitle}</h1>
		<p class="print-subtitle">
			{fill($copy.yearCalSubtitle, {
				fiscal: building.fiscalLabel,
				months: formatNumber(calendar.rows.length, $locale),
				days: formatNumber(calendar.days, $locale),
				windows: formatNumber(windowCount, $locale),
				items: formatNumber(itemCount, $locale)
			})}
		</p>
	</div>

	<p class="print-p year-cal-note">{$copy.yearCalGridNote}</p>

	<table class="year-grid">
		<thead>
			<tr>
				<th class="month" scope="col"><span class="sr-note">{$copy.yearCalMonth}</span></th>
				{#each Array.from({ length: DAY_COLUMNS }, (_, index) => index + 1) as day (day)}
					<th class="day" scope="col">{formatNumber(day, $locale, { useGrouping: false })}</th>
				{/each}
			</tr>
		</thead>
		{#each calendar.rows as row (monthLabel(row))}
			<tbody>
				<tr>
					<th class="month" scope="row">{monthLabel(row)}</th>
					{#each row.cells as cell (cell.iso)}
						<td class="{cellClass(cell.windows)} {cell.items > 0 ? 'has-item' : ''}">
							<span class="digit">{formatNumber(cell.day, $locale, { useGrouping: false })}</span>
						</td>
					{/each}
					{#each Array.from({ length: DAY_COLUMNS - row.cells.length }, (_, index) => index)}
						<td class="cell blank"></td>
					{/each}
				</tr>
			</tbody>
		{/each}
	</table>

	<ul class="legend" aria-label={$copy.yearCalLegend}>
		<li><span class="swatch bar" aria-hidden="true"></span>{windowLabel.payroll}</li>
		<li><span class="swatch epr" aria-hidden="true"></span>{windowLabel.epr}</li>
		<li><span class="swatch svt" aria-hidden="true"></span>{windowLabel.svt}</li>
		<li><span class="swatch due" aria-hidden="true"></span>{$copy.yearCalLegendDeadline}</li>
		<li><span class="swatch dot" aria-hidden="true"></span>{$copy.yearCalLegendItem}</li>
	</ul>

	<section class="year-cal-section">
		<h2 class="print-h2">{$copy.yearCalWindows}</h2>
		<table class="windows">
			<tbody>
				{#each calendar.windows as window (window.id)}
					<tr>
						<th scope="row">
							<span class="window-name">{windowLabel[window.id]}</span>
							<span class="window-dates">
								{#if window.count > 1}
									{fill($copy.yearCalWindowEach, {
										from: longDate(window.from),
										to: longDate(window.to),
										count: formatNumber(window.count, $locale),
										days: formatNumber(window.daysEach, $locale)
									})}
								{:else}
									{longDate(window.from)}{window.from === window.to ? '' : ` – ${longDate(window.to)}`}
								{/if}
							</span>
						</th>
						<td>
							<span class="window-rule">{windowRule[window.id]}</span>
							<!-- Only a window the year cannot hold needs the count: the EPR opens in
							     January, so 275 of its 365 days fall inside this fiscal year. A
							     deadline that is all inside the year says nothing extra. -->
							{#if window.count === 1 && window.days !== window.daysEach}
								<span class="window-days">
									{fill($copy.yearCalDaysIn, {
										days: formatNumber(window.days, $locale),
										total: formatNumber(window.daysEach, $locale)
									})}
								</span>
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</section>

	<section class="year-cal-section after">
		<h2 class="print-h2">{$copy.yearCalAfter}</h2>
		{#if afterWindow}
			<p class="after-line">
				<strong>{windowLabel.agm}</strong> · {longDate(afterWindow.from)} – {longDate(afterWindow.to)} ·
				{fill($copy.yearCalDaysEach, { days: formatNumber(afterWindow.daysEach, $locale) })}
			</p>
		{/if}
		<p class="window-rule">{$copy.yearCalAfterRule}</p>
		<table class="year-grid after-grid">
			<thead>
				<tr>
					<th class="month" scope="col"></th>
					{#each Array.from({ length: DAY_COLUMNS }, (_, index) => index + 1) as day (day)}
						<th class="day" scope="col">{formatNumber(day, $locale, { useGrouping: false })}</th>
					{/each}
				</tr>
			</thead>
			{#each calendar.afterRows as row (monthLabel(row))}
				<tbody>
					<tr>
						<th class="month" scope="row">{monthLabel(row)}</th>
						{#each row.cells as cell (cell.iso)}
							<td class="{cellClass(cell.windows)}">{formatNumber(cell.day, $locale, { useGrouping: false })}</td>
						{/each}
						{#each Array.from({ length: DAY_COLUMNS - row.cells.length }, (_, index) => index)}
							<td class="cell blank"></td>
						{/each}
					</tr>
				</tbody>
			{/each}
		</table>
	</section>

	<section class="year-cal-section">
		<h2 class="print-h2">{fill($copy.yearCalItems, { count: formatNumber(calendar.items.length, $locale) })}</h2>
		<ul class="items">
			{#each calendar.items as item (item.date + item.title)}
				<li>
					<span class="item-date">{shortDate(item.date)}</span>
					<span class="item-cat">{categoryLabel[item.category]}</span>
					<span class="item-title">{item.title}</span>
				</li>
			{/each}
		</ul>
	</section>

	{#if calendar.afterItems.length > 0}
		<section class="year-cal-section">
			<h2 class="print-h2">{fill($copy.yearCalAfterItems, { count: formatNumber(calendar.afterItems.length, $locale) })}</h2>
			<ul class="items">
				{#each calendar.afterItems as item (item.date + item.title)}
					<li>
						<span class="item-date">{longDate(item.date)}</span>
						<span class="item-cat">{categoryLabel[item.category]}</span>
						<span class="item-title">{item.title}</span>
					</li>
				{/each}
			</ul>
		</section>
	{/if}

	<p class="print-basis">{$copy.yearCalRhythm}</p>

	<footer class="print-foot">
		<p>{fill($copy.yearCalFooter, { plan: building.plan })}</p>
	</footer>
</article>

<style>
	.year-cal-doc {
		width: 100%;
		max-width: 52rem;
		margin: 0 auto;
		padding: 1.5rem 1.9rem 1.1rem;
		border: 1px solid #dfe4e8;
		border-radius: 14px;
		background: #ffffff;
		color: #14181c;
		font-family: Georgia, 'Times New Roman', serif;
		font-size: 8.2pt;
		line-height: 1.3;
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
	.print-org {
		margin: 0;
		font-size: 13pt;
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
		/* The fiscal year and the statement date are long values; on the paper they
		   wrap inside their column rather than pushing past the right edge. */
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
		font-size: 7.4pt;
		overflow-wrap: anywhere;
	}
	.print-rule {
		height: 2px;
		margin: 8px 0;
		background: linear-gradient(90deg, #f0801a 0%, #f0801a 22%, #dfe4e8 22%, #dfe4e8 100%);
	}
	.print-title-block h1 {
		margin: 0;
		font-size: 15pt;
		font-weight: 700;
		letter-spacing: -0.015em;
		line-height: 1.1;
	}
	.print-subtitle {
		margin: 2px 0 0;
		color: #3f4a55;
		font-size: 8.2pt;
	}
	.year-cal-note {
		margin: 4px 0 5px;
		color: #3f4a55;
		font-size: 7pt;
		line-height: 1.35;
	}
	.year-grid {
		width: 100%;
		border-collapse: collapse;
		table-layout: fixed;
	}
	.year-grid th,
	.year-grid td {
		padding: 0;
		border: 1px solid #eef2f3;
	}
	.year-grid thead th.day {
		height: 3.6mm;
		color: #6b7780;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 4.8pt;
		font-weight: 500;
		text-align: center;
	}
	.year-grid th.month {
		width: 15mm;
		padding-right: 2mm;
		background: #f7f9fa;
		color: #3f4a55;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 5.4pt;
		font-weight: 600;
		letter-spacing: 0.02em;
		text-align: right;
		white-space: nowrap;
	}
	.year-grid td.cell {
		height: 4.5mm;
		color: #5a6672;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 4.8pt;
		text-align: center;
		vertical-align: middle;
	}
	.year-grid td.blank {
		background: #fbfcfd;
		border-color: #f4f7f8;
	}
	/* The long windows are fills; payroll is a bar, so the two can share a day. */
	.year-grid td.w-epr {
		background: #f9edda;
	}
	.year-grid td.w-svt {
		background: #e6f0e6;
	}
	.year-grid td.w-payroll {
		box-shadow: inset 0 1.4mm 0 0 #cfdde6;
	}
	.year-grid td.deadline {
		background: #2f3a42;
		color: #ffffff;
		font-weight: 700;
	}
	.year-grid td.deadline.w-epr,
	.year-grid td.deadline.w-svt {
		background: #2f3a42;
	}
	.year-grid td.has-item .digit {
		border-bottom: 0.9mm solid #f0801a;
		padding-bottom: 0.3mm;
	}
	.legend {
		display: flex;
		flex-wrap: wrap;
		gap: 1.5mm 4mm;
		margin: 4px 0 0;
		padding: 0;
		list-style: none;
		color: #3f4a55;
		font-size: 6.2pt;
	}
	.legend li {
		display: flex;
		align-items: center;
		gap: 1.4mm;
	}
	.swatch {
		display: inline-block;
		width: 4mm;
		height: 2.4mm;
		border: 1px solid #dfe4e8;
	}
	.swatch.bar {
		background: #ffffff;
		box-shadow: inset 0 1mm 0 0 #cfdde6;
	}
	.swatch.epr {
		background: #f9edda;
	}
	.swatch.svt {
		background: #e6f0e6;
	}
	.swatch.due {
		background: #2f3a42;
		border-color: #2f3a42;
	}
	.swatch.dot {
		width: 2.4mm;
		border: 0;
		border-bottom: 0.9mm solid #f0801a;
	}
	.year-cal-section {
		margin-top: 5px;
	}
	.print-h2 {
		margin: 6px 0 2px;
		font-size: 8pt;
		font-weight: 700;
		letter-spacing: 0.03em;
		text-transform: uppercase;
	}
	.windows {
		width: 100%;
		border-collapse: collapse;
		table-layout: fixed;
		font-size: 6.6pt;
	}
	.windows th,
	.windows td {
		padding: 1.4px 4px 1.4px 0;
		border-bottom: 1px solid #eef2f3;
		text-align: left;
		vertical-align: top;
	}
	.windows th {
		width: 40%;
		font-weight: 600;
	}
	.window-name {
		display: block;
	}
	.window-dates,
	.window-days {
		display: block;
		color: #5a6672;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 6pt;
	}
	.window-rule {
		display: block;
		color: #3f4a55;
	}
	.after-line {
		margin: 0 0 1px;
		font-size: 7pt;
	}
	.after-grid {
		margin-top: 2px;
	}
	.after-grid td.cell.w-agm,
	.after-grid td.cell {
		background: #f3e3cd;
	}
	.items {
		margin: 0;
		padding: 0;
		list-style: none;
		columns: 2;
		column-gap: 6mm;
		font-size: 6.6pt;
	}
	.items li {
		break-inside: avoid;
		padding: 0.6px 0;
	}
	.item-date {
		display: inline-block;
		width: 17mm;
		color: #3f4a55;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 6.2pt;
	}
	.item-cat {
		display: inline-block;
		width: 22mm;
		color: #6b7780;
		font-size: 6pt;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}
	.print-basis {
		margin: 5px 0 0;
		color: #5a6672;
		font-size: 6.4pt;
		line-height: 1.35;
	}
	.print-foot {
		margin-top: 4px;
		padding-top: 3px;
		border-top: 1px solid #dfe4e8;
		color: #5a6672;
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 6.2pt;
		letter-spacing: 0.02em;
	}
	.print-foot p {
		margin: 0;
	}
	.sr-note {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
	}

	@media (max-width: 640px) {
		.year-cal-doc {
			padding: 1.1rem 0.9rem;
			border-radius: 10px;
		}
		.print-letterhead {
			flex-direction: column;
			gap: 6px;
		}
		.print-ref {
			text-align: left;
		}
		.items {
			columns: 1;
		}
	}
</style>
