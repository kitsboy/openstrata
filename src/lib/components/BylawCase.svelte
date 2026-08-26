<script lang="ts">
  /** Bylaw enforcement case (#3): complaint → notice → 14-day
   *  BLOCK_FINE_ACTIONS review lock → fine / no-fine decision. Uses the
   *  stateless enforcement API when signed in; identical rules locally. */
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { copy, formatCurrency, locale } from '$lib/i18n';
  import { auth } from '$lib/api/auth';
  import { fetchUnits, type ApiUnit } from '$lib/api/units';
  import {
    bylawComplaint, bylawIssueNotice, bylawStatus, bylawImposeFine, bylawNoFine,
    type ComplaintWire, type BreachKind
  } from '$lib/api/bylaw';
  import Icon from './Icon.svelte';

  let liveUnits = $state<ApiUnit[] | null>(null);
  let complaint = $state<ComplaintWire | null>(null);
  let unitRef = $state('101');
  let bylawRef = $state('Standard Bylaw 5(1) — noise');
  let breachKind = $state<BreachKind>('standard');
  let evidence = $state(true);
  let now = $state(new Date().toISOString());
  let gate = $state<{ allowed: boolean; blocked: string | null; inReviewWindow: boolean } | null>(null);
  let fineBasis = $state(20000);
  let minutesRef = $state('');
  let busy = $state(false);
  let error = $state('');
  let demoFilled = $state(false);

  const MIN_REVIEW_DAYS = 14;

  onMount(() => {
    const unsubscribe = auth.subscribe((session) => {
      if (session.status === 'signed-in') {
        fetchUnits().then((u) => { liveUnits = u; if (u.length) unitRef = u[0]!.unitRef; }).catch(() => {});
      } else {
        liveUnits = null;
      }
    });
    return unsubscribe;
  });

  const unitList = $derived(liveUnits ?? [
    { unitRef: '101' }, { unitRef: '102' }, { unitRef: '201' },
    { unitRef: '202' }, { unitRef: '301' }, { unitRef: '302' }
  ] as ApiUnit[]);

  const live = $derived(!!liveUnits);

  function nextDate(days: number): string {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() + days);
    return d.toISOString().slice(0, 10);
  }

  /** Honest demo: run the same state machine locally (mirror of enforcement.ts). */
  function demoStep(next: ComplaintWire) {
    complaint = next;
    const deadline = next.noticeDeadline ?? '';
    const expired = now >= deadline;
    gate = next.state === 'received'
      ? { allowed: false, blocked: 'no-notice', inReviewWindow: false }
      : !deadline
        ? { allowed: false, blocked: 'no-notice', inReviewWindow: false }
        : !expired
          ? { allowed: false, blocked: 'BLOCK_FINE_ACTIONS', inReviewWindow: true }
          : { allowed: true, blocked: null, inReviewWindow: false };
  }

  async function fileComplaint() {
    error = '';
    busy = true;
    now = new Date().toISOString();
    const input = {
      id: `case-${Date.now().toString(36)}`,
      unitId: unitRef,
      bylawRef,
      breachKind,
      receivedAt: now,
      evidence
    };
    try {
      const c = live ? await bylawComplaint(input) : (demoFilled = true, {
        ...input,
        state: 'received',
        bylawRef: input.bylawRef
      } as ComplaintWire);
      complaint = c;
      gate = { allowed: false, blocked: 'no-notice', inReviewWindow: false };
    } catch (err) {
      error = err instanceof Error ? err.message : 'Request failed';
    }
    busy = false;
  }

  async function issueNotice() {
    error = '';
    busy = true;
    now = new Date().toISOString();
    if (!complaint) return;
    try {
      const c = live ? await bylawIssueNotice(complaint, now) : {
        ...complaint,
        state: 'notice_issued',
        noticeIssuedAt: now,
        noticeDeadline: nextDate(MIN_REVIEW_DAYS)
      } as ComplaintWire;
      complaint = c;
      const gate0 = await checkGate(c);
      gate = gate0;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Request failed';
    }
    busy = false;
  }

  async function checkGate(c: ComplaintWire) {
    now = new Date().toISOString();
    if (live) return bylawStatus(c, now);
    const deadline = c.noticeDeadline ?? '';
    const expired = now >= deadline;
    if (!c.noticeIssuedAt || !deadline) return { allowed: false, blocked: 'no-notice', inReviewWindow: false };
    return expired
      ? { allowed: true, blocked: null, inReviewWindow: false }
      : { allowed: false, blocked: 'BLOCK_FINE_ACTIONS', inReviewWindow: true };
  }

  async function decide(fine: boolean) {
    if (!complaint) return;
    error = '';
    busy = true;
    now = new Date().toISOString();
    try {
      if (fine) {
        const c = live
          ? await bylawImposeFine(complaint, now, fineBasis, minutesRef || `minutes-${Date.now().toString(36)}`)
          : { ...complaint, state: 'fine_posted', councilMinutesRef: minutesRef, fineAmountBasis: fineBasis } as ComplaintWire;
        complaint = c;
        gate = { allowed: true, blocked: null, inReviewWindow: false };
      } else {
        const c = live
          ? await bylawNoFine(complaint, minutesRef || `minutes-${Date.now().toString(36)}`)
          : { ...complaint, state: 'decided_no_fine', councilMinutesRef: minutesRef } as ComplaintWire;
        complaint = c;
        gate = null;
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'Request failed';
    }
    busy = false;
  }

  function resetCase() {
    complaint = null;
    gate = null;
    error = '';
  }

  const stateLabel = $derived(
    complaint
      ? complaint.state === 'received' ? '1 · ' + $copy.bylawCaseNew :
        complaint.state === 'notice_issued' || complaint.state === 'reviewing' ? '2 · ' + $copy.bylawCaseNotice :
        complaint.state === 'fine_posted' ? '5 · ' + $copy.bylawCaseFine :
        '5 · ' + $copy.bylawCaseNoFine
      : '')
</script>

<section class="glass-card rounded-2xl p-6">
  <div class="flex items-start justify-between gap-3">
    <div>
      <h3 class="font-bold text-slate-800 flex items-center gap-2">
        <Icon name="scale" class="h-4 w-4 text-brand-600" /> {$copy.bylawCaseTitle}
        {#if live}<span class="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold text-success uppercase">{$copy.liveLabel}</span>{/if}
      </h3>
      <p class="mt-1 text-sm text-slate-500">{$copy.bylawCaseHint}</p>
    </div>
  </div>

  {#if complaint}
    <div class="mt-4 space-y-3">
      <div class="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-surface-2 p-3">
        <span class="text-xs font-bold text-slate-600 uppercase">{stateLabel}</span>
        <code class="text-xs text-bc-blue">{complaint.id}</code>
        <span class="text-xs text-slate-400">{$copy.unitLabel} {complaint.unitId} · {complaint.bylawRef}</span>
      </div>

      {#if complaint.state === 'received'}
        <button class="w-full rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50 sm:w-auto" onclick={issueNotice} disabled={busy}>
          {busy ? '…' : $copy.bylawCaseNotice}
        </button>
      {:else if complaint.state === 'notice_issued' || complaint.state === 'reviewing'}
        <div class="rounded-xl border p-4 {gate?.inReviewWindow ? 'border-danger/30 bg-danger/5' : 'border-success/30 bg-success/5'}">
          <p class="flex items-center gap-2 text-sm font-bold {gate?.inReviewWindow ? 'text-danger' : 'text-success'}">
            <Icon name={gate?.inReviewWindow ? 'lock' : 'check'} class="h-4 w-4" />
            {gate?.inReviewWindow ? $copy.bylawCaseLock : $copy.bylawCaseUnlocked}
          </p>
          {#if gate?.inReviewWindow}
            <p class="mt-1 text-xs text-slate-500">{$copy.unitLabel} {complaint.unitId} · notice {complaint.noticeIssuedAt} → {complaint.noticeDeadline}</p>
          {:else}
            <div class="mt-3 grid gap-3 sm:grid-cols-2">
              <label class="block">
                <span class="text-[10px] font-bold text-slate-400 uppercase">{$copy.bylawCaseFine} (CAD)</span>
                <input type="number" min="0" bind:value={fineBasis} class="mt-1 w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm font-semibold text-slate-800" />
              </label>
              <label class="block">
                <span class="text-[10px] font-bold text-slate-400 uppercase">{$copy.bylawCaseMinutes}</span>
                <input bind:value={minutesRef} placeholder="MIN-2026-09-14" class="mt-1 w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm font-semibold text-slate-800" />
              </label>
            </div>
            <div class="mt-3 flex flex-wrap gap-2">
              <button class="rounded-xl bg-danger px-4 py-2 text-sm font-bold text-white disabled:opacity-50" onclick={() => decide(true)} disabled={busy}>{$copy.bylawCaseFine}</button>
              <button class="rounded-xl bg-slate-200 px-4 py-2 text-sm font-bold text-slate-700 disabled:opacity-50" onclick={() => decide(false)} disabled={busy}>{$copy.bylawCaseNoFine}</button>
            </div>
          {/if}
        </div>
      {:else}
        <div class="rounded-xl border border-success/30 bg-success/5 p-4">
          <p class="flex items-center gap-2 text-sm font-bold text-success">
            <Icon name="check" class="h-4 w-4" />
            {complaint.state === 'fine_posted' ? `${$copy.bylawCaseFine} — ${formatCurrency((complaint.fineAmountBasis ?? 0) / 100, $locale)}` : $copy.bylawCaseNoFine}
          </p>
          <p class="mt-1 text-xs text-slate-500">{$copy.bylawCaseMinutes}: <code class="text-bc-blue">{complaint.councilMinutesRef}</code></p>
        </div>
      {/if}

      <button class="text-xs font-bold text-slate-500 hover:text-slate-700" onclick={resetCase}>↺</button>
    </div>
  {:else}
    <div class="mt-4 grid gap-3 sm:grid-cols-2">
      <label class="block">
        <span class="text-[10px] font-bold text-slate-400 uppercase">{$copy.unitLabel}</span>
        <select bind:value={unitRef} class="mt-1 w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm font-semibold text-slate-800">
          {#each unitList as u}<option value={u.unitRef}>{$copy.unitLabel} {u.unitRef}</option>{/each}
        </select>
      </label>
      <label class="block">
        <span class="text-[10px] font-bold text-slate-400 uppercase">{$copy.bylawCaseState} · SPA</span>
        <input bind:value={bylawRef} class="mt-1 w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm font-semibold text-slate-800" />
      </label>
    </div>
    <label class="mt-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
      <input type="checkbox" bind:checked={evidence} class="h-4 w-4 rounded border-border accent-brand-600" />
      {$copy.bylawCaseEvidence}
    </label>
    <button class="mt-3 rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50" onclick={fileComplaint} disabled={busy}>
      {busy ? '…' : $copy.bylawCaseSubmit}
    </button>
  {/if}

  {#if error}<p class="mt-3 text-xs font-semibold text-danger" role="alert"><Icon name="alert" class="h-3 w-3 inline" /> {error}</p>{/if}
</section>
