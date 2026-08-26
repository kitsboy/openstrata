<script lang="ts">
  // Mini trend chart for metric cards — a lightweight polyline sparkline.
  // Honors reduced motion by rendering a static line.
  let { values = [], tone = 'green', height = 30 }:
    { values?: number[]; tone?: 'green' | 'amber' | 'blue' | 'purple' | 'orange'; height?: number } = $props();

  const COLORS = { green: 'var(--green)', amber: 'var(--amber)', blue: 'var(--blue)', purple: 'var(--purple)', orange: 'var(--orange)' } as const;

  const path = $derived.by(() => {
    const w = 120;
    const h = height;
    if (values.length < 2) return '';
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = max - min || 1;
    const pad = 3;
    return values
      .map((v, i) => {
        const x = (i / (values.length - 1)) * w;
        const y = pad + (1 - (v - min) / span) * (h - pad * 2);
        return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  });

  const deltaPct = $derived(
    values.length >= 2 ? ((values[values.length - 1] - values[0]) / Math.abs(values[0] || 1)) * 100 : 0
  );
</script>

<div class="spark-wrap" aria-hidden="true">
  <svg viewBox="0 0 120 {height}" preserveAspectRatio="none" class="spark-svg">
    <path d={path} fill="none" stroke={COLORS[tone]} stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
  {#if values.length >= 2}
    <span class="spark-delta {deltaPct >= 0 ? 'up' : 'down'}">{deltaPct >= 0 ? '↗' : '↘'} {Math.abs(deltaPct).toFixed(1)}%</span>
  {/if}
</div>

<style>
  .spark-wrap { display: flex; align-items: center; gap: 8px; margin-top: 4px; }
  .spark-svg { width: 72px; height: 30px; overflow: visible; }
  .spark-delta { font-family: 'DM Mono', monospace; font-size: 8px; font-weight: 700; }
  .spark-delta.up { color: var(--green); }
  .spark-delta.down { color: var(--amber); }
</style>
