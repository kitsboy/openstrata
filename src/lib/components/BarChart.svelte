<script lang="ts">
	type DataPoint = { label: string; value: number; color?: string };

	let {
		data,
		height = 160,
		barColor = '#14b8a6',
		secondaryColor = '#f7931a',
		showSecondary = false,
		secondaryKey = 'value2' as const
	}: {
		data: Array<DataPoint & { value2?: number }>;
		height?: number;
		barColor?: string;
		secondaryColor?: string;
		showSecondary?: boolean;
	} = $props();

	const maxVal = $derived(Math.max(...data.map((d) => Math.max(d.value, d.value2 ?? 0)), 1));
	const barWidth = $derived(Math.min(48, Math.floor(600 / data.length) - 8));
</script>

<div class="w-full" style="height: {height}px">
	<svg viewBox="0 0 {data.length * (barWidth + 12) + 20} {height}" class="w-full h-full" preserveAspectRatio="xMidYMid meet">
		{#each data as point, i}
			{@const barH = (point.value / maxVal) * (height - 40)}
			{@const secH = showSecondary && point.value2 ? (point.value2 / maxVal) * (height - 40) : 0}
			{@const x = 20 + i * (barWidth + 12)}
			<rect
				{x}
				y={height - 24 - barH}
				width={showSecondary ? barWidth / 2 - 2 : barWidth}
				height={barH}
				rx="4"
				fill={point.color ?? barColor}
				opacity="0.85"
				class="transition-all duration-500"
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
					class="transition-all duration-500"
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