<script lang="ts">
  /**
   * The next 30 days, in three buckets.
   *
   * One component on `/calendar` (every category) and on `/tax` (filings,
   * remittances and compliance dates), so the two pages cannot disagree about
   * what is coming. The window itself is `src/lib/next30.ts`; this file only
   * lays it out.
   *
   * The category is shown as a dot from the calendar's own palette and nothing
   * else: the category names are English data in `schedule.ts`, and printing
   * them here would put untranslated words in eight locales — the strip would
   * have been the thing that broke the page's own localization.
   */
  import { copy, fill } from '$lib/i18n';
  import { categoryMeta, type CalCategory } from '$lib/demo/schedule';
  import { next30, next30Buckets, type Next30Bucket, type Next30Item } from '$lib/next30';
  import Icon from './Icon.svelte';

  let { categories, hint }: { categories?: CalCategory[]; hint?: string } = $props();

  const items = $derived(next30({ categories }));
  const buckets = $derived(next30Buckets(items));

  const order: Next30Bucket[] = ['today', 'week', 'later'];

  const heading = (bucket: Next30Bucket) =>
    bucket === 'today' ? $copy.next30Today : bucket === 'week' ? $copy.next30Week : $copy.next30Later;

  const when = (item: Next30Item) =>
    item.daysLeft === 0
      ? $copy.next30DueToday
      : item.daysLeft === 1
        ? $copy.next30Tomorrow
        : fill($copy.next30DaysLeft, { n: item.daysLeft });
</script>

<section class="mt-6 rounded-2xl border border-border bg-surface-2 p-5" aria-labelledby="next30-title">
  <div class="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
    <div class="min-w-0">
      <h2 id="next30-title" class="flex items-center gap-2 font-bold text-slate-900">
        <Icon name="clock" class="h-4 w-4 text-brand-600" />
        {$copy.next30Title}
      </h2>
      <p class="mt-1 max-w-prose text-sm text-slate-500">{hint ?? $copy.next30Hint}</p>
    </div>
    <a
      href="/calendar"
      class="shrink-0 rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold text-slate-600 no-underline hover:border-brand-300"
      >{$copy.next30SeeCalendar}</a
    >
  </div>

  <div class="mt-4 grid gap-3 sm:grid-cols-3">
    {#each order as bucket (bucket)}
      {@const list = buckets[bucket]}
      <div class="rounded-xl border border-border bg-surface p-3">
        <p class="flex items-baseline justify-between gap-2">
          <span class="text-xs font-bold uppercase tracking-wide text-slate-400">{heading(bucket)}</span>
          <span class="shrink-0 text-xs font-bold tabular-nums text-slate-500">{list.length}</span>
        </p>
        {#if list.length === 0}
          <p class="mt-2 text-xs text-slate-400">{$copy.next30Empty}</p>
        {:else}
          <ul class="mt-2 space-y-2">
            {#each list as item (item.date + item.title)}
              <li class="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span
                  class="mt-1 h-1.5 w-1.5 shrink-0 self-start rounded-full {categoryMeta[item.category].dot}"
                  aria-hidden="true"></span>
                <span class="shrink-0 font-mono text-[11px] tabular-nums text-slate-400">{item.date.slice(5)}</span>
                <span class="min-w-0 flex-1 basis-[9rem] text-xs font-semibold leading-snug text-slate-700"
                  >{item.title}</span
                >
                <span class="shrink-0 text-[11px] font-medium {item.daysLeft === 0 ? 'text-danger' : 'text-slate-500'}"
                  >{when(item)}</span
                >
              </li>
            {/each}
          </ul>
        {/if}
      </div>
    {/each}
  </div>
</section>
