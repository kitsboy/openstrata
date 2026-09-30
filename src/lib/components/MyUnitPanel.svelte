<script lang="ts">
  /** My unit (#5) — the member's own lot: AR balance, recent payments, and the
   *  unit's place in the building. Live: GET /units/:unitRef when signed in.
   *  Demo: the first demo unit, clearly labeled. */
  import { onMount } from 'svelte';
  import { copy, formatCurrency, formatDate, locale } from '$lib/i18n';
  import { auth } from '$lib/api/auth';
  import { fetchUnitDetail, type UnitDetail } from '$lib/api/units';
  import Icon from './Icon.svelte';
  import Skeleton from './Skeleton.svelte';

  let detail = $state<UnitDetail | null>(null);
  let loading = $state(true);
  let live = $state(false);

  onMount(() => {
    const unsubscribe = auth.subscribe(async (session) => {
      live = session.status === 'signed-in';
      if (live && session.user) {
        loading = true;
        try {
          detail = await fetchUnitDetail('101');
        } catch {
          detail = null;
        }
        loading = false;
      }
    });
    return unsubscribe;
  });

  const demoDetail: UnitDetail = {
    unit: { unitRef: '101', floor: 1, sqft: 880, occupancy: 'occupied', tenant: null, rent: null, eht: false, evCharger: false, formK: 'signed', arFundCode: 'ar:unit-101', reconciliationRefs: [] },
    ar: { fundCode: 'ar:unit-101', balanceBasis: 0, entryCount: 12, headTally: [] },
    payments: [
      { refId: 'fees-jan', referenceCode: 'demo-a1b2', rail: 'fiat', amountBasis: 35000, status: 'paid', createdAt: '2026-01-03' },
      { refId: 'fees-dec', referenceCode: 'demo-c3d4', rail: 'lightning', amountBasis: 35000, status: 'paid', createdAt: '2025-12-02' },
      { refId: 'fees-nov', referenceCode: 'demo-e5f6', rail: 'onchain', amountBasis: 35000, status: 'paid', createdAt: '2025-11-04' }
    ]
  };

  const shown = $derived(detail ?? demoDetail);
</script>

<section class="glass-card rounded-2xl p-6">
  <div class="flex items-start justify-between gap-3">
    <div>
      <h3 class="font-bold text-slate-800 flex items-center gap-2">
        <Icon name="home" class="h-4 w-4 text-brand-600" /> {$copy.myUnitTitle}
        {#if live}<span class="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold text-success uppercase">{$copy.liveLabel}</span>{/if}
      </h3>
      <p class="mt-1 text-sm text-slate-500">{$copy.myUnitHint}</p>
    </div>
  </div>

  {#if loading && live}
    <div class="mt-4 space-y-2"><Skeleton height="26px" /><Skeleton height="26px" width="66%" /></div>
  {:else}
    <div class="mt-4 rounded-xl border border-border bg-surface-2/60 p-4">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          <span class="rounded-md bg-bc-blue/10 px-2 py-1 text-xs font-black text-bc-blue">{$copy.unitLabel} {shown.unit.unitRef}</span>
          <span class="text-xs text-slate-500">{shown.unit.sqft} sq ft · floor {shown.unit.floor} · {shown.unit.occupancy}</span>
        </div>
        <span class="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold text-success uppercase">{shown.unit.formK}</span>
      </div>
      <div class="mt-3 grid grid-cols-2 gap-3 text-sm">
        <div class="rounded-xl bg-surface-2 p-3">
          <p class="text-[10px] font-bold text-slate-400 uppercase">{$copy.arBalance}</p>
          <p class="text-lg font-black text-slate-800">{formatCurrency(shown.ar.balanceBasis / 100, $locale)}</p>
        </div>
        <div class="rounded-xl bg-surface-2 p-3">
          <p class="text-[10px] font-bold text-slate-400 uppercase">{$copy.unitPayments}</p>
          <p class="text-lg font-black text-slate-800">{shown.payments.length}</p>
        </div>
      </div>
    </div>

    {#if shown.payments.length}
      <ul class="mt-3 divide-y divide-border/60 rounded-xl border border-border">
        {#each shown.payments.slice(0, 4) as p}
          <li class="flex flex-wrap items-center gap-2 px-3.5 py-2.5 text-sm">
            <span class="font-bold text-slate-700">{formatDate(p.createdAt, $locale)}</span>
            <code class="rounded bg-surface-2 px-1.5 py-0.5 text-[10px] text-slate-500">{p.referenceCode}</code>
            <span class="ml-auto flex items-center gap-1.5">
              <Icon name={p.rail === 'lightning' ? 'lightning' : p.rail === 'onchain' ? 'bitcoin' : 'coins'} class="h-3.5 w-3.5 text-slate-400" />
              <span class="font-bold text-slate-800">{formatCurrency(p.amountBasis / 100, $locale)}</span>
            </span>
          </li>
        {/each}
      </ul>
    {:else}
      <p class="mt-3 rounded-xl border border-dashed border-border px-4 py-4 text-center text-sm text-slate-400">{$copy.unitPaymentsEmpty}</p>
    {/if}
  {/if}
</section>
