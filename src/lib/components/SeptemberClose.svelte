<script lang="ts">
  /**
   * September close — the five checks between the September books and a signed
   * month, and the one button that ends up blocked.
   *
   * Every check reads the ledger rather than a stored status, so the panel cannot
   * drift from the numbers above it: the tie check is `books.tie.ok`, the payroll
   * and reserve checks name the entries that actually exist, and the two that are
   * not done say why instead of showing a fake progress bar. The close is
   * disabled while anything is open, with the blocking check named in the aria
   * description as well as on screen — a disabled button that does not say what
   * it is waiting for is a dead end.
   */
  import { copy, fill } from '$lib/i18n';
  import { books, payroll } from '$lib/demo/books';
  import { money } from '$lib/demo/format';
  import Icon from './Icon.svelte';

  type CheckState = 'done' | 'open' | 'blocked';

  interface CloseCheck {
    id: string;
    title: string;
    body: string;
    state: CheckState;
  }

  const checks = $derived.by<CloseCheck[]>(() => [
    {
      id: 'tie',
      state: books.tie.ok ? 'done' : 'open',
      title: $copy.accCloseTieTitle,
      body: fill($copy.accCloseTieBody, { delta: Math.abs(books.tie.equityDelta) })
    },
    {
      id: 'payroll',
      state: 'done',
      title: $copy.accClosePayrollTitle,
      body: fill($copy.accClosePayrollBody, {
        net: money(payroll.net),
        remittance: money(payroll.remittance),
        due: payroll.due
      })
    },
    {
      id: 'reserve',
      state: 'done',
      title: $copy.accCloseReserveTitle,
      body: fill($copy.accCloseReserveBody, {
        contributions: money(books.crf.contributions),
        interest: money(books.crf.interest)
      })
    },
    {
      id: 'board',
      state: 'open',
      title: $copy.accCloseBoardTitle,
      body: $copy.accCloseBoardBody
    },
    {
      id: 'lock',
      state: 'blocked',
      title: $copy.accCloseLockTitle,
      body: $copy.accCloseLockBody
    }
  ]);

  const doneCount = $derived(checks.filter((check) => check.state === 'done').length);
  const blocking = $derived(checks.find((check) => check.state === 'open') ?? checks[0]);
  const canClose = $derived(checks.every((check) => check.state === 'done'));

  const label = (state: CheckState) =>
    state === 'done' ? $copy.accStateDone : state === 'open' ? $copy.accStateOpen : $copy.accStateBlocked;

  // Chip tones reuse the token pairs the dashboard's own chips use. The open
  // chip started as `bg-amber-400/15 text-amber-700` and measured 4.37:1 in
  // light and 2.32:1 in dark — amber-700 is a fixed colour, so it stays dark on
  // the dark theme's olive tint. The token pair flips with the theme.
  const tone = (state: CheckState) =>
    state === 'done'
      ? 'bg-success/10 text-success'
      : state === 'open'
        ? 'bg-[var(--color-amber-50)] text-warning'
        : 'bg-slate-400/15 text-slate-600';
</script>

<section class="mt-4 rounded-2xl border border-border bg-surface-2 p-5" aria-labelledby="september-close-title">
  <div class="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
    <div class="min-w-0">
      <h2 id="september-close-title" class="flex items-center gap-2 font-bold text-slate-900">
        <Icon name="lock" class="h-4 w-4 text-brand-600" />
        {$copy.accCloseTitle}
      </h2>
      <p class="mt-1 max-w-prose text-sm text-slate-500">{$copy.accCloseHint}</p>
    </div>
    <p class="shrink-0 rounded-full bg-surface px-3 py-1 text-xs font-bold text-slate-600">
      {fill($copy.accCloseCount, { done: doneCount, total: checks.length })}
    </p>
  </div>

  <ol class="mt-4 space-y-2">
    {#each checks as check (check.id)}
      <li class="flex flex-wrap items-start gap-x-3 gap-y-1 rounded-xl border border-border bg-surface px-3 py-2.5">
        <span class="mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide {tone(check.state)}">
          {label(check.state)}
        </span>
        <div class="min-w-0 flex-1 basis-[16rem]">
          <p class="text-sm font-semibold text-slate-800">{check.title}</p>
          <p class="mt-0.5 text-xs leading-relaxed text-slate-500">{check.body}</p>
        </div>
      </li>
    {/each}
  </ol>

  <div class="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
    <button
      type="button"
      disabled={!canClose}
      aria-describedby={canClose ? undefined : 'september-close-blocked'}
      class="shrink-0 rounded-xl px-4 py-2 text-sm font-bold {canClose
        ? 'bg-slab text-slab-ink transition-colors hover:bg-slab-raised'
        : 'cursor-not-allowed border border-border bg-surface-2 text-slate-400'}"
    >
      {$copy.accCloseAction}
    </button>
    {#if !canClose}
      <p id="september-close-blocked" class="min-w-0 flex-1 basis-[16rem] text-xs leading-relaxed text-slate-500">
        {fill($copy.accCloseBlocked, { item: blocking.title })}
      </p>
    {/if}
  </div>
  <p class="mt-2 text-xs leading-relaxed text-slate-400">{$copy.accCloseLocked}</p>
</section>
