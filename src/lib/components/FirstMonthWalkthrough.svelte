<script lang="ts">
  /**
   * First-month walkthrough — the guided path through a council's first
   * billing cycle, mounted at the top of the tools page.
   *
   * Five steps in treasurer order (bill → collect → reconcile → review →
   * close), each linking to the real interactive panel where that step
   * happens. Progress is device-local (`src/lib/first-month.ts`): ticked by
   * hand, resettable, hidden on demand. It is a nudge with a reset button,
   * never a gate — every panel below works with or without it.
   */
  import { onMount } from 'svelte';
  import { copy } from '$lib/i18n';
  import Icon from '$lib/components/Icon.svelte';
  import {
    FIRST_MONTH_HIDE_KEY,
    FIRST_MONTH_KEY,
    firstMonthFraction,
    nextFirstMonthStep,
    parseFirstMonth,
    serializeFirstMonth,
    toggleFirstMonthStep,
    type FirstMonthProgress,
    type FirstMonthStepId
  } from '$lib/first-month';

  let progress = $state<FirstMonthProgress>({ done: [], hidden: false });

  const steps = $derived([
    { id: 'bill' as const, title: $copy.fmStep1, hint: $copy.fmHint1, href: '/tools#live-demos' },
    { id: 'collect' as const, title: $copy.fmStep2, hint: $copy.fmHint2, href: '/tools#live-demos' },
    { id: 'reconcile' as const, title: $copy.fmStep3, hint: $copy.fmHint3, href: '/tools#live-demos' },
    { id: 'review' as const, title: $copy.fmStep4, hint: $copy.fmHint4, href: '/compliance' },
    { id: 'close' as const, title: $copy.fmStep5, hint: $copy.fmHint5, href: '/tools#live-demos' }
  ]);

  const next = $derived(nextFirstMonthStep(progress.done));
  const fraction = $derived(firstMonthFraction(progress.done));

  onMount(() => {
    progress = parseFirstMonth(localStorage.getItem(FIRST_MONTH_KEY));
    progress = {
      ...progress,
      hidden: progress.hidden || localStorage.getItem(FIRST_MONTH_HIDE_KEY) === '1'
    };
  });

  function persist() {
    try {
      localStorage.setItem(FIRST_MONTH_KEY, serializeFirstMonth(progress));
      localStorage.setItem(FIRST_MONTH_HIDE_KEY, progress.hidden ? '1' : '0');
    } catch {
      /* storage unavailable — the walkthrough still works, just stateless */
    }
  }

  function toggle(step: FirstMonthStepId) {
    progress = { ...progress, done: toggleFirstMonthStep(progress.done, step) };
    persist();
  }

  function reset() {
    progress = { done: [], hidden: false };
    persist();
  }

  function hide() {
    progress = { ...progress, hidden: true };
    persist();
  }

  function show() {
    progress = { ...progress, hidden: false };
    persist();
  }
</script>

{#if progress.hidden}
  <button class="fm-restore" type="button" onclick={show}>
    <Icon name="spark" class="h-3.5 w-3.5" />
    {$copy.fmShow}
  </button>
{:else}
  <section class="glass-card rounded-2xl p-6 fm-card" aria-label={$copy.fmTitle}>
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div class="min-w-0">
        <h3 class="flex items-center gap-2 font-bold text-slate-800">
          <Icon name="spark" class="h-4 w-4 text-brand-600" /> {$copy.fmTitle}
        </h3>
        <p class="mt-1 text-sm text-slate-500">{$copy.fmSubtitle}</p>
      </div>
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="rounded-lg px-2 py-1 text-xs font-bold text-slate-500 hover:text-slate-700"
          onclick={reset}
        >{$copy.fmReset}</button>
        <button
          type="button"
          class="rounded-lg px-2 py-1 text-xs font-bold text-slate-500 hover:text-slate-700"
          aria-label={$copy.fmHide}
          title={$copy.fmHide}
          onclick={hide}
        >
          <Icon name="close" class="h-3.5 w-3.5" />
        </button>
      </div>
    </div>

    <div class="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-3">
      <div
        class="h-full rounded-full bg-brand-600 transition-all duration-300"
        style="width: {Math.round(fraction * 100)}%"
      ></div>
    </div>
    <p class="mt-1 text-right text-[10px] font-bold text-slate-400">
      {progress.done.length}/{steps.length}
    </p>

    <ol class="mt-2 space-y-2">
      {#each steps as step, i (step.id)}
        <li
          class="fm-row flex items-center gap-3 rounded-xl border p-3
            {progress.done.includes(step.id) ? 'border-border bg-surface-2 fm-done' : next === step.id ? 'border-brand-300 bg-brand-50/40' : 'border-border bg-surface-2'}"
        >
          <button
            type="button"
            role="checkbox"
            aria-checked={progress.done.includes(step.id)}
            aria-label={step.title}
            class="fm-tick"
            class:fm-tick-on={progress.done.includes(step.id)}
            onclick={() => toggle(step.id)}
          >
            <Icon name="check" class="h-3.5 w-3.5" />
          </button>
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-semibold text-slate-800">
              <span class="fm-num">{i + 1}</span> {step.title}
            </p>
            <p class="truncate text-xs text-slate-400">{step.hint}</p>
          </div>
          {#if next === step.id}
            <span class="fm-next">{$copy.fmNext}</span>
          {/if}
          <a class="fm-open shrink-0 text-xs font-bold text-brand-700 no-underline hover:underline" href={step.href}>
            {$copy.setupOpen} <span aria-hidden="true">→</span>
          </a>
        </li>
      {/each}
    </ol>

    {#if progress.done.length === steps.length}
      <p class="mt-3 flex items-center gap-2 rounded-xl border border-border bg-surface-2 p-3 text-sm font-semibold text-slate-600">
        <Icon name="check" class="h-4 w-4 text-success" /> {$copy.fmComplete}
      </p>
    {/if}
  </section>
{/if}

<style>
  .fm-restore {
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
  .fm-restore:hover { color: var(--ink); border-color: var(--orange-solid); }

  .fm-row { transition: border-color 0.2s ease; }
  .fm-row:hover { border-color: color-mix(in srgb, var(--color-brand-500) 35%, var(--line)); }
  .fm-done { opacity: 0.75; }

  .fm-tick {
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
  .fm-tick:hover { border-color: var(--orange-solid); color: var(--orange-solid); }
  .fm-tick-on { background: var(--color-success); border-color: var(--color-success); color: white; }

  .fm-num {
    display: inline-grid;
    place-items: center;
    width: 16px;
    height: 16px;
    margin-right: 2px;
    border-radius: 5px;
    background: color-mix(in srgb, var(--ink) 8%, transparent);
    color: var(--muted);
    font-size: 9px;
    font-weight: 800;
  }

  .fm-next {
    flex-shrink: 0;
    padding: 2px 8px;
    border-radius: 999px;
    background: var(--color-brand-500);
    color: white;
    font-size: 9px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .fm-open { font-size: 11px; }
  @media (max-width: 640px) {
    /* The arrow is decoration; on a phone the whole row is the target. */
    .fm-open { display: none; }
  }
</style>
