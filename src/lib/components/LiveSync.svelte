<script lang="ts">
  // Live-data trust chrome — "Last synced HH:MM" + a per-widget refresh button.
  // Renders nothing when not in live mode (demo widgets keep the Demo pill).
  import { copy } from '$lib/i18n';
  import Icon from '$lib/components/Icon.svelte';

  let { live = false, syncedAt = $bindable<Date | null>(null), onRefresh }: {
    live?: boolean;
    syncedAt?: Date | null;
    onRefresh?: () => void;
  } = $props();

  const timeLabel = $derived(
    syncedAt
      ? new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(syncedAt)
      : null
  );
</script>

{#if live}
  <div class="live-sync">
    <span class="live-sync-label"><span class="live-sync-dot"></span> {$copy.lastSynced}{timeLabel ? ` ${timeLabel}` : '…'}</span>
    {#if onRefresh}
      <button class="live-sync-refresh" onclick={onRefresh} aria-label={$copy.refresh} title={$copy.refresh}>
        <Icon name="refresh" class="h-3 w-3" />
      </button>
    {/if}
  </div>
{/if}

<style>
  .live-sync { display: inline-flex; align-items: center; gap: 7px; }
  .live-sync-label { display: inline-flex; align-items: center; gap: 6px; color: var(--muted); font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: .04em; }
  .live-sync-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--green); box-shadow: 0 0 0 3px color-mix(in srgb, var(--green) 15%, transparent); }
  .live-sync-refresh { display: grid; place-items: center; width: 24px; height: 24px; border-radius: 7px; color: var(--muted); background: var(--surface-3); transition: color .15s ease, transform .15s ease; }
  .live-sync-refresh:hover { color: var(--orange); transform: rotate(18deg); }
</style>
