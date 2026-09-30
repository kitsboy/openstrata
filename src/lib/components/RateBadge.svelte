<script lang="ts">
  /** Honest live-rate chrome (#20): compact CAD/BTC pill with "as of" time.
   *  Reads /rails/status once when mounted; stays quiet in demo mode. */
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { copy, formatCurrency, locale } from '$lib/i18n';
  import { auth } from '$lib/api/auth';
  import { fetchRailsStatus, type RailsStatus } from '$lib/api/rails';
  import Icon from './Icon.svelte';

  let rate = $state<number | null>(null);
  let asOf = $state<Date | null>(null);

  onMount(() => {
    const unsubscribe = auth.subscribe((session) => {
      if (session.status !== 'signed-in') return;
      fetchRailsStatus()
        .then((s: RailsStatus) => { rate = s.cadPerBtc; asOf = new Date(); })
        .catch(() => {});
    });
    return unsubscribe;
  });

</script>

{#if rate !== null}
  <span class="inline-flex items-center gap-1.5 rounded-full border border-bitcoin/25 bg-bitcoin/10 px-3 py-1.5 text-xs font-bold text-bitcoin" title="{$copy.rateUpdated} {asOf?.toLocaleString($locale)}">
    <Icon name="bitcoin" class="h-3 w-3" />
    {formatCurrency(rate, $locale, { maximumFractionDigits: 0 })}
    {#if asOf}
      <span class="font-semibold text-bitcoin/70">· {$copy.railsAsOf} {asOf.toLocaleTimeString($locale, { hour: '2-digit', minute: '2-digit' })}</span>
    {/if}
  </span>
{/if}
