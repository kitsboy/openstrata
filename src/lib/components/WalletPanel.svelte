<script lang="ts">
  /** Wallet & address book (#14): registered xpub + per-unit receive
   *  addresses with copy + mempool explorer links. Reads /rails/xpub. */
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { copy } from '$lib/i18n';
  import { auth } from '$lib/api/auth';
  import { apiFetch } from '$lib/api/client';
  import { getToken } from '$lib/api/token';
  import Icon from './Icon.svelte';
  import EmptyState from './EmptyState.svelte';

  let live = $state(false);
  let xpub = $state<string | null>(null);
  let addresses = $state<Array<{ unitRef: string; address: string }>>([]);
  let copied = $state('');

  const DEMO_XPUB = 'xpub6CUGRUonZSQ4TWtTMmzXdrXDtypWKiKrhko4egpiMZbpiaQL2jkwSB1icqYh2cfDfVxdx4df189oLKnC5fSwqPfgyP3hooxujYzAu3fDVmz';
  const DEMO_ADDRS: Array<{ unitRef: string; address: string }> = [
    { unitRef: '101', address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh' },
    { unitRef: '102', address: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq' },
    { unitRef: '201', address: 'bc1q8c6fshw2dlwun7ekn9qwf37cu2rn755upcp6el' },
    { unitRef: '202', address: 'bc1qcr8te4kr609gcawutmrza0j4xv80jy8z306fyu' },
    { unitRef: '301', address: 'bc1qk3u7v5q2r6k9m4z0n8p3j2h5f1t6d8s7w4e9a' }
  ];

  onMount(() => {
    const unsubscribe = auth.subscribe((session) => {
      if (session.status === 'signed-in') {
        live = true;
        apiFetch<{ ok: boolean; registered: boolean; xpub?: string; addresses?: Array<{ unitRef: string; address: string }> }>(
          '/api/v1/rails/xpub', { token: getToken() }
        )
          .then((res) => {
            if (res.registered && res.xpub) {
              xpub = res.xpub;
              addresses = res.addresses ?? [];
            } else {
              xpub = null;
              addresses = [];
            }
          })
          .catch(() => {});
      } else {
        live = false;
        xpub = null;
        addresses = [];
      }
    });
    return unsubscribe;
  });

  const displayXpub = $derived(live ? xpub : DEMO_XPUB);
  const displayAddrs = $derived(live ? addresses : DEMO_ADDRS);
  const shortAddr = (a: string) => `${a.slice(0, 10)}…${a.slice(-8)}`;

  async function copyAddr(addr: string) {
    try {
      await navigator.clipboard.writeText(addr);
      copied = addr;
      setTimeout(() => (copied = ''), 1600);
    } catch {
      /* clipboard unavailable */
    }
  }
</script>

<section class="glass-card rounded-2xl p-6">
  <div class="flex flex-wrap items-start justify-between gap-3">
    <div>
      <h3 class="font-bold text-slate-800 flex items-center gap-2">
        <Icon name="bitcoin" class="h-4 w-4 text-bitcoin" /> {$copy.walletTitle}
        {#if live}<span class="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold text-success uppercase">{$copy.liveLabel}</span>{/if}
      </h3>
      <p class="mt-1 text-sm text-slate-500">{$copy.walletHint}</p>
    </div>
  </div>

  {#if displayXpub}
    <div class="mt-4 rounded-xl border border-bitcoin/20 bg-bitcoin/5 p-3">
      <p class="text-[10px] font-bold text-bitcoin uppercase">xpub · {$copy.xpubRegistered}</p>
      <code class="mt-1 block truncate font-mono text-xs text-slate-600">{displayXpub}</code>
    </div>
  {/if}

  <div class="mt-4">
    <p class="text-[10px] font-bold text-slate-400 uppercase">{$copy.walletAddresses}</p>
    {#if displayAddrs.length === 0}
      <div class="mt-3"><EmptyState icon="bitcoin" title={$copy.walletNone} /></div>
    {:else}
      <div class="mt-2 grid gap-2 sm:grid-cols-2">
        {#each displayAddrs as row}
          <div class="rounded-xl border border-border bg-surface-2 p-3">
            <div class="flex items-center justify-between gap-2">
              <span class="rounded-full bg-brand-600/10 px-2 py-0.5 text-[10px] font-bold text-brand-700">{$copy.unitLabel} {row.unitRef}</span>
              <span class="flex gap-1">
                <button class="rounded-lg bg-surface-2 px-2 py-1 text-[10px] font-bold text-slate-500 hover:text-brand-600" onclick={() => copyAddr(row.address)}>{copied === row.address ? $copy.walletCopied : $copy.walletCopy}</button>
                <a class="flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold text-bitcoin no-underline hover:bg-bitcoin/10" href={`https://mempool.space/address/${row.address}`} target="_blank" rel="noopener noreferrer">{shortAddr(row.address)}<Icon name="external" class="h-2.5 w-2.5" /></a>
              </span>
            </div>
          </div>
        {/each}
      </div>
      <p class="mt-2 text-[10px] font-bold text-slate-400 uppercase">→ mempool.space</p>
    {/if}
  </div>
</section>
