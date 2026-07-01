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
</script>

<svg viewBox="0 0 {width} {height}" class="w-full h-auto" preserveAspectRatio="xMidYMid meet">
	{#if areaPath}
		<path d={areaPath} fill={fillColor} />
		<path d={linePath} fill="none" stroke={color} stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
		{#each points as p, i}
			<circle cx={p.x} cy={p.y} r="3.5" fill="white" stroke={color} stroke-width="2" />
		{/each}
	{/if}
</svg>