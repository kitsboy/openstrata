<script lang="ts">
  /**
   * One day's deadlines, in place.
   *
   * The grid answers "when"; this answers "what exactly". The calendar computes
   * the pin position (under the clicked cell, clamped inside the grid) and
   * passes it as a style string; this component renders the day's items and
   * asks to close. Escape and outside clicks are the calendar's job — the
   * popover only offers the ✕.
   */
  import { copy } from '$lib/i18n';
  import type { TaskDeadline } from '$lib/tasks';
  import Icon from '$lib/components/Icon.svelte';

  interface DayLike {
    iso: string;
    dayOfMonth: number;
    items: TaskDeadline[];
  }

  let { day, style = '', onclose }: { day: DayLike; style?: string; onclose: () => void } =
    $props();

  const dueIn = $derived.by(() => {
    const n = Math.ceil(
      (new Date(`${day.iso}T00:00:00`).getTime() - new Date().setHours(0, 0, 0, 0)) / 86_400_000
    );
    return $copy.calPopDueIn.replace('{n}', String(Math.abs(n)));
  });
</script>

<div class="cal-pop" role="dialog" aria-label={day.iso} {style}>
  <div class="cal-pop-head">
    <strong>{day.dayOfMonth}</strong>
    <span class="cal-pop-when">{dueIn}</span>
    <button type="button" class="cal-pop-close" aria-label={$copy.close} onclick={onclose}>
      <Icon name="close" class="h-3 w-3" />
    </button>
  </div>
  <ul class="cal-pop-list">
    {#each day.items as item (item.id)}
      <li class="cal-pop-item">
        <span class="cal-pop-title">{item.title}</span>
        <a class="cal-pop-link" href="/tools">{$copy.calPopOpenTools}<span aria-hidden="true">→</span></a>
      </li>
    {/each}
  </ul>
</div>

<style>
  .cal-pop {
    position: absolute;
    z-index: 30;
    width: 170px;
    padding: 8px 10px;
    background: var(--paper);
    border: 1px solid var(--line);
    border-radius: 10px;
    box-shadow: 0 10px 30px rgb(0 0 0 / 0.14);
  }
  .cal-pop-head {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 4px;
    color: var(--ink);
  }
  .cal-pop-head strong { font-size: 12px; }
  .cal-pop-when {
    flex: 1;
    color: var(--muted);
    font-size: 10px;
    font-weight: 600;
    white-space: nowrap;
  }
  .cal-pop-close {
    flex: none;
    color: var(--muted);
    line-height: 0;
    padding: 2px;
  }
  .cal-pop-close:hover { color: var(--ink); }
  .cal-pop-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .cal-pop-title {
    display: block;
    color: var(--ink);
    font-size: 10.5px;
    font-weight: 700;
    line-height: 1.35;
  }
  .cal-pop-link {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    margin-top: 1px;
    color: var(--color-brand-700);
    font-size: 9.5px;
    font-weight: 700;
  }
  .cal-pop-link:hover { text-decoration: underline; }
</style>
