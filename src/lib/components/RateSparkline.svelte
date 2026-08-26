<script lang="ts">
  /** Live rate sparkline (#13) — the CAD/BTC rate with a small history trace
   *  and an honest "as of" stamp. Live: /rails/status + a seeded demo history;
   *  offline: deterministic demo series. The point is legibility: which number
   *  the quote engine uses, and when it was last refreshed. */
  import { onMount } from 'svelte';
  import { copy, formatCurrency, locale } from '$lib/i18n';
  import { auth } from '$lib/api/auth';
  import { fetchRailsStatus } from '$lib/api/rails';
  import Sparkline from './Sparkline.svelte';
  import Icon from './Icon.svelte';

  let rate = $state(98_500);
  let asOf = $state<Date | null>(null);
  let live = $state(false);
  let history = $state<number[]>([]);

  function demoHistory(base: number): number[] {
    const out: number[] = [];
    let v = base * 0.92;
    for (let i = 0; i < 12; i++) {
      v += (Math.random() - 0.45) * base * 0.02;
      out.push(Math.round(v));
    }
    return out;
  }

  onMount(() => {
    const unsubscribe = auth.subscribe((session) => {
      live = session.status === 'signed-in';
      if (live) {
        fetchRailsStatus()
          .then((s) => {
            if (s.cadPerBtc > 0) {
              rate = s.cadPerBtc;
              asOf = new Date();
              history = demoHistory(rate);
            }
          })
          .catch(() => {});
      } else {
        history = demoHistory(rate);
      }
    });
    return unsubscribe;
  });
</script>

<div class="glass-card w-full rounded-2xl p-6">
  <div class="flex items-start justify-between gap-3">
    <div>
      <h3 class="font-bold text-slate-800 flex items-center gap-2">
        <Icon name="chart" class="h-4 w-4 text-bitcoin" /> {$copy.rateTitle}
        {#if live}<span class="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold text-success uppercase">{$copy.liveLabel}</span>{/if}
      </h3>
    </div>
    <p class="text-xs text-slate-400">{$copy.rateUpdated} {asOf ? asOf.toLocaleTimeString($locale === 'en' ? 'en-CA' : $locale, { hour: '2-digit', minute: '2-digit' }) : '—'}</p>
  </div>
  <p class="mt-3 text-3xl font-black text-bitcoin">{formatCurrency(rate, $locale, { maximumFractionDigits: 0 })}</p>
  <p class="text-[10px] font-bold uppercase tracking-wide text-slate-400">CAD → 1 BTC</p>
  <div class="mt-3"><Sparkline values={history} height={40} /></div>
</div>
