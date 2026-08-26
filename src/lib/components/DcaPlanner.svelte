<script lang="ts">
  /** War chest DCA planner (#12) — allocate a % of the reserve fund into the
   *  BTC war chest. Mirrors backend planDca (periodic fixed-CAD buys) and
   *  shows the Form B disclosure % so the council can see what it is voting on.
   *  Live: POST /treasury/dca/plan when signed in; demo: same math locally. */
  import { onMount } from 'svelte';
  import { copy, formatCurrency, locale } from '$lib/i18n';
  import { auth } from '$lib/api/auth';
  import { apiFetch } from '$lib/api/client';
  import { getToken } from '$lib/api/token';
  import Icon from './Icon.svelte';

  type Frequency = 'weekly' | 'biweekly' | 'monthly';

  const FREQS: Array<{ id: Frequency; label: string }> = [
    { id: 'weekly', label: 'Weekly' },
    { id: 'biweekly', label: 'Bi-weekly' },
    { id: 'monthly', label: 'Monthly' }
  ];

  let frequency = $state<Frequency>('monthly');
  let periods = $state(12);
  let allocationPerPeriodBasis = $state(50_000); // $500/period
  let annualBudgetBasis = $state(420_000); // $4,200/yr operating
  let cadPerBtc = $state(100_000);
  let plan = $state<{ totalCadBasis: number; disclosurePct: number; perPeriodSats: number } | null>(null);
  let live = $state(false);

  onMount(() => {
    const unsubscribe = auth.subscribe((s) => (live = s.status === 'signed-in'));
    return unsubscribe;
  });

  /** Mirror of backend/src/ziggy/dca.ts planDca for the demo/offline path. */
  async function build() {
    const stepDays = frequency === 'weekly' ? 7 : frequency === 'biweekly' ? 14 : 30;
    const satsPerPeriod = cadPerBtc > 0
      ? Math.floor((allocationPerPeriodBasis / 100 / cadPerBtc) * 100_000_000)
      : 0;
    const totalCadBasis = allocationPerPeriodBasis * periods;
    const disclosurePct = annualBudgetBasis > 0 ? (totalCadBasis / annualBudgetBasis) * 100 : 0;

    if (live) {
      try {
        const res = await apiFetch<{ ok: boolean; plan: { totalCadBasis: number; disclosurePct: number; periods: Array<{ sats: number }> } }>(
          '/api/v1/treasury/dca/plan',
          {
            method: 'POST',
            body: {
              frequency,
              periods,
              allocationPerPeriodBasis,
              annualOperatingBudgetBasis: annualBudgetBasis,
              cadPerBtc
            },
            token: getToken()
          }
        );
        plan = { totalCadBasis: res.plan.totalCadBasis, disclosurePct: res.plan.disclosurePct, perPeriodSats: res.plan.periods[0]?.sats ?? satsPerPeriod };
        return;
      } catch {
        /* fall through to local math */
      }
    }
    plan = { totalCadBasis, disclosurePct, perPeriodSats: satsPerPeriod };
  }
</script>

<section class="glass-card rounded-2xl p-6">
  <div class="flex items-start justify-between gap-3">
    <div>
      <h3 class="font-bold text-slate-800 flex items-center gap-2">
        <Icon name="bitcoin" class="h-4 w-4 text-bitcoin" /> {$copy.dcaTitle}
        {#if live}<span class="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold text-success uppercase">{$copy.liveLabel}</span>{/if}
      </h3>
      <p class="mt-1 text-sm text-slate-500">{$copy.dcaHint}</p>
    </div>
  </div>

  <div class="mt-4 grid gap-3 sm:grid-cols-3">
    <label class="block">
      <span class="text-[10px] font-bold text-slate-400 uppercase">{$copy.dcaAllocation} (CAD)</span>
      <input type="number" min="0" step="50" bind:value={allocationPerPeriodBasis} class="mt-1 w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm font-semibold text-slate-800" />
    </label>
    <label class="block">
      <span class="text-[10px] font-bold text-slate-400 uppercase">{$copy.dcaFrequency}</span>
      <div class="mt-1 flex flex-wrap gap-1">
        {#each FREQS as f}
          <button class="rounded-lg border px-2 py-1.5 text-[11px] font-semibold {frequency === f.id ? 'border-bitcoin/40 bg-bitcoin/10 text-bitcoin' : 'border-border bg-surface-2 text-slate-500'}" onclick={() => (frequency = f.id)}>{f.label}</button>
        {/each}
      </div>
    </label>
    <label class="block">
      <span class="text-[10px] font-bold text-slate-400 uppercase">Periods</span>
      <input type="number" min="1" max="104" bind:value={periods} class="mt-1 w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm font-semibold text-slate-800" />
    </label>
  </div>

  <div class="mt-3 grid gap-3 sm:grid-cols-2">
    <label class="block">
      <span class="text-[10px] font-bold text-slate-400 uppercase">Annual operating budget (CAD)</span>
      <input type="number" min="0" bind:value={annualBudgetBasis} class="mt-1 w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm font-semibold text-slate-800" />
    </label>
    <label class="block">
      <span class="text-[10px] font-bold text-slate-400 uppercase">CAD/BTC (quote)</span>
      <input type="number" min="0" bind:value={cadPerBtc} class="mt-1 w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm font-semibold text-slate-800" />
    </label>
  </div>

  <button class="mt-4 rounded-xl bg-bitcoin px-4 py-2.5 text-xs font-bold text-white hover:bg-bitcoin/90" onclick={build}>{$copy.dcaProjected}</button>

  {#if plan}
    <div class="mt-4 rounded-xl border border-border bg-surface-2/60 p-4">
      <div class="grid grid-cols-3 gap-3 text-center">
        <div>
          <p class="text-[10px] font-bold text-slate-400 uppercase">{$copy.dcaProjected}</p>
          <p class="text-lg font-black text-slate-800">{formatCurrency(plan.totalCadBasis / 100, $locale)}</p>
        </div>
        <div>
          <p class="text-[10px] font-bold text-slate-400 uppercase">Sats / period</p>
          <p class="text-lg font-black text-bitcoin">{plan.perPeriodSats.toLocaleString()}</p>
        </div>
        <div>
          <p class="text-[10px] font-bold text-slate-400 uppercase">{$copy.dcaDisclosure}</p>
          <p class="text-lg font-black {plan.disclosurePct > 10 ? 'text-amber-600' : 'text-slate-800'}">{plan.disclosurePct.toFixed(1)}%</p>
        </div>
      </div>
      <p class="mt-3 flex items-start gap-1.5 rounded-lg bg-amber-50 px-3 py-2 text-[11px] leading-relaxed text-amber-700">
        <Icon name="alert" class="h-3.5 w-3.5 mt-0.5 shrink-0" />
        {$copy.eduDca}: {$copy.eduDcaText} — this {plan.disclosurePct.toFixed(1)}% must be disclosed on Form B.
      </p>
    </div>
  {/if}
</section>
