<script lang="ts">
  /** On-chain balances (#11) — per-address sats straight from the public
   *  mempool.space API (no backend needed). Watch-only: shows what the chain
   *  says a council address holds, and links out to mempool for the proof. */
  import { onMount } from 'svelte';
  import { copy } from '$lib/i18n';
  import Icon from './Icon.svelte';
  import Illustrations from './Illustrations.svelte';
  import Skeleton from './Skeleton.svelte';

  const DEMO_ADDRESSES = [
    { label: 'Council multisig 1', address: 'bc1qdemo0nstrata0xpub00000000000000000000' },
    { label: 'Unit 101', address: 'bc1qdemo0000000000000000000000000000000000' }
  ];

  interface BalanceRow { label: string; address: string; confirmed: number; received: number; error?: string }

  let rows = $state<BalanceRow[]>([]);
  let loading = $state(false);

  function demoRows(): BalanceRow[] {
    return DEMO_ADDRESSES.map((d, i) => ({
      label: d.label,
      address: d.address,
      confirmed: 250_000_000 - i * 5_000_000,
      received: 251_000_000 - i * 5_000_000
    }));
  }

  async function load() {
    loading = true;
    if (typeof fetch === 'undefined') { loading = false; return; }
    const results = await Promise.all(
      DEMO_ADDRESSES.map(async (d) => {
        try {
          const res = await fetch(`https://mempool.space/api/address/${d.address}`);
          if (!res.ok) throw new Error('mempool unavailable');
          const data = await res.json();
          return {
            label: d.label,
            address: d.address,
            confirmed: data.chain_stats?.funded_txo_sum ?? 0,
            received: (data.chain_stats?.funded_txo_sum ?? 0) + (data.mempool_stats?.funded_txo_sum ?? 0)
          };
        } catch {
          // Honest demo fallback when offline — same shape, labeled.
          return {
            label: d.label,
            address: d.address,
            confirmed: 0,
            received: 0,
            error: 'offline'
          };
        }
      })
    );
    rows = results;
    loading = false;
  }

  onMount(load);
</script>

<section class="glass-card rounded-2xl p-6">
  <div class="flex items-start justify-between gap-3">
    <div>
      <h3 class="font-bold text-slate-800 flex items-center gap-2">
        <Icon name="bitcoin" class="h-4 w-4 text-bitcoin" /> {$copy.balancesTitle}
      </h3>
      <p class="mt-1 text-sm text-slate-500">{$copy.balancesHint}</p>
    </div>
    <button class="rounded-lg border border-border bg-surface-2 px-2.5 py-1.5 text-xs font-bold text-slate-600" onclick={load} aria-label={$copy.refresh}><Icon name="refresh" class="h-3 w-3" /></button>
  </div>

  {#if loading}
    <div class="mt-4 space-y-2"><Skeleton height="42px" /><Skeleton height="42px" /></div>
  {:else}
    <ul class="mt-4 divide-y divide-border/60 rounded-xl border border-border">
      {#each rows as r}
        <li class="px-3.5 py-3">
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-sm font-bold text-slate-800">{r.label}</span>
            <a class="ml-auto flex items-center gap-1 text-[10px] font-bold text-bc-blue no-underline" href={`https://mempool.space/address/${r.address}`} target="_blank" rel="noopener noreferrer"><Icon name="external" class="h-3 w-3" /> {$copy.walletExplorer}</a>
          </div>
          <code class="mt-1 block truncate font-mono text-[10px] text-slate-400">{r.address}</code>
          {#if r.error}
            <p class="mt-1 text-[10px] font-semibold text-slate-400">{$copy.demoLabel} — mempool.space unreachable</p>
          {:else}
            <div class="mt-1.5 flex gap-4 text-xs">
              <span class="font-bold text-bitcoin">{(r.confirmed / 100_000_000).toFixed(8)} BTC <span class="font-normal text-slate-400">{$copy.balancesConfirmed}</span></span>
              <span class="text-slate-500">{(r.received / 100_000_000).toFixed(8)} BTC <span class="text-slate-400">{$copy.balancesReceived}</span></span>
            </div>
          {/if}
        </li>
      {/each}
    </ul>
    {#if !rows.length}
      <div class="mt-4 flex flex-col items-center gap-2 rounded-xl border border-dashed border-border px-4 py-6 text-center">
        <Illustrations scene="bitcoin" class="h-16 w-16 text-slate-300" />
        <p class="text-sm text-slate-400">{$copy.walletNone}</p>
      </div>
    {/if}
  {/if}
</section>
