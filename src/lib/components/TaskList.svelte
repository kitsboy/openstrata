<script lang="ts">
  /**
   * What needs doing — the dashboard's one list.
   *
   * Replaces four boxes that each answered part of the same question (the setup
   * checklist, the statutory deadlines, the Forms tracker's 7-day windows and
   * the month-end close). The order comes from `$lib/tasks`, which is pure and
   * tested; this component only fetches, renders and remembers what was ticked.
   *
   * Two things stay honest:
   *   - Signed out, the rows are labelled **demo**. The statutory items are real
   *     (EPR, AGM, the 7-day Form B window); the dates are not.
   *   - Ticking a setup row is local-only, exactly as before. The workspace is
   *     the record of truth, this is a nudge.
   */
  import { onMount } from 'svelte';
  import { copy, formatDate, locale } from '$lib/i18n';
  import { auth } from '$lib/api/auth';
  import { fetchDeadlines, type DeadlineItem } from '$lib/api/deadlines';
  import Icon from '$lib/components/Icon.svelte';
  import Skeleton from '$lib/components/Skeleton.svelte';
  import {
    SETUP_HIDE_KEY,
    SETUP_KEY,
    parseProgress,
    serializeProgress,
    toggleStep,
    type SetupStepId
  } from '$lib/setup';
  import {
    TASKS_HIDE_KEY,
    buildTaskList,
    demoTaskDeadlines,
    taskCounts,
    type Task
  } from '$lib/tasks';

  let live = $state(false);
  let loading = $state(false);
  let deadlines = $state<DeadlineItem[] | null>(null);
  let done = $state<SetupStepId[]>([]);
  let hidden = $state(false);
  let expanded = $state(false);

  /** Steps, in the order a building actually needs them. Labels come from i18n. */
  const setupSteps = $derived([
    { id: 'units' as const, title: $copy.setupStep1, hint: $copy.setupHint1, href: '/tools' },
    { id: 'funds' as const, title: $copy.setupStep2, hint: $copy.setupHint2, href: '/tools/wizard' },
    { id: 'bylaws' as const, title: $copy.setupStep3, hint: $copy.setupHint3, href: '/templates' },
    { id: 'month' as const, title: $copy.setupStep4, hint: $copy.setupHint4, href: '/tools' }
  ]);

  const rows = $derived(
    buildTaskList({
      deadlines: deadlines ?? demoTaskDeadlines,
      setupSteps,
      setupDone: done,
      limit: expanded ? 0 : undefined
    })
  );
  const counts = $derived(taskCounts(rows.tasks));

  function persist() {
    try {
      localStorage.setItem(SETUP_KEY, serializeProgress({ done, hidden: false }));
      localStorage.setItem(SETUP_HIDE_KEY, '0');
    } catch {
      /* storage unavailable — the list still works, just stateless */
    }
  }

  function setHidden(next: boolean) {
    hidden = next;
    try {
      localStorage.setItem(TASKS_HIDE_KEY, next ? '1' : '0');
    } catch {
      /* storage unavailable */
    }
  }

  onMount(() => {
    const progress = parseProgress(localStorage.getItem(SETUP_KEY));
    done = progress.done;
    // Two hide keys on purpose: SETUP_HIDE_KEY predates this list and a returning
    // council that dismissed the old checklist should not see a resurrected one.
    hidden =
      localStorage.getItem(TASKS_HIDE_KEY) === '1' ||
      progress.hidden ||
      localStorage.getItem(SETUP_HIDE_KEY) === '1';

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

  /**
   * The chip is a neutral plate with a coloured dot, not coloured text on a
   * coloured tint.
   *
   * `text-warning bg-warning/10` is the obvious way to do this and it is the way
   * this kind of chip was written before — but a 10%-amber tint under amber text
   * is a contrast pairing nothing in `audit:contrast` covers, and the honest
   * answer to "is it 4.5:1?" was "probably, on this machine". A dot carries the
   * urgency (it is decorative, so it has no contrast floor) and the label sits on
   * `surface-3` with `slate-700`, which the audit does check.
   */
  const chipClass = 'bg-surface-3 text-slate-700';

  const dotColor = (urgency: Task['urgency']) =>
    urgency === 'overdue'
      ? 'var(--color-danger)'
      : urgency === 'urgent'
        ? 'var(--color-warning)'
        : urgency === 'soon'
          ? 'var(--color-brand-500)'
          : 'var(--faint)';

  const chipLabel = (urgency: Task['urgency']) =>
    urgency === 'overdue'
      ? $copy.tasksOverdue
      : urgency === 'urgent'
        ? $copy.urgent
        : urgency === 'soon'
          ? $copy.tasksSoon
          : urgency === 'setup'
            ? $copy.tasksSetup
            : $copy.tasksRoutine;

  const daysLabel = (task: Task) =>
    task.daysLeft === undefined
      ? ''
      : task.daysLeft < 0
        ? $copy.deadlinesOverdue
        : `${task.daysLeft} ${$copy.deadlinesDays}`;
</script>

{#if hidden}
  <button class="tasks-restore" type="button" onclick={() => setHidden(false)}>
    <Icon name="check" class="h-3.5 w-3.5" />
    {$copy.tasksShow}
  </button>
{:else}
  <section class="glass-card rounded-2xl p-6" aria-label={$copy.tasksTitle}>
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div class="min-w-0">
        <h3 class="flex items-center gap-2 font-bold text-slate-800">
          <Icon name="check" class="h-4 w-4 text-brand-600" /> {$copy.tasksTitle}
          {#if live}
            <span class="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold text-success uppercase">{$copy.liveLabel}</span>
          {:else}
            <span class="rounded-full bg-surface-3 px-2 py-0.5 text-[10px] font-bold text-slate-500 uppercase">{$copy.demo}</span>
          {/if}
        </h3>
        <p class="mt-1 text-sm text-slate-500">
          {counts.overdue > 0 ? `${counts.overdue} ${$copy.tasksOverdue} · ` : ''}{$copy.tasksHint}
        </p>
      </div>
      <button
        type="button"
        class="rounded-lg px-2 py-1 text-xs font-bold text-slate-500 hover:text-slate-700"
        aria-label={$copy.tasksHide}
        title={$copy.tasksHide}
        onclick={() => setHidden(true)}
      >
        <Icon name="close" class="h-3.5 w-3.5" />
      </button>
    </div>

    <div class="mt-4 space-y-2">
      {#if loading}
        <Skeleton height="48px" />
        <Skeleton height="48px" />
        <Skeleton height="48px" />
      {:else if rows.tasks.length === 0}
        <p class="flex items-center gap-2 rounded-xl border border-border bg-surface-2 p-4 text-sm font-semibold text-slate-600">
          <Icon name="check" class="h-4 w-4 text-success" /> {$copy.tasksEmpty}
        </p>
      {:else}
        {#each rows.tasks as task (task.id)}
          <div class="tasks-row flex items-center gap-3 rounded-xl border border-border bg-surface-2 p-3">
            {#if task.setup}
              <button
                type="button"
                role="checkbox"
                aria-checked={false}
                aria-label={task.title}
                class="tasks-tick"
                onclick={() => { done = toggleStep(done, task.setup!); persist(); }}
              >
                <Icon name="check" class="h-3.5 w-3.5" />
              </button>
            {:else}
              <span class={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${chipClass}`}>
                <span class="h-1.5 w-1.5 rounded-full" style="background: {dotColor(task.urgency)}" aria-hidden="true"></span>
                {chipLabel(task.urgency)}
              </span>
            {/if}

            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-semibold text-slate-800">{task.title}</p>
              <p class="truncate text-xs text-slate-400">
                {#if task.setup}
                  {task.detail}
                {:else}
                  {formatDate(task.detail, $locale, { month: 'short', day: 'numeric', year: 'numeric' })}
                {/if}
              </p>
            </div>

            {#if daysLabel(task)}
              <span class="shrink-0 text-xs font-bold {task.daysLeft !== undefined && task.daysLeft < 0 ? 'text-danger' : 'text-slate-500'}">
                {daysLabel(task)}
              </span>
            {/if}

            <a class="tasks-open shrink-0 text-xs font-bold text-brand-700 no-underline hover:underline" href={task.href}>
              {$copy.setupOpen} <span aria-hidden="true">→</span>
            </a>
          </div>
        {/each}
      {/if}
    </div>

    {#if rows.more > 0}
      <button
        type="button"
        class="mt-3 text-xs font-bold text-brand-700 hover:underline"
        onclick={() => (expanded = true)}
      >
        {rows.more} {$copy.tasksMore} →
      </button>
    {/if}
  </section>
{/if}

<style>
  .tasks-restore {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 20px;
    padding: 7px 12px;
    border: 1px dashed var(--line);
    border-radius: 10px;
    color: var(--muted);
    background: transparent;
    font-size: 11px;
    font-weight: 700;
  }
  .tasks-restore:hover { color: var(--ink); border-color: var(--orange-solid); }

  .tasks-tick {
    flex: 0 0 auto;
    display: grid;
    place-items: center;
    width: 24px;
    height: 24px;
    border: 1px solid var(--line);
    border-radius: 8px;
    background: var(--paper);
    color: var(--faint);
  }
  .tasks-tick:hover { border-color: var(--orange-solid); color: var(--orange-solid); }

  .tasks-row { transition: border-color 0.2s ease; }
  .tasks-row:hover { border-color: color-mix(in srgb, var(--color-brand-500) 35%, var(--line)); }

  @media (max-width: 640px) {
    /* The arrow is decoration; on a phone the whole row is the target. */
    .tasks-open { display: none; }
  }
</style>
