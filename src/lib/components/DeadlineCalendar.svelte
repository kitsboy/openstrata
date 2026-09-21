<script lang="ts">
  /**
   * Deadline calendar — the month view of what's due.
   *
   * Replaces the dashboard's "Upcoming" list (which made a council do date
   * math in their head) with a real grid: due dates marked, statutory windows
   * shaded, overdue red, today ringed. Live deadlines when signed in, the
   * honest demo set otherwise — the same rule the task list follows.
   *
   * Geometry lives in `src/lib/calendar.ts` (pure, tested); this component
   * fetches, renders and navigates months.
   */
  import { onMount } from 'svelte';
  import { copy, formatDate, locale } from '$lib/i18n';
  import { auth } from '$lib/api/auth';
  import { fetchDeadlines, type DeadlineItem } from '$lib/api/deadlines';
  import { buildCalendarMonth } from '$lib/calendar';
  import { demoTaskDeadlines } from '$lib/tasks';
  import Icon from '$lib/components/Icon.svelte';
  import Skeleton from '$lib/components/Skeleton.svelte';
  import CalendarDayPopover from '$lib/components/CalendarDayPopover.svelte';

  let live = $state(false);
  let loading = $state(false);
  let deadlines = $state<DeadlineItem[] | null>(null);
  let cursor = $state(new Date());
  /** ISO of the day whose popover is open, and the day's own cell element. */
  let openDay = $state<string | null>(null);
  let openAnchor = $state<HTMLElement | null>(null);
  let gridEl = $state<HTMLElement | null>(null);

  const year = $derived(cursor.getFullYear());
  const monthIndex0 = $derived(cursor.getMonth());

  const cells = $derived(
    buildCalendarMonth(deadlines ?? demoTaskDeadlines, year, monthIndex0)
  );

  const monthLabel = $derived(
    formatDate(new Date(year, monthIndex0, 1), $locale, { month: 'long', year: 'numeric' })
  );

  const weekdayLabels = $derived.by(() => {
    // 2026-09-06 is a Sunday: seven labels in the viewer's locale.
    const base = new Date(2026, 8, 6);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      return formatDate(d, $locale, { weekday: 'narrow' });
    });
  });

  onMount(() => {
    const unsubscribe = auth.subscribe((session) => {
      live = session.status === 'signed-in';
      if (!live) {
        deadlines = null;
        return;
      }
      loading = true;
      fetchDeadlines()
        .then((fetched) => (deadlines = fetched))
        .catch(() => (deadlines = []))
        .finally(() => (loading = false));
    });
    return unsubscribe;
  });

  function prevMonth() {
    cursor = new Date(year, monthIndex0 - 1, 1);
  }
  function nextMonth() {
    cursor = new Date(year, monthIndex0 + 1, 1);
  }
  function thisMonth() {
    cursor = new Date();
  }

  const POPOVER_WIDTH = 170;
  const GRID_PADDING = 24; // the card's own p-6, part of the clamp space

  /** Pin the popover under the clicked cell, clamped inside the grid. */
  function popoverStyleFor(cell: HTMLElement): string {
    const width = (gridEl?.clientWidth ?? 0) + GRID_PADDING;
    const left = Math.max(
      0,
      Math.min(
        cell.offsetLeft + (cell.offsetWidth < POPOVER_WIDTH ? 0 : cell.offsetWidth - POPOVER_WIDTH),
        width - POPOVER_WIDTH
      )
    );
    return `top: ${cell.offsetTop + cell.offsetHeight + 4}px; left: ${left}px;`;
  }

  function toggleDay(iso: string, cell: HTMLElement) {
    if (openDay === iso) {
      openDay = null;
      openAnchor = null;
      return;
    }
    openDay = iso;
    openAnchor = cell;
  }

  function closePopover() {
    openDay = null;
    openAnchor = null;
  }

  function onGridKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') closePopover();
  }

  function onDocumentPointerdown(event: PointerEvent) {
    const target = event.target as Node | null;
    if (openAnchor && target && !openAnchor.contains(target)) closePopover();
  }

  onMount(() => {
    document.addEventListener('pointerdown', onDocumentPointerdown);
    return () => document.removeEventListener('pointerdown', onDocumentPointerdown);
  });
</script>

