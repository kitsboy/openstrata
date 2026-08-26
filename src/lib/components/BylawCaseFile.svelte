<script lang="ts">
  /** Bylaw case file (#7) — assemble a CRT-ready evidence bundle from a
   *  complaint: the notice, the 14-day review lock, the fine decision, and
   *  ledger references, exported as a single print/PDF-ready document. */
  import { copy, formatDate, locale } from '$lib/i18n';
  import Icon from './Icon.svelte';

  let caseRef = $state('BL-2026-014');
  let unitId = $state('302');
  let bylawRef = $state('Standard Bylaw 5.2 (short-term rental)');
  let complaintDate = $state(new Date().toISOString().slice(0, 10));
  let receivedEvidence = $state(true);
  let noticeIssued = $state(true);
  let decision = $state<'fine' | 'nofine' | 'pending'>('fine');
  let fineAmount = $state(200);
  let minutesRef = $state('CM-2026-06-03');

  function exportBundle() {
    const lines = [
      `BYLAW ENFORCEMENT CASE FILE — CRT EVIDENCE BUNDLE`,
      '==================================================',
      `Case: ${caseRef} · Unit ${unitId}`,
      `Bylaw: ${bylawRef}`,
      `Complaint received: ${formatDate(complaintDate, 'en')}`,
      `Evidence attached: ${receivedEvidence ? 'yes' : 'no'}`,
      `14-day notice issued: ${noticeIssued ? 'yes' : 'no'}`,
      `Decision: ${decision === 'fine' ? `FINE $${fineAmount}.00` : decision === 'nofine' ? 'NO FINE' : 'PENDING'}`,
      `Council minutes ref: ${minutesRef}`,
      '',
      'TIMELINE',
      '--------',
      `${formatDate(complaintDate, 'en')} — complaint received`,
      noticeIssued ? `${formatDate(complaintDate, 'en')} — notice issued (14-day review window opened)` : '',
      decision !== 'pending' ? `${formatDate(new Date(Date.now() + 14 * 86_400_000).toISOString(), 'en')} — decision recorded in ${minutesRef}` : '',
      '',
      'OpenStrata — draft bundle. Verify all records against the council minute book before filing with the CRT.'
    ].filter((l) => l !== '').join('\n');
    const url = URL.createObjectURL(new Blob([lines], { type: 'text/plain;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `${caseRef}-case-file.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }
</script>

<section class="glass-card rounded-2xl p-6">
  <div class="flex items-start justify-between gap-3">
    <div>
      <h3 class="font-bold text-slate-800 flex items-center gap-2">
        <Icon name="scale" class="h-4 w-4 text-brand-600" /> {$copy.caseFileTitle}
      </h3>
      <p class="mt-1 text-sm text-slate-500">{$copy.caseFileHint}</p>
    </div>
  </div>

  <div class="mt-4 grid gap-3 sm:grid-cols-2">
    <label class="block">
      <span class="text-[10px] font-bold text-slate-400 uppercase">Case ref</span>
      <input bind:value={caseRef} class="mt-1 w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm font-mono text-slate-800" />
    </label>
    <label class="block">
      <span class="text-[10px] font-bold text-slate-400 uppercase">{$copy.unitLabel}</span>
      <input bind:value={unitId} class="mt-1 w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm font-mono text-slate-800" />
    </label>
    <label class="block sm:col-span-2">
      <span class="text-[10px] font-bold text-slate-400 uppercase">Bylaw</span>
      <input bind:value={bylawRef} class="mt-1 w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm text-slate-800" />
    </label>
  </div>

  <div class="mt-3 flex flex-wrap gap-4 text-sm">
    <label class="flex items-center gap-2"><input type="checkbox" bind:checked={receivedEvidence} class="h-4 w-4 rounded border-border text-brand-600" /> {$copy.bylawCaseEvidence}</label>
    <label class="flex items-center gap-2"><input type="checkbox" bind:checked={noticeIssued} class="h-4 w-4 rounded border-border text-brand-600" /> {$copy.bylawCaseNotice}</label>
  </div>

  <div class="mt-4 rounded-xl border border-border bg-surface-2/60 p-4">
    <p class="text-[10px] font-bold text-slate-400 uppercase">Decision</p>
    <div class="mt-2 flex flex-wrap items-center gap-2">
      {#each [
        { id: 'fine', label: $copy.bylawCaseFine },
        { id: 'nofine', label: $copy.bylawCaseNoFine },
        { id: 'pending', label: $copy.bylawCaseState }
      ] as d}
        <button class="rounded-xl border px-3 py-1.5 text-xs font-semibold {decision === d.id ? 'border-brand-300 bg-brand-50 text-brand-700' : 'border-border bg-surface-2 text-slate-500'}" onclick={() => (decision = d.id as typeof decision)}>{d.label}</button>
      {/each}
      {#if decision === 'fine'}
        <label class="ml-2 flex items-center gap-2 text-xs text-slate-500">$<input type="number" min="0" bind:value={fineAmount} class="w-24 rounded-lg border border-border bg-surface-2 px-2 py-1.5 text-sm font-semibold text-slate-800" /></label>
      {/if}
    </div>
    {#if noticeIssued}
      <p class="mt-3 flex items-center gap-1.5 text-xs font-semibold text-amber-600"><Icon name="lock" class="h-3 w-3" /> {$copy.bylawCaseLock}</p>
    {/if}
    <label class="mt-3 block">
      <span class="text-[10px] font-bold text-slate-400 uppercase">{$copy.bylawCaseMinutes}</span>
      <input bind:value={minutesRef} class="mt-1 w-full max-w-xs rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm font-mono text-slate-800" />
    </label>
  </div>

  <button class="mt-4 flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white hover:bg-brand-700" onclick={exportBundle}><Icon name="download" class="h-3 w-3" /> {$copy.caseFilePrint}</button>
</section>
