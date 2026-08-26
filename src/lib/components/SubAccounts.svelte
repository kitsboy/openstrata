<script lang="ts">
  /**
   * Transparent sub-accounts (item #10) — the four statutory trust funds at a
   * glance. When a live signed-in session exists, balances come from
   * `/api/v1/ledger/balance?fund=<code>` (chain-verified server-side) and the
   * head tally is shown as tamper-evidence. In demo mode, curated sample
   * numbers are shown instead.
   */
  import { copy, formatCurrency } from '$lib/i18n';
  import { auth } from '$lib/api/auth';
  import { fetchLedgerBalance } from '$lib/api/ledger';
  import Icon from '$lib/components/Icon.svelte';
  import LiveSync from '$lib/components/LiveSync.svelte';
  import Glossary from '$lib/components/Glossary.svelte';
  import { onMount } from 'svelte';

  interface FundView {
    code: string;
    label: string;
    balance: number | null;
    tally: string | null;
  }

  const FUNDS: Array<{ code: string; labelKey: string; demo: number }> = [
    { code: 'operating', labelKey: 'operatingFund', demo: 182_400 },
    { code: 'crf', labelKey: 'crfLabel', demo: 248_500 },
    { code: 'special_levy:reserve_topup', labelKey: 'specialLevyLabel', demo: 64_200 },
    { code: 'war_chest', labelKey: 'warChestLabel', demo: 96_800 }
  ];

  let funds = $state<FundView[]>(FUNDS.map((f) => ({ code: f.code, label: f.labelKey, balance: null, tally: null })));
  let live = $state(false);
  let liveLoaded = $state(false);
  let syncedAt = $state<Date | null>(null);

  async function refreshBalances() {
    const results = await Promise.all(
      FUNDS.map((f) =>
        fetchLedgerBalance(f.code)
          .then((b) => ({
            code: f.code,
            label: f.labelKey,
            balance: b.balanceBasis / 100,
            tally: b.headTally[0]?.tallyRoot.slice(0, 8) ?? null
          }))
          .catch(() => null)
      )
    );
    const updated = funds.map((fund) => {
      const liveFund = results.find((r) => r?.code === fund.code);
      return liveFund ? { ...liveFund } : fund;
    });
    funds = updated;
    syncedAt = new Date();
  }

  onMount(() => {
    const unsubscribe = auth.subscribe((session) => {
      live = session.status === 'signed-in';
      if (live && !liveLoaded) {
        liveLoaded = true;
        refreshBalances();
      }
    });
    return unsubscribe;
  });

  const total = $derived(
    live && funds.every((f) => f.balance !== null)
      ? funds.reduce((sum, f) => sum + (f.balance ?? 0), 0)
      : FUNDS.reduce((sum, f) => sum + f.demo, 0)
  );

  function displayBalance(f: FundView): number {
    if (f.balance !== null) return f.balance;
    return FUNDS.find((x) => x.code === f.code)?.demo ?? 0;
  }
</script>

<section class="glass-card rounded-2xl p-6">
  <div class="flex items-center justify-between mb-4">
    <h3 class="text-lg font-bold text-slate-800">🏦 {$copy.subAccounts}</h3>
    <div class="flex items-center gap-3">
      <LiveSync live={live} bind:syncedAt onRefresh={() => refreshBalances()} />
      <span class="text-xs font-semibold text-slate-400">
        {live ? `{$copy.liveLabel} · {$copy.liveDataBadge}` : $copy.simulatedLedger}
      </span>
    </div>
  </div>

  <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
    {#each funds as fund}
      <div class="rounded-xl border border-border bg-surface-2 p-4">
        <p class="text-[10px] font-bold uppercase tracking-widest text-slate-400">{copy[fund.label as keyof typeof copy] ?? fund.label}
          {#if fund.code === 'crf'}<Glossary term="crf" />{/if}
          {#if fund.code === 'war_chest'}<Glossary term="multisig" />{/if}
        </p>
        <p class="mt-2 text-2xl font-bold text-slate-800">{formatCurrency(displayBalance(fund), 'en', { maximumFractionDigits: 0 })}</p>
        <p class="mt-1 font-mono text-[10px] text-slate-400">
          {fund.tally ? `tally ${fund.tally}…` : fund.code}
        </p>
      </div>
    {/each}
  </div>

  <div class="mt-4 rounded-xl border border-bitcoin/20 bg-bitcoin/5 p-4">
    <div class="flex items-center justify-between gap-2 text-xs font-bold text-bitcoin">
      <span class="flex items-center gap-1.5"><Icon name="bitcoin" class="h-3.5 w-3.5" /> {$copy.eduDca} <Glossary term="dca" /></span>
      <span>{formatCurrency(total * 0.12, 'en', { maximumFractionDigits: 0 })} · 12%</span>
    </div>
    <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
      <span class="block h-full rounded-full bg-bitcoin" style="width: 12%"></span>
    </div>
    <p class="mt-1.5 text-[11px] text-slate-400">{$copy.eduDcaText}</p>
  </div>

  <div class="mt-4 flex items-center justify-between border-t border-border pt-3 text-sm">
    <span class="font-semibold text-slate-500">{$copy.totalLabel}</span>
    <span class="text-lg font-bold text-slate-800">{formatCurrency(total, 'en', { maximumFractionDigits: 0 })}</span>
  </div>

  {#if live}
    <p class="mt-3 text-[11px] text-slate-400">{$copy.chainVerified}</p>
  {/if}
</section>
