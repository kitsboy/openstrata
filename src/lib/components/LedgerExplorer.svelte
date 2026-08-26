<script lang="ts">
  /** Ledger explorer (#16): browse the verified hash chain per fund, re-verify
   *  (the API throws on tampering), and export CSV. Live when signed in. */
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { copy, formatCurrency, locale } from '$lib/i18n';
  import { auth } from '$lib/api/auth';
  import { fetchLedgerEntries, type LedgerEntry } from '$lib/api/ledger';
  import Icon from './Icon.svelte';
  import Skeleton from './Skeleton.svelte';
  import EmptyState from './EmptyState.svelte';

  let live = $state(false);
  let fund = $state('operating');
  let entries = $state<LedgerEntry[] | null>(null);
  let loading = $state(false);
  let verified = $state(false);

  const FUNDS = ['operating', 'crf', 'war_chest', 'special_levy'];

  onMount(() => {
    const unsubscribe = auth.subscribe((session) => {
      if (session.status === 'signed-in') {
        live = true;
        load();
      } else {
        live = false;
        entries = null;
      }
    });
    return unsubscribe;
  });

  async function load() {
    if (!live) return;
    loading = true;
    verified = false;
    try {
      entries = await fetchLedgerEntries(fund);
      verified = true; // the endpoint verifies the whole chain before responding
    } catch {
      entries = null;
    }
    loading = false;
  }

  function exportCsv() {
    if (!entries || entries.length === 0) return;
    const head = 'seq,kind,amountBasis,type,referenceCode,postedAt,tallyRoot';
    const rows = entries.map((e) =>
      [e.seq, e.kind, e.amountBasis, `"${e.type}"`, `"${e.referenceCode}"`, e.postedAt, e.tallyRoot].join(',')
    );
    const blob = new Blob([[head, ...rows].join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ledger-${fund}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
</script>

<section class="glass-card rounded-2xl p-6">
  <div class="flex flex-wrap items-start justify-between gap-3">
    <div>
      <h3 class="font-bold text-slate-800 flex items-center gap-2">
        <Icon name="chart" class="h-4 w-4 text-brand-600" /> {$copy.ledgerTitle}
        {#if live}<span class="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold text-success uppercase">{$copy.liveLabel}</span>{/if}
      </h3>
      <p class="mt-1 text-sm text-slate-500">{$copy.ledgerHint}</p>
    </div>
    <div class="flex flex-wrap items-center gap-2">
      <select bind:value={fund} onchange={load} class="rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm font-semibold text-slate-700">
        {#each FUNDS as f}<option>{f}</option>{/each}
      </select>
      <button class="rounded-xl border border-border bg-surface-2 px-3 py-2 text-xs font-bold text-slate-600" onclick={load} disabled={!live}>{$copy.ledgerVerify}</button>
      <button class="rounded-xl bg-brand-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-40" onclick={exportCsv} disabled={!entries || entries.length === 0}>{$copy.ledgerCsv}</button>
    </div>
  </div>

  {#if verified && entries}
    <p class="mt-3 flex items-center gap-1.5 text-xs font-bold text-success"><Icon name="check" class="h-3 w-3" /> {$copy.ledgerVerified} — {entries.length} entries</p>
  {/if}

  <div class="mt-3">
    {#if loading}
      <div class="space-y-2"><Skeleton height="34px" /><Skeleton height="34px" /><Skeleton height="34px" /></div>
    {:else if entries === null}
      <EmptyState icon="chart" title={$copy.ledgerEmpty} message={live ? undefined : $copy.evidenceDemo} />
    {:else if entries.length === 0}
      <EmptyState icon="chart" title={$copy.ledgerEmpty} />
    {:else}
      <div class="overflow-x-auto rounded-xl border border-border">
        <table class="w-full min-w-[560px] text-left text-sm">
          <thead class="bg-surface-3 text-[10px] font-bold uppercase text-slate-400">
            <tr><th class="px-3 py-2">seq</th><th class="px-3 py-2">kind</th><th class="px-3 py-2">amount</th><th class="px-3 py-2">type</th><th class="px-3 py-2">reference</th><th class="px-3 py-2">tally</th></tr>
          </thead>
          <tbody>
            {#each entries.slice().reverse().slice(0, 12) as e}
              <tr class="border-t border-border">
                <td class="px-3 py-2 font-mono text-xs text-slate-400">#{e.seq}</td>
                <td class="px-3 py-2 text-xs font-bold {e.kind === 'credit' ? 'text-success' : 'text-danger'}">{e.kind}</td>
                <td class="px-3 py-2 font-semibold text-slate-700">{formatCurrency(Math.abs(e.amountBasis) / 100, $locale)}</td>
                <td class="px-3 py-2 text-xs text-slate-500">{e.type}</td>
                <td class="px-3 py-2 font-mono text-xs text-bc-blue">{e.referenceCode}</td>
                <td class="px-3 py-2 font-mono text-xs text-slate-400" title={e.tallyRoot}>{e.tallyRoot.slice(0, 10)}…</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>
</section>
