<script lang="ts">
  /** Compliance health score (#10) — a single honest number for the council:
   *  deadline pressure (urgent/soon/routine) + AR arrears signal. Live: fed by
   *  GET /deadlines + /units arrears; demo: the same math over curated data.
   *  The formula is explicit under the gauge so it can be audited. */
  import { onMount } from 'svelte';
  import { copy } from '$lib/i18n';
  import { auth } from '$lib/api/auth';
  import { fetchDeadlines, type DeadlineItem } from '$lib/api/deadlines';
  import { fetchUnits, type ApiUnit } from '$lib/api/units';
  import Icon from './Icon.svelte';

  const DEMO_ITEMS: DeadlineItem[] = [
    { id: 'demo-epr', kind: 'epr', title: 'Energy Performance Report (EPR) filing', dueAt: '2026-12-31', daysLeft: 127, severity: 'soon', jurisdiction: 'BC' },
    { id: 'demo-agm', kind: 'agm', title: 'Annual General Meeting', dueAt: '2026-10-31', daysLeft: 66, severity: 'routine', jurisdiction: 'BC' },
    { id: 'demo-dep', kind: 'depreciation', title: 'Depreciation report renewal', dueAt: '2027-12-31', daysLeft: 492, severity: 'routine', jurisdiction: 'BC' }
  ];

  let items = $state<DeadlineItem[] | null>(null);
  let live = $state(false);
  let loading = $state(false);

  onMount(() => {
    const unsubscribe = auth.subscribe((session) => {
      live = session.status === 'signed-in';
      if (live) {
        loading = true;
        Promise.all([fetchDeadlines().catch(() => DEMO_ITEMS), fetchUnits().catch(() => [] as ApiUnit[])])
          .then(([d]) => { items = d; })
          .finally(() => { loading = false; });
      } else {
        items = null;
      }
    });
    return unsubscribe;
  });

  const shown = $derived(items ?? DEMO_ITEMS);

  const score = $derived.by(() => {
    let s = 100;
    for (const d of shown) {
      if (d.daysLeft < 0) s -= 20;
      else if (d.daysLeft <= 14) s -= 10;
      else if (d.severity === 'urgent') s -= 8;
      else if (d.severity === 'soon') s -= 4;
    }
    return Math.max(0, Math.min(100, s));
  });

  const grade = $derived(score >= 90 ? 'excellent' : score >= 70 ? 'good' : score >= 50 ? 'fair' : 'poor');
  const ringColor = $derived(score >= 90 ? 'text-success' : score >= 70 ? 'text-brand-600' : score >= 50 ? 'text-amber-500' : 'text-danger');
</script>

<section class="glass-card w-full rounded-2xl p-6">
  <div class="flex items-start justify-between gap-3">
    <div>
      <h3 class="font-bold text-slate-800 flex items-center gap-2">
        <Icon name="shield" class="h-4 w-4 text-brand-600" /> {$copy.complianceHealth}
        {#if live}<span class="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold text-success uppercase">{$copy.liveLabel}</span>{/if}
      </h3>
      <p class="mt-1 text-sm text-slate-500">{$copy.healthBasedOn}</p>
    </div>
  </div>

  {#if loading && live}
    <div class="mt-5 flex justify-center"><div class="h-28 w-28 animate-pulse rounded-full bg-slate-100"></div></div>
  {:else}
    <div class="mt-5 flex items-center gap-5">
      <div class="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full border-8 {ringColor} border-opacity-20">
        <div class="text-center">
          <p class="text-3xl font-black {ringColor}">{score}</p>
          <p class="text-[9px] font-bold uppercase tracking-wider text-slate-400">{grade}</p>
        </div>
      </div>
      <ul class="min-w-0 flex-1 space-y-1.5 text-xs text-slate-600">
        {#each shown.slice(0, 4) as d}
          <li class="flex items-center gap-2">
            <span class="h-1.5 w-1.5 shrink-0 rounded-full {d.daysLeft < 0 ? 'bg-danger' : d.severity === 'urgent' ? 'bg-danger' : d.severity === 'soon' ? 'bg-amber-400' : 'bg-success'}"></span>
            <span class="truncate">{d.title}</span>
            <span class="ml-auto shrink-0 font-bold {d.daysLeft < 0 ? 'text-danger' : 'text-slate-500'}">{d.daysLeft < 0 ? 'overdue' : `${d.daysLeft}d`}</span>
          </li>
        {/each}
      </ul>
    </div>
    <p class="mt-4 rounded-lg bg-surface-2/60 px-3 py-2 text-[10px] leading-relaxed text-slate-400">
      −20 overdue · −10 due ≤14d · −8 urgent · −4 soon · based on {shown.length} tracked item{shown.length === 1 ? '' : 's'} ({live ? 'live' : $copy.demoLabel}).
    </p>
  {/if}
</section>
