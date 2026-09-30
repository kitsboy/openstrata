<script lang="ts">
  /** Sovereign rails panel (#11): enabled rails, node status, live CAD/BTC
   *  with as-of time (#20). Reads /rails/status when signed in. */
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { copy, formatCurrency, locale } from '$lib/i18n';
  import { auth } from '$lib/api/auth';
  import { fetchRailsStatus, type RailsStatus } from '$lib/api/rails';
  import Icon from './Icon.svelte';
  import Skeleton from './Skeleton.svelte';

  let status = $state<RailsStatus | null>(null);
  let loading = $state(false);
  let asOf = $state<Date | null>(null);

  const RAIL_META: Record<string, { label: string; icon: 'coins' | 'bitcoin' | 'lightning' | 'shield' | 'rss' }> = {
    fiat: { label: 'Fiat', icon: 'coins' },
    onchain: { label: 'Bitcoin', icon: 'bitcoin' },
    lightning: { label: 'Lightning', icon: 'lightning' },
    liquid: { label: 'Liquid', icon: 'coins' },
    paynym_bip47: { label: 'PayNym', icon: 'shield' },
    nostr: { label: 'Nostr', icon: 'rss' }
  };

  const DEMO: RailsStatus = {
    rails: { fiat: { enabled: true }, onchain: { enabled: true }, lightning: { enabled: true }, liquid: { enabled: false }, paynym_bip47: { enabled: false }, nostr: { enabled: false } },
    cadPerBtc: 96500
  };

  onMount(() => {
    const unsubscribe = auth.subscribe((session) => {
      if (session.status === 'signed-in') {
        loading = true;
        fetchRailsStatus()
          .then((s) => { status = s; asOf = new Date(); })
          .catch(() => { status = null; })
          .finally(() => (loading = false));
      } else {
        status = null;
      }
    });
    return unsubscribe;
  });

  const display = $derived(status ?? DEMO);
  const enabled = $derived(Object.entries(display.rails).filter(([, r]) => r.enabled));
</script>

<section class="glass-card w-full rounded-2xl p-6">
  <div class="flex flex-wrap items-start justify-between gap-3">
    <div>
      <h3 class="font-bold text-slate-800 flex items-center gap-2">
        <Icon name="bitcoin" class="h-4 w-4 text-bitcoin" /> {$copy.railsTitle}
        {#if status}<span class="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold text-success uppercase">{$copy.liveLabel}</span>{/if}
      </h3>
      <p class="mt-1 text-sm text-slate-500">{$copy.railsHint}</p>
    </div>
  </div>

  <div class="mt-4">
    {#if loading}
      <div class="space-y-2"><Skeleton height="40px" /><Skeleton height="28px" /></div>
    {:else}
      <div class="rounded-xl border border-bitcoin/20 bg-bitcoin/5 p-4">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <span class="flex items-center gap-2 text-sm font-bold text-slate-800"><Icon name="chart" class="h-4 w-4 text-bitcoin" /> {$copy.rateTitle}</span>
          <span class="text-lg font-bold text-bitcoin">{formatCurrency(display.cadPerBtc, $locale, { maximumFractionDigits: 0 })}</span>
          <span class="text-[10px] font-bold text-slate-400 uppercase">{asOf ? `${$copy.railsAsOf} ${asOf.toLocaleTimeString($locale, { hour: '2-digit', minute: '2-digit' })}` : $copy.rateUpdated}</span>
        </div>
      </div>

      <div class="mt-3 flex flex-wrap gap-2">
        {#each enabled as [key, rail]}
          <span class="flex items-center gap-1.5 rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-bold text-success">
            <Icon name={RAIL_META[key]?.icon ?? 'coins'} class="h-3 w-3" />{RAIL_META[key]?.label ?? key}
          </span>
        {/each}
      </div>

      <p class="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
        <Icon name="alert" class="h-3 w-3" /> {$copy.railsNotConnected}
      </p>
    {/if}
  </div>
</section>
