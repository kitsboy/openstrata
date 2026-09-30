<script lang="ts">
  /** Real image assets (#7): a small inline SVG illustration set (no binary
   *  files, no network) used by empty states, the tour, and the design page.
   *  Scene = which illustration: ledger (hash chain), bitcoin (stack), units
   *  (building), empty (search). Rendered at currentColor so dark mode works. */
  let { scene = 'empty', class: cls = 'h-24 w-24' }: { scene?: 'empty' | 'ledger' | 'bitcoin' | 'building'; class?: string } = $props();
</script>

{#if scene === 'ledger'}
  <svg viewBox="0 0 96 72" fill="none" class={cls} aria-hidden="true">
    <rect x="8" y="10" width="80" height="52" rx="10" stroke="currentColor" stroke-width="2.5" opacity="0.5"/>
    <rect x="18" y="20" width="14" height="14" rx="4" stroke="currentColor" stroke-width="2"/>
    <rect x="40" y="20" width="38" height="14" rx="4" stroke="currentColor" stroke-width="2" opacity="0.7"/>
    <rect x="18" y="40" width="14" height="14" rx="4" stroke="currentColor" stroke-width="2"/>
    <rect x="40" y="40" width="38" height="14" rx="4" stroke="currentColor" stroke-width="2" opacity="0.7"/>
    <path d="M25 27l14 0M25 47l14 0" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.5"/>
  </svg>
{:else if scene === 'bitcoin'}
  <svg viewBox="0 0 96 72" fill="none" class={cls} aria-hidden="true">
    <path d="M48 8l34 16v22c0 14-14 20-34 24-20-4-34-10-34-24V24L48 8z" stroke="currentColor" stroke-width="2.5" opacity="0.55"/>
    <path d="M40 18h14a7 7 0 015 12 7 7 0 01-6 12H40m0-24h-6m6 0v24m0-24h10m-10 0v24m-6-24v24m6-24h4m-4 12h12m-12 0v-8m0 8v8" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="48" cy="30" r="3" fill="currentColor"/>
  </svg>
{:else if scene === 'building'}
  <svg viewBox="0 0 96 72" fill="none" class={cls} aria-hidden="true">
    <path d="M12 60V20l36-8 36 8v40" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" opacity="0.55"/>
    <rect x="26" y="30" width="14" height="30" rx="2" stroke="currentColor" stroke-width="2"/>
    <rect x="46" y="22" width="14" height="38" rx="2" stroke="currentColor" stroke-width="2"/>
    <rect x="66" y="34" width="12" height="26" rx="2" stroke="currentColor" stroke-width="2" opacity="0.7"/>
    <circle cx="33" cy="38" r="2" fill="currentColor"/>
    <circle cx="53" cy="30" r="2" fill="currentColor"/>
  </svg>
{:else}
  <svg viewBox="0 0 96 72" fill="none" class={cls} aria-hidden="true">
    <circle cx="42" cy="42" r="16" stroke="currentColor" stroke-width="2.5" opacity="0.55"/>
    <path d="M54 54l10 10" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M34 42l6 6 10-12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M18 12h52M18 60h52" stroke="currentColor" stroke-width="2" stroke-linecap="round" opacity="0.35"/>
  </svg>
{/if}
