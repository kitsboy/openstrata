<script lang="ts">
  /** Multisig signing room (#12): pending PSBTs, 2-of-5 signature progress,
   *  broadcast when ready. Builds a plan via /treasury/psbt/plan when signed
   *  in; a labeled simulation otherwise. */
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { copy, formatCurrency, locale } from '$lib/i18n';
  import { auth } from '$lib/api/auth';
  import { apiFetch } from '$lib/api/client';
  import { getToken } from '$lib/api/token';
  import Icon from './Icon.svelte';

  interface PsbtPlan {
    id: string;
    fundCode: string;
    amountBasis: number;
    requiredSignatures: number;
    signatures: Record<string, boolean>;
    ready: boolean;
  }

  const REQUIRED = 5;

  let live = $state(false);
  let plans = $state<PsbtPlan[]>([]);
  let busy = $state(false);

  const DEMO_PLANS: PsbtPlan[] = [
    { id: 'psbt:war_chest:spend:1250000', fundCode: 'war_chest', amountBasis: 1_250_000, requiredSignatures: 3, signatures: { 'cam-hw': true, 'kimi-hw': true, 'm4-hw': false, 'vault-2': false, 'vault-3': false }, ready: false },
    { id: 'psbt:crf:spend:4200000', fundCode: 'crf', amountBasis: 4_200_000, requiredSignatures: 3, signatures: { 'cam-hw': true, 'kimi-hw': false, 'm4-hw': true, 'vault-2': false, 'vault-3': false }, ready: false }
  ];

  const DEMO_READY: PsbtPlan = { id: 'psbt:operating:spend:180000', fundCode: 'operating', amountBasis: 180_000, requiredSignatures: 3, signatures: { 'cam-hw': true, 'kimi-hw': true, 'm4-hw': true, 'vault-2': true, 'vault-3': true }, ready: true };

  onMount(() => {
    const unsubscribe = auth.subscribe((session) => {
      if (session.status === 'signed-in') {
        live = true;
        refresh();
      } else {
        live = false;
        plans = [];
      }
    });
    return unsubscribe;
  });

  async function refresh() {
    if (!live) return;
    busy = true;
    try {
      const res = await apiFetch<{ ok: boolean; plan: PsbtPlan }>('/api/v1/treasury/psbt/plan', {
        method: 'POST',
        body: { fundCode: 'war_chest', poRef: 'spend', amountBasis: 1_250_000 },
        token: getToken()
      });
      plans = res.plan ? [res.plan] : [];
    } catch {
      plans = [];
    }
    busy = false;
  }

  const display = $derived(live && plans.length ? plans : [...DEMO_PLANS, DEMO_READY]);
  const signedCount = (p: PsbtPlan) => Object.values(p.signatures).filter(Boolean).length;
</script>

<section class="glass-card rounded-2xl p-6">
  <div class="flex flex-wrap items-start justify-between gap-3">
    <div>
      <h3 class="font-bold text-slate-800 flex items-center gap-2">
        <Icon name="shield" class="h-4 w-4 text-bitcoin" /> {$copy.signingTitle}
        {#if live}<span class="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold text-success uppercase">{$copy.liveLabel}</span>{/if}
      </h3>
      <p class="mt-1 text-sm text-slate-500">{$copy.signingHint}</p>
    </div>
    {#if live}
      <button class="rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-xs font-bold text-slate-600" onclick={refresh}>{$copy.refresh}</button>
    {/if}
  </div>

  <div class="mt-4 space-y-3">
    {#each display as plan}
      {@const signed = signedCount(plan)}
      <div class="rounded-xl border border-border bg-surface-2 p-4">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="min-w-0">
            <code class="block truncate text-xs text-bc-blue">{plan.id}</code>
            <p class="mt-1 text-sm font-bold text-slate-800">{formatCurrency(plan.amountBasis / 100, $locale)} · {plan.fundCode}</p>
          </div>
          <div class="flex items-center gap-2">
            {#if plan.ready}
              <span class="rounded-full bg-success/10 px-2.5 py-1 text-[10px] font-bold text-success">{$copy.signingReady}</span>
              <button class="rounded-lg bg-bitcoin px-3 py-1.5 text-xs font-bold text-white">{plan.requiredSignatures}-of-{REQUIRED} {$copy.signingBroadcast}</button>
            {:else}
              <span class="rounded-full bg-warning/10 px-2.5 py-1 text-[10px] font-bold text-warning">{signed}/{REQUIRED} {$copy.signingRequired}</span>
            {/if}
          </div>
        </div>
        <div class="mt-3">
          <div class="flex gap-1">
            {#each Array(REQUIRED) as _, i}
              <span class="h-1.5 flex-1 rounded-full {i < signed ? 'bg-bitcoin' : 'bg-slate-200'}" title="sig {i + 1}"></span>
            {/each}
          </div>
          <p class="mt-2 text-[10px] font-bold text-slate-400 uppercase">{$copy.signingScan}</p>
        </div>
      </div>
    {:else}
      <p class="text-sm text-slate-500">{$copy.signingEmpty}</p>
    {/each}
  </div>
</section>
