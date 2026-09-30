<script lang="ts">
	type DataPoint = { label: string; value: number; color?: string };

	let {
		data,
		height = 160,
		barColor = '#14b8a6',
		secondaryColor = '#f7931a',
		showSecondary = false
	}: {
		data: Array<DataPoint & { value2?: number }>;
		height?: number;
		barColor?: string;
		secondaryColor?: string;
		showSecondary?: boolean;
	} = $props();

	const maxVal = $derived(Math.max(...data.map((d) => Math.max(d.value, d.value2 ?? 0)), 1));
	const barWidth = $derived(Math.min(48, Math.floor(600 / data.length) - 8));

	// Interactive hover tooltip (design-tokens: rich cyan tooltip on hover/tap)
	let tip = $state<{ label: string; primary: number; secondary?: number; left: number; top: number } | null>(null);

	function openTip(e: MouseEvent | TouchEvent, point: DataPoint & { value2?: number }) {
		const rect = (e.currentTarget as SVGGElement).getBoundingClientRect();
		tip = {
			label: point.label,
			primary: point.value,
			secondary: showSecondary ? point.value2 : undefined,
			left: rect.left + rect.width / 2,
			top: rect.top - 10
		};
	}
	const closeTip = () => (tip = null);
</script>

<div class="w-full" style="height: {height}px">
	<svg viewBox="0 0 {data.length * (barWidth + 12) + 20} {height}" class="w-full h-full" preserveAspectRatio="xMidYMid meet">
		{#each data as point, i}
			{@const barH = (point.value / maxVal) * (height - 40)}
			{@const secH = showSecondary && point.value2 ? (point.value2 / maxVal) * (height - 40) : 0}
			{@const x = 20 + i * (barWidth + 12)}
			<!-- Hover zone: invisible rect spanning adjacent midpoints -->
			<rect
				class="chart-hover-zone"
				x={x - 6}
				y="8"
				width={barWidth + 12}
				height={height - 34}
				fill="transparent"
				role="graphics-symbol"
				aria-label="{point.label}"
				style="cursor:pointer;touch-action:manipulation"
				onmouseenter={(e) => openTip(e, point)}
				onmousemove={(e) => openTip(e, point)}
				onmouseleave={closeTip}
				ontouchstart={(e) => openTip(e, point)}
			/>
			<rect
				x={x}
				y={height - 24 - barH}
				width={showSecondary ? barWidth / 2 - 2 : barWidth}
				height={barH}
				rx="4"
				fill={point.color ?? barColor}
				opacity="0.85"
				class="transition-all duration-500 chart-bar"
				role="graphics-symbol"
				aria-label="{point.label}"
				onmouseenter={(e) => openTip(e, point)}
				onmousemove={(e) => openTip(e, point)}
				onmouseleave={closeTip}
				style="cursor:pointer;touch-action:manipulation"
			/>
			{#if showSecondary && point.value2}
				<rect
					x={x + barWidth / 2 + 2}
					y={height - 24 - secH}
					width={barWidth / 2 - 2}
					height={secH}
					rx="4"
					fill={secondaryColor}
					opacity="0.75"
					class="transition-all duration-500 chart-bar chart-bar--secondary"
					role="graphics-symbol"
					aria-label="{point.label}"
					onmouseenter={(e) => openTip(e, point)}
					onmousemove={(e) => openTip(e, point)}
					onmouseleave={closeTip}
					style="cursor:pointer;touch-action:manipulation"
				/>
			{/if}
			<text
				x={x + barWidth / 2}
				y={height - 6}
				text-anchor="middle"
				class="fill-slate-400"
				font-size="10"
			>
				{point.label}
			</text>
		{/each}
	</svg>
</div>

{#if tip}
	<div
		class="tooltip-bubble"
		role="tooltip"
		data-above="true"
		style="left:{tip.left}px; top:{tip.top}px; pointer-events:none;"
	>
		<div class="tooltip-inner">
			<p class="tooltip-title">{tip.label}</p>
			<p class="tooltip-what">
				Primary: <strong>{tip.primary.toLocaleString('en-CA')}</strong>
				{#if tip.secondary !== undefined} · Secondary: <strong>{tip.secondary.toLocaleString('en-CA')}</strong>{/if}
			</p>
		</div>
	</div>
{/if}

<style>
	.chart-hover-zone:hover ~ * { opacity: 1; }
	.chart-bar { transition: filter 0.15s ease, opacity 0.15s ease; }
	.chart-hover-zone:hover ~ .chart-bar,
	.chart-bar:hover {
		filter: brightness(1.18);
		opacity: 1;
	}
	svg:hover .chart-bar { opacity: 0.72; }
	svg:hover .chart-bar:hover,
	svg:hover .chart-hover-zone:hover ~ .chart-bar { opacity: 1; }
</style>
