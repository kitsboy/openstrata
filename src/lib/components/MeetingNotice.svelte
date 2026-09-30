<script lang="ts">
  /** Meeting notice (#8) — build a statutory notice with the correct advance
   *  window (AGM 14 days, council 7 days under BC rules) and print it. */
  import { copy, locale } from '$lib/i18n';
  import Icon from './Icon.svelte';

  type MeetingType = 'AGM' | 'SGM' | 'council';

  let type = $state<MeetingType>('AGM');
  let when = $state(new Date(Date.now() + 21 * 86_400_000).toISOString().slice(0, 10));
  let time = $state('19:00');
  let where = $state('Seaside Gardens Clubhouse, 1234 Maple Street');
  let agenda = $state('1. Call to order\n2. Approval of previous minutes\n3. Treasurer\u2019s report\n4. 2026 operating budget vote\n5. New business');

  const advanceDays = $derived(type === 'council' ? 7 : 14);
  const meetsWindow = $derived(
    (Date.parse(when) - Date.now()) / 86_400_000 >= advanceDays - 1
  );

  /**
   * Hand the council's own details to the ONE printable notice.
   *
   * This used to assemble a second print page as a string in a popup, with its
   * own inline fonts and colours — so the printed notice had no letterhead, no
   * page setup, and drifted from the template the moment either changed. It now
   * hands off through the query string (the same pattern the templates page uses
   * to prefill the wizard) and `/documents` prints a real document.
   */
  function printNotice() {
    const params = new URLSearchParams({
      doc: 'notice',
      print: '1',
      type,
      when,
      time,
      where,
      agenda: agenda.slice(0, 1500)
    });
    window.open(`/documents?${params.toString()}`, '_blank');
  }
</script>

<section class="glass-card rounded-2xl p-6">
  <div class="flex items-start justify-between gap-3">
    <div>
      <h3 class="font-bold text-slate-800 flex items-center gap-2">
        <Icon name="calendar" class="h-4 w-4 text-brand-600" /> {$copy.noticeTitle}
      </h3>
      <p class="mt-1 text-sm text-slate-500">{$copy.noticeHint}</p>
    </div>
  </div>

  <div class="mt-4 grid gap-3 sm:grid-cols-3">
    <label class="block">
      <span class="text-[10px] font-bold text-slate-400 uppercase">{$copy.noticeType}</span>
      <select bind:value={type} class="mt-1 w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm font-semibold text-slate-800">
        <option value="AGM">AGM</option>
        <option value="SGM">SGM</option>
        <option value="council">Council</option>
      </select>
    </label>
    <label class="block">
      <span class="text-[10px] font-bold text-slate-400 uppercase">{$copy.noticeWhen}</span>
      <div class="mt-1 flex gap-2">
        <input type="date" bind:value={when} class="w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm text-slate-800" />
        <input type="time" bind:value={time} class="w-28 rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm text-slate-800" />
      </div>
    </label>
    <label class="block">
      <span class="text-[10px] font-bold text-slate-400 uppercase">{$copy.noticeWhere}</span>
      <input bind:value={where} class="mt-1 w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm text-slate-800" />
    </label>
  </div>

  <label class="mt-3 block">
    <span class="text-[10px] font-bold text-slate-400 uppercase">Agenda</span>
    <textarea bind:value={agenda} rows="4" class="mt-1 w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm text-slate-800 focus:border-brand-300 focus:outline-none"></textarea>
  </label>

  <div class="mt-3 flex flex-wrap items-center gap-3">
    <button class="flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white hover:bg-brand-700" onclick={printNotice}><Icon name="file" class="h-3 w-3" /> {$copy.noticePrint}</button>
    {#if !meetsWindow}
      <p class="flex items-center gap-1 text-xs font-semibold text-amber-600"><Icon name="alert" class="h-3 w-3" /> {advanceDays}-day advance window not met</p>
    {:else}
      <p class="flex items-center gap-1 text-xs font-semibold text-success"><Icon name="check" class="h-3 w-3" /> {advanceDays}-day advance window met</p>
    {/if}
  </div>
</section>
