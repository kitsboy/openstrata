<script lang="ts">
  // Shimmer placeholder — replaces demo-data flash while live widgets fetch.
  let { width = '100%', height = '14px', radius = '6px', lines = 1 }: {
    width?: string; height?: string; radius?: string; lines?: number;
  } = $props();
</script>

{#if lines > 1}
  <div class="skeleton-stack" aria-hidden="true">
    {#each Array(lines) as _, i}
      <span class="skeleton-line" style="width: {i === lines - 1 ? '60%' : width}; height: {height}; border-radius: {radius};"></span>
    {/each}
  </div>
{:else}
  <span class="skeleton-line" style="width: {width}; height: {height}; border-radius: {radius};" aria-hidden="true"></span>
{/if}

<style>
  .skeleton-stack { display: flex; flex-direction: column; gap: 8px; }
  .skeleton-line {
    display: block;
    background: linear-gradient(90deg, var(--surface-3) 25%, var(--line) 37%, var(--surface-3) 63%);
    background-size: 400% 100%;
    animation: os-shimmer 1.3s ease infinite;
  }
  @keyframes os-shimmer { 0% { background-position: 100% 0; } 100% { background-position: 0 0; } }
  @media (prefers-reduced-motion: reduce) { .skeleton-line { animation: none; } }
</style>
