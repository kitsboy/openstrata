<script lang="ts">
  /** "Run the month" close (#2): billing run → late notices → ledger post,
   *  then a link to reconcile. Live via POST /billing/run when signed in. */
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { copy, formatCurrency, locale } from '$lib/i18n';
  import { auth } from '$lib/api/auth';
  import { fetchUnits, type ApiUnit } from '$lib/api/units';
  import { runBillingCycle, type BillRun } from '$lib/api/billing';
  import Icon from './Icon.svelte';

  let liveUnits = $state<ApiUnit[] | null>(null);
  let period = $state('2026-09');
  let monthlyBasis = $state(35000);
  let run = $state<BillRun | null>(null);
  let busy = $state(false);
  let error = $state('');

  onMount(() => {
    const unsubscribe = auth.subscribe((session) => {
      if (session.status === 'signed-in') {
        fetchUnits().then((u) => (liveUnits = u)).catch(() => {});
      } else {
        liveUnits = null;
      }
    });
    return unsubscribe;
  });

  const unitList = $derived(liveUnits ?? [
    { unitRef: '101' }, { unitRef: '102' }, { unitRef: '201' },
    { unitRef: '202' }, { unitRef: '301' }, { unitRef: '302' }
  ] as ApiUnit[]);

  async function runClose() {
    error = '';
    busy = true;
    try {
      const fees = unitList.map((u) => ({ unitId: u.unitRef, monthlyBasis }));
      const arrears: Record<string, number> = {};
      const res = await runBillingCycle({
        period, fees, dueDay: 1, graceDays: 7, lateFeeBasis: 2000, arrears
      });
      run = res.run;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Request failed';
    }
    busy = false;
  }
</script>

<section class="glass-card rounded-2xl p-6">
  <div class="flex items-start justify-between gap-3">
    <div>
      <h3 class="font-bold text-slate-800 flex items-center gap-2">
        <Icon name="calendar" class="h-4 w-4 text-brand-600" /> {$copy.monthlyCloseTitle}
        {#if liveUnits}<span class="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold text-success uppercase">{$copy.liveLabel}</span>{/if}
      </h3>
      <p class="mt-1 text-sm text-slate-500">{$copy.monthlyCloseHint}</p>
    </div>
  </div>

  <div class="mt-4 flex flex-wrap items-end gap-3">
    <label class="block">
      <span class="text-[10px] font-bold text-slate-400 uppercase">{$copy.monthlyClosePeriod}</span>
      <input bind:value={period} class="mt-1 w-32 rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm font-semibold text-slate-800" placeholder="2026-09" />
    </label>
    <label class="block">
      <span class="text-[10px] font-bold text-slate-400 uppercase">{$copy.checkoutAmount} / unit</span>
      <input type="number" min="0" step="0.01" bind:value={monthlyBasis} class="mt-1 w-32 rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm font-semibold text-slate-800" />
    </label>
    <button class="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-brand-700 disabled:opacity-50" onclick={runClose} disabled={busy}>
      {busy ? '…' : $copy.monthlyCloseRun}
    </button>
  </div>

  {#if run}
    <div class="mt-4 rounded-xl border border-success/30 bg-success/5 p-4">
      <p class="flex items-center gap-2 text-sm font-bold text-success"><Icon name="check" class="h-4 w-4" /> {$copy.monthlyCloseDone} — {run.period}</p>
      <div class="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div class="rounded-xl bg-surface-2 p-3">
          <p class="text-[10px] font-bold text-slate-400 uppercase">{$copy.monthlyCloseCharged}</p>
          <p class="mt-1 text-xl font-bold text-slate-800">{formatCurrency(run.totalChargedBasis / 100, $locale)}</p>
          <p class="text-xs text-slate-400">{run.charges.length} {$copy.unitLabel}s</p>
        </div>
        <div class="rounded-xl bg-surface-2 p-3 sm:col-span-2">
          <p class="text-[10px] font-bold text-slate-400 uppercase">{$copy.monthlyCloseNotices}</p>
          {#if run.lateNotices.length === 0}
            <p class="mt-1 text-sm font-semibold text-slate-600">{$copy.monthlyCloseNone}</p>
          {:else}
            <ul class="mt-1 space-y-1">
              {#each run.lateNotices.slice(0, 4) as notice}
                <li class="flex items-center justify-between gap-2 text-xs">
                  <span class="font-semibold text-slate-700">{$copy.unitLabel} {notice.unitId}</span>
                  <span class="text-warning">{formatCurrency(notice.arrearsBasis / 100, $locale)}</span>
                </li>
              {/each}
            </ul>
          {/if}
        </div>
      </div>
    </div>
  {/if}

  {#if error}<p class="mt-3 text-xs font-semibold text-danger" role="alert"><Icon name="alert" class="h-3 w-3 inline" /> {error}</p>{/if}
</section>
