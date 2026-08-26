<script lang="ts">
  /** Ballot engine (#6) — draft a resolution, tally a roll-call vote with
   *  per-unit entitlements, and export the minutes entry. Live: POST
   *  /meetings/vote when signed in; demo mirrors the same thresholds locally
   *  (majority > 50%, 3/4 >= 75%, 80% of all eligible, unanimous). */
  import { onMount } from 'svelte';
  import { copy } from '$lib/i18n';
  import { auth } from '$lib/api/auth';
  import { apiFetch } from '$lib/api/client';
  import { getToken } from '$lib/api/token';
  import Icon from './Icon.svelte';

  type Threshold = 'majority' | 'three_quarter' | 'eighty' | 'unanimous';

  const THRESHOLDS: Array<{ id: Threshold; label: string }> = [
    { id: 'majority', label: 'Majority (>50%)' },
    { id: 'three_quarter', label: '3/4 (≥75%)' },
    { id: 'eighty', label: '80% of eligible' },
    { id: 'unanimous', label: 'Unanimous' }
  ];

  let resolution = $state('Approve the 2026 operating budget as presented.');
  let threshold = $state<Threshold>('majority');
  let eligible = $state(12);
  let present = $state(12);
  let yes = $state(9);
  let no = $state(2);
  let abstain = $state(1);
  let verdict = $state<{ passed: boolean; yes: number; denominator: number; reason?: string } | null>(null);
  let live = $state(false);
  let busy = $state(false);

  onMount(() => {
    const unsubscribe = auth.subscribe((s) => (live = s.status === 'signed-in'));
    return unsubscribe;
  });

  /** Mirror of backend/src/meetings/meetings.ts countVote for demo mode. */
  function countLocal(t: Threshold, b: { eligible: number; present: number; yes: number; no: number; abstain: number }) {
    if (b.yes + b.no > b.present) return { passed: false, yes: b.yes, denominator: 0, reason: 'yes+no exceeds present' };
    if (b.present > b.eligible) return { passed: false, yes: b.yes, denominator: 0, reason: 'present exceeds eligible' };
    const effective = b.present - b.abstain;
    if (effective <= 0) return { passed: false, yes: b.yes, denominator: 0, reason: 'no effective voters' };
    let denominator = effective;
    let requiredYes: number;
    switch (t) {
      case 'majority': denominator = effective; requiredYes = Math.floor(effective / 2) + 1; break;
      case 'three_quarter': denominator = effective; requiredYes = Math.ceil((effective * 3) / 4); break;
      case 'eighty': denominator = b.eligible; requiredYes = Math.ceil((b.eligible * 80) / 100); break;
      case 'unanimous': denominator = effective; requiredYes = effective; break;
    }
    const passed = t === 'unanimous' ? b.yes === denominator : b.yes >= requiredYes;
    return passed
      ? { passed: true, yes: b.yes, denominator }
      : { passed: false, yes: b.yes, denominator, reason: `needed ${requiredYes} yes (had ${b.yes} of ${denominator})` };
  }

  async function tally() {
    busy = true;
    if (live) {
      try {
        const res = await apiFetch<{ ok: boolean; passed: boolean; yes: number; denominator: number; reason?: string }>(
          '/api/v1/meetings/vote',
          { method: 'POST', body: { threshold, eligible, present, yes, no, abstain }, token: getToken() }
        );
        verdict = { passed: res.passed, yes: res.yes, denominator: res.denominator, reason: res.reason };
      } catch {
        verdict = countLocal(threshold, { eligible, present, yes, no, abstain });
      }
    } else {
      verdict = countLocal(threshold, { eligible, present, yes, no, abstain });
    }
    busy = false;
  }

  function exportMinutes() {
    const lines = [
      'MEETING MINUTES — RESOLUTION RECORD',
      '===============================',
      `Resolution: ${resolution}`,
      `Threshold: ${THRESHOLDS.find((t) => t.id === threshold)!.label}`,
      `Eligible: ${eligible} · Present: ${present} · Yes: ${yes} · No: ${no} · Abstain: ${abstain}`,
      verdict
        ? verdict.passed
          ? `Verdict: PASSED (${verdict.yes}/${verdict.denominator})`
          : `Verdict: FAILED (${verdict.yes}/${verdict.denominator}${verdict.reason ? ` — ${verdict.reason}` : ''})`
        : 'Verdict: not yet tallied',
      `Generated: ${new Date().toISOString().slice(0, 10)}`,
      'OpenStrata — draft record; review before filing.'
    ].join('\n');
    const url = URL.createObjectURL(new Blob([lines], { type: 'text/plain;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `minutes-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }
</script>

<section class="glass-card rounded-2xl p-6">
  <div class="flex items-start justify-between gap-3">
    <div>
      <h3 class="font-bold text-slate-800 flex items-center gap-2">
        <Icon name="chart" class="h-4 w-4 text-brand-600" /> {$copy.ballotTitle}
        {#if live}<span class="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold text-success uppercase">{$copy.liveLabel}</span>{/if}
      </h3>
      <p class="mt-1 text-sm text-slate-500">{$copy.ballotHint}</p>
    </div>
  </div>

  <label class="mt-4 block">
    <span class="text-[10px] font-bold text-slate-400 uppercase">{$copy.ballotResolution}</span>
    <textarea bind:value={resolution} rows="2" class="mt-1 w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm text-slate-800 focus:border-brand-300 focus:outline-none"></textarea>
  </label>

  <div class="mt-3 flex flex-wrap gap-2">
    {#each THRESHOLDS as t}
      <button class="rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all {threshold === t.id ? 'border-brand-300 bg-brand-50 text-brand-700' : 'border-border bg-surface-2 text-slate-500'}" onclick={() => (threshold = t.id)}>{t.label}</button>
    {/each}
  </div>

  <div class="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
    <label class="block">
      <span class="text-[10px] font-bold text-slate-400 uppercase">{$copy.eligibleVoters}</span>
      <input type="number" min="0" bind:value={eligible} class="mt-1 w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm font-semibold text-slate-800" />
    </label>
    <label class="block">
      <span class="text-[10px] font-bold text-slate-400 uppercase">{$copy.presentVoters}</span>
      <input type="number" min="0" bind:value={present} class="mt-1 w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm font-semibold text-slate-800" />
    </label>
    <label class="block">
      <span class="text-[10px] font-bold text-slate-400 uppercase">{$copy.yesLabel}</span>
      <input type="number" min="0" bind:value={yes} class="mt-1 w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm font-semibold text-slate-800" />
    </label>
    <label class="block">
      <span class="text-[10px] font-bold text-slate-400 uppercase">{$copy.noLabel}</span>
      <input type="number" min="0" bind:value={no} class="mt-1 w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm font-semibold text-slate-800" />
    </label>
    <label class="block">
      <span class="text-[10px] font-bold text-slate-400 uppercase">{$copy.abstainLabel}</span>
      <input type="number" min="0" bind:value={abstain} class="mt-1 w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm font-semibold text-slate-800" />
    </label>
  </div>

  {#if verdict}
    <div class="mt-4 rounded-xl border p-4 {verdict.passed ? 'border-success/30 bg-success/5' : 'border-danger/30 bg-danger/5'}">
      <p class="flex items-center gap-2 text-sm font-bold {verdict.passed ? 'text-success' : 'text-danger'}">
        <Icon name={verdict.passed ? 'check' : 'close'} class="h-4 w-4" />
        {verdict.passed ? $copy.resolutionPassed : $copy.resolutionFailed}
        <span class="font-normal text-slate-500">— {verdict.yes}/{verdict.denominator}</span>
      </p>
      {#if verdict.reason}<p class="mt-1 text-xs text-slate-500">{verdict.reason}</p>{/if}
    </div>
  {/if}

  <div class="mt-4 flex flex-wrap gap-2">
    <button class="rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white hover:bg-brand-700 disabled:opacity-50" onclick={tally} disabled={busy}>{busy ? '…' : $copy.ballotCast}</button>
    <button class="flex items-center gap-1.5 rounded-xl border border-border bg-surface-2 px-4 py-2 text-xs font-bold text-slate-700" onclick={exportMinutes}><Icon name="download" class="h-3 w-3" /> {$copy.ballotExport}</button>
  </div>
</section>
