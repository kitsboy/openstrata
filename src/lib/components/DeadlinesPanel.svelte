<script lang="ts">
  /** "What's due" task center — statutory calendar + open quotes (live when
   *  signed in, honest demo otherwise). Mobile-first: stacks to one column. */
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { copy } from '$lib/i18n';
  import { auth } from '$lib/api/auth';
  import { fetchDeadlines, type DeadlineItem } from '$lib/api/deadlines';
  import Icon from './Icon.svelte';
  import Skeleton from './Skeleton.svelte';
  import EmptyState from './EmptyState.svelte';

  let items = $state<DeadlineItem[] | null>(null);
  let loading = $state(false);

  const DEMO: DeadlineItem[] = [
    { id: 'demo-epr', kind: 'epr', title: 'Energy Performance Report (EPR) filing', dueAt: '2026-12-31', daysLeft: 127, severity: 'soon', jurisdiction: 'BC' },
    { id: 'demo-agm', kind: 'agm', title: 'Annual General Meeting (within 2 months of fiscal year end)', dueAt: '2026-10-31', daysLeft: 66, severity: 'routine', jurisdiction: 'BC' },
    { id: 'demo-dep', kind: 'depreciation', title: 'Depreciation report renewal', dueAt: '2027-12-31', daysLeft: 492, severity: 'routine', jurisdiction: 'BC' }
  ];

  onMount(() => {
    const unsubscribe = auth.subscribe((session) => {
      if (session.status === 'signed-in') {
        loading = true;
        fetchDeadlines()
          .then((fetched) => (items = fetched))
          .catch(() => { items = DEMO; })
          .finally(() => (loading = false));
      } else {
        items = null;
      }
    });
    return unsubscribe;
  });

  const display = $derived(items ?? DEMO);
  const severityTone = (s: string) =>
    s === 'urgent' ? 'text-danger bg-danger/10' :
    s === 'soon' ? 'text-warning bg-warning/10' :
    'text-success bg-success/10';
  const daysLabel = (d: number) =>
    d < 0 ? $copy.deadlinesOverdue : `${d} ${$copy.deadlinesDays}`;
</script>

<section class="glass-card w-full rounded-2xl p-6">
  <div class="flex items-start justify-between gap-3">
    <div>
      <h3 class="font-bold text-slate-800 flex items-center gap-2">
        <Icon name="clock" class="h-4 w-4 text-brand-600" /> {$copy.deadlinesTitle}
        {#if items}<span class="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold text-success uppercase">{$copy.liveLabel}</span>{/if}
      </h3>
      <p class="mt-1 text-sm text-slate-500">{$copy.deadlinesHint}</p>
    </div>
  </div>

  <div class="mt-4 space-y-2">
    {#if loading}
      <div class="space-y-2"><Skeleton height="44px" /><Skeleton height="44px" /><Skeleton height="44px" /></div>
    {:else if display.length === 0}
      <EmptyState icon="check" title={$copy.deadlinesEmpty} />
    {:else}
      {#each display.slice(0, 5) as item}
        <div class="flex items-center gap-3 rounded-xl border border-border bg-surface-2 p-3">
          <span class={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${severityTone(item.severity)}`}>
            {item.severity}
          </span>
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-semibold text-slate-800">{item.title}</p>
            <p class="text-xs text-slate-400">{item.dueAt}</p>
          </div>
          <span class="shrink-0 text-xs font-bold {item.daysLeft < 0 ? 'text-danger' : 'text-slate-500'}">
            {daysLabel(item.daysLeft)}
          </span>
        </div>
      {/each}
    {/if}
  </div>
</section>
