<script lang="ts">
  /** In-app notifications (#19): a bell feed driven by real events — deadline
   *  approaching, quote expiring — plus a local read state. Replaces the demo
   *  toast-only notifications when live data is available. */
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { copy } from '$lib/i18n';
  import { auth } from '$lib/api/auth';
  import { fetchDeadlines, type DeadlineItem } from '$lib/api/deadlines';
  import Icon from './Icon.svelte';
  import EmptyState from './EmptyState.svelte';

  interface Notif {
    id: string;
    title: string;
    meta: string;
    tone: 'urgent' | 'info';
    read: boolean;
  }

  const READ_KEY = 'openstrata-notifications-read';

  let items = $state<Notif[]>([]);
  let loaded = $state(false);
  let readIds = $state<Set<string>>(new Set());

  onMount(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(READ_KEY) ?? '[]');
      if (Array.isArray(saved)) readIds = new Set(saved.map(String));
    } catch {
      /* fresh start */
    }

    const unsubscribe = auth.subscribe((session) => {
      if (session.status !== 'signed-in') {
        items = [];
        loaded = true;
        return;
      }
      fetchDeadlines()
        .then((dl) => {
          const urgent = dl.filter((d) => d.daysLeft <= 14);
          items = [
            ...urgent.map((d: DeadlineItem): Notif => ({
              id: `dl:${d.id}`,
              title: d.title,
              meta: `${d.daysLeft < 0 ? $copy.deadlinesOverdue : `${d.daysLeft} ${$copy.deadlinesDays}`} · ${d.dueAt}`,
              tone: 'urgent',
              read: readIds.has(`dl:${d.id}`)
            }))
          ].slice(0, 8);
          loaded = true;
        })
        .catch(() => { loaded = true; });
    });
    return unsubscribe;
  });

  function markAllRead() {
    readIds = new Set(items.map((n) => n.id));
    items = items.map((n) => ({ ...n, read: true }));
    try {
      localStorage.setItem(READ_KEY, JSON.stringify([...readIds]));
    } catch {
      /* storage unavailable */
    }
  }
</script>

<div class="notifications-panel-inner" role="menu" aria-label={$copy.notifications}>
  <div class="flex items-center justify-between px-4 pt-3">
    <span class="menu-heading !p-0">{$copy.notifications}</span>
    {#if items.length > 0}
      <button class="text-[10px] font-bold text-brand-600 uppercase" onclick={markAllRead}>{$copy.notificationsEmpty}</button>
    {/if}
  </div>
  {#if !loaded}
    <p class="px-4 py-6 text-center text-xs text-slate-400">…</p>
  {:else if items.length === 0}
    <div class="px-4 py-6"><EmptyState icon="bell" title={$copy.notificationsEmpty} /></div>
  {:else}
    <div class="max-h-72 overflow-y-auto py-2">
      {#each items as notif}
        <div class="flex items-start gap-3 px-4 py-2.5">
          <span class={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${notif.tone === 'urgent' ? 'bg-danger/10 text-danger' : 'bg-brand-600/10 text-brand-700'}`}>
            <Icon name="alert" class="h-3.5 w-3.5" />
          </span>
          <div class="min-w-0">
            <p class="text-xs font-bold text-slate-800">{notif.title}</p>
            <p class="text-[11px] text-slate-400">{notif.meta}</p>
          </div>
          {#if !notif.read}<span class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600"></span>{/if}
        </div>
      {/each}
    </div>
  {/if}
</div>
