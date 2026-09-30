<script lang="ts">
	type Point = { x: number; y: number };

	let {
		data,
		height = 120,
		color = '#14b8a6',
		fillColor = 'rgba(20, 184, 166, 0.1)'
	}: {
		data: number[];
		height?: number;
		color?: string;
		fillColor?: string;
	} = $props();

	const width = 400;
	const padding = { top: 10, right: 10, bottom: 24, left: 10 };

	const points = $derived.by(() => {
		if (data.length < 2) return [];
		const min = Math.min(...data) * 0.95;
		const max = Math.max(...data) * 1.05;
		const range = max - min || 1;
		const innerW = width - padding.left - padding.right;
		const innerH = height - padding.top - padding.bottom;
		return data.map((v, i) => ({
			x: padding.left + (i / (data.length - 1)) * innerW,
			y: padding.top + innerH - ((v - min) / range) * innerH
		}));
	});

	const linePath = $derived(
		points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
	);

	const areaPath = $derived(
		points.length
			? `${linePath} L ${points[points.length - 1].x} ${height - padding.bottom} L ${points[0].x} ${height - padding.bottom} Z`
			: ''
	);

	// Interactive hover tooltip (design-tokens: rich cyan tooltip on hover/tap)
	let tip = $state<{ value: number; index: number; left: number; top: number } | null>(null);

	function openTip(e: MouseEvent | TouchEvent, i: number) {
		const p = points[i];
		if (!p) return;
		const rect = (e.currentTarget as SVGGElement).getBoundingClientRect();
		tip = { value: data[i], index: i, left: rect.left + rect.width / 2, top: rect.top - 8 };
	}
	const closeTip = () => (tip = null);
</script>

<div style="position:relative;width:100%">
	<svg viewBox="0 0 {width} {height}" class="w-full h-auto" preserveAspectRatio="xMidYMid meet" style="display:block">
		{#if areaPath}
			<path d={areaPath} fill={fillColor} />
			<path d={linePath} fill="none" stroke={color} stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="chart-line" />
			{#each points as p, i}
				<!-- Invisible hover zone per point (design-tokens: .hv pattern) -->
				<rect
					class="hv"
					x={p.x - 12}
					y="4"
					width="24"
					height={height - 28}
					fill="transparent"
					role="graphics-symbol"
					aria-label="Point {i + 1}"
					style="cursor:pointer;touch-action:manipulation"
					onmouseenter={(e) => openTip(e, i)}
					onmousemove={(e) => openTip(e, i)}
					onmouseleave={closeTip}
					ontouchstart={(e) => openTip(e, i)}
				/>
				<circle
					class="chart-dot"
					cx={p.x}
					cy={p.y}
					r="3.5"
					fill="white"
					stroke={color}
					stroke-width="2"
					role="graphics-symbol"
					aria-label="Point {i + 1}"
					style="cursor:pointer;touch-action:manipulation"
					onmouseenter={(e) => openTip(e, i)}
					onmousemove={(e) => openTip(e, i)}
					onmouseleave={closeTip}
					ontouchstart={(e) => openTip(e, i)}
				/>
			{/each}
		{/if}
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
			<p class="tooltip-title">Point {tip.index + 1}</p>
			<p class="tooltip-what">
				Value: <strong>{tip.value.toLocaleString('en-CA')}</strong>
			</p>
		</div>
	</div>
{/if}

<style>
	.chart-line { transition: filter 0.15s ease; }
	.chart-dot { transition: r 0.15s ease, filter 0.15s ease; }
	svg:hover .chart-line { filter: drop-shadow(0 0 4px rgba(20, 184, 166, 0.5)); }
	.hv:hover ~ .chart-dot,
	.chart-dot:hover {
		filter: drop-shadow(0 0 5px rgba(20, 184, 166, 0.6));
	}
	.hv:hover ~ .chart-dot { r: 5; }
</style>