<section class="glass-card rounded-2xl p-6" aria-label={$copy.calTitle}>
  <div class="flex flex-wrap items-start justify-between gap-3">
    <div class="min-w-0">
      <h3 class="flex items-center gap-2 font-bold text-slate-800">
        <Icon name="calendar" class="h-4 w-4 text-brand-600" /> {$copy.calTitle}
        {#if live}
          <span class="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold text-success uppercase">{$copy.liveLabel}</span>
        {:else}
          <span class="rounded-full bg-surface-3 px-2 py-0.5 text-[10px] font-bold text-slate-500 uppercase">{$copy.demo}</span>
        {/if}
      </h3>
      <p class="mt-1 text-sm text-slate-500">{$copy.calHint}</p>
    </div>
    <div class="flex items-center gap-1">
      <button type="button" class="cal-nav" aria-label="{$copy.goBack} 1" onclick={prevMonth}>‹</button>
      <button type="button" class="cal-nav cal-nav-today" onclick={thisMonth}>{$copy.tasksFilterWeek === 'This week' ? monthLabel : monthLabel}</button>
      <button type="button" class="cal-nav" aria-label="{$copy.tasksMore} 1" onclick={nextMonth}>›</button>
    </div>
  </div>

  {#if loading}
    <div class="mt-4"><Skeleton height="220px" /></div>
  {:else}
    <!-- Escape must work wherever focus sits inside the grid; the interactive
         elements are the cell buttons below, this div only catches the bubble. -->
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <div
      class="cal-grid mt-4"
      role="group"
      aria-label={monthLabel}
      bind:this={gridEl}
      onkeydown={onGridKeydown}
    >
      {#each weekdayLabels as label, i (i)}
        <div class="cal-dow" role="columnheader">{label}</div>
      {/each}
      {#each cells as cell (cell.iso)}
        <button
          type="button"
          class="cal-cell"
          class:cal-out={ !cell.inMonth }
          class:cal-today={ cell.isToday }
          class:cal-window={ cell.inWindow }
          class:cal-overdue={ cell.hasOverdue }
          class:cal-open={ openDay === cell.iso }
          aria-expanded={openDay === cell.iso}
          aria-label="{cell.iso}{cell.items.length ? ', ' + cell.items.map((i) => i.title).join(', ') : ''}"
          onclick={(event) => toggleDay(cell.iso, event.currentTarget as HTMLElement)}
        >
          <span class="cal-day">{cell.dayOfMonth}</span>
          {#if cell.hasOverdue}<span class="cal-dot cal-dot-overdue"></span>{/if}
          {#each cell.items as item (item.id)}
            <span class="cal-event" title={item.title}></span>
          {/each}
        </button>
      {/each}
    </div>
    {#if openDay && openAnchor}
      {@const openCell = cells.find((c) => c.iso === openDay)}
      {#if openCell && openCell.items.length}
        <CalendarDayPopover day={openCell} style={popoverStyleFor(openAnchor)} onclose={closePopover} />
      {/if}
    {/if}
    <div class="mt-3 flex flex-wrap items-center gap-4 text-[10px] font-bold text-slate-400">
      <span class="flex items-center gap-1.5"><span class="cal-legend cal-legend-event"></span>{$copy.calLegendDue}</span>
      <span class="flex items-center gap-1.5"><span class="cal-legend cal-legend-window"></span>{$copy.calLegendWindow}</span>
      <span class="flex items-center gap-1.5"><span class="cal-legend cal-legend-overdue"></span>{$copy.tasksOverdue}</span>
    </div>
  {/if}
</section>

<style>
  .cal-nav {
    min-width: 30px;
    padding: 4px 8px;
    border: 1px solid var(--line);
    border-radius: 8px;
    color: var(--muted);
    background: var(--paper);
    font-size: 12px;
    font-weight: 700;
  }
  .cal-nav:hover { color: var(--ink); border-color: var(--orange-solid); }
  .cal-nav-today { min-width: 0; }

  .cal-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 2px;
  }
  .cal-dow {
    padding: 2px 0 4px;
    color: var(--faint);
    font-size: 9px;
    font-weight: 800;
    text-align: center;
    text-transform: uppercase;
  }
  .cal-cell {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1px;
    min-height: 34px;
    padding: 2px;
    border-radius: 6px;
    text-align: center;
  }
  @media (hover: hover) {
    .cal-cell:hover { background: color-mix(in srgb, var(--color-brand-500) 8%, transparent); }
  }
  .cal-open {
    background: color-mix(in srgb, var(--color-brand-500) 16%, transparent);
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--color-brand-500) 40%, transparent);
  }
  .cal-grid { position: relative; }
  .cal-out { opacity: 0.35; }
  .cal-today { box-shadow: inset 0 0 0 1.5px var(--color-brand-500); }
  .cal-window { background: color-mix(in srgb, var(--color-brand-500) 12%, transparent); }
  .cal-overdue .cal-day { color: var(--color-danger); font-weight: 800; }
  .cal-day { font-size: 11px; font-weight: 600; color: var(--ink); }

  .cal-event {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--color-brand-600);
  }
  .cal-dot-overdue {
    position: absolute;
    top: 3px;
    right: 3px;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--color-danger);
  }

  .cal-legend { display: inline-block; width: 8px; height: 8px; border-radius: 3px; }
  .cal-legend-event { background: var(--color-brand-600); }
  .cal-legend-window { background: color-mix(in srgb, var(--color-brand-500) 12%, transparent); border: 1px solid color-mix(in srgb, var(--color-brand-500) 30%, transparent); }
  .cal-legend-overdue { background: var(--color-danger); }
</style>
