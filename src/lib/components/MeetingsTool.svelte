<script lang="ts">
  /**
   * Meetings tool — quorum calculator + voting engine (item #8).
   *
   * Mirrors the backend rules exactly (SPA s.48): AGM/SGM quorum is 1/3 of
   * eligible voters, council quorum is a majority of council size, a rescheduled
   * meeting counts whoever shows; vote thresholds are majority / 3-4 / 80% (of
   * all eligible) / unanimous, with abstentions always excluded.
   *
   * When a live signed-in session exists the verdicts come from
   * `/api/v1/meetings/*`; otherwise the same rules run locally so the tool works
   * as a demo without a backend.
   */
  import { copy } from '$lib/i18n';
  import { auth } from '$lib/api/auth';
  import { apiFetch, ApiUnavailableError } from '$lib/api/client';
  import { getToken } from '$lib/api/token';
  import { onMount } from 'svelte';

  type MeetingType = 'AGM' | 'SGM' | 'council' | 'rescheduled';
  type Threshold = 'majority' | 'three_quarter' | 'eighty' | 'unanimous';

  let tab = $state<'quorum' | 'vote'>('quorum');

  // ---- Quorum inputs ----
  let qType = $state<MeetingType>('AGM');
  let qEligible = $state(72);
  let qPresent = $state(30);
  let qCouncilSize = $state(5);
  let qResult = $state<{ quorumMet: boolean; required: number; present: number; shortfall: number } | null>(null);
  let qLive = $state(false);

  // ---- Voting inputs ----
  let vThreshold = $state<Threshold>('majority');
  let vEligible = $state(72);
  let vPresent = $state(40);
  let vYes = $state(28);
  let vNo = $state(9);
  let vAbstain = $state(3);
  let vResult = $state<{ passed: boolean; threshold: Threshold; yes: number; denominator: number; reason?: string } | null>(null);
  let vLive = $state(false);

  let error = $state('');
  let live = $state(false);

  onMount(() => {
    const unsubscribe = auth.subscribe((session) => {
      live = session.status === 'signed-in';
      if (!live) {
        // Demo fallback: local pure mirror of the backend rules.
        qResult = null;
        vResult = null;
      }
    });
    return unsubscribe;
  });

  // Mirror of backend/src/meetings/meetings.ts for offline/demo mode.
  function quorumRequired(type: MeetingType, eligible: number, councilSize = 0): number {
    if (type === 'council') return Math.floor(councilSize / 2) + 1;
    return Math.ceil(eligible / 3);
  }

  function checkQuorumLocal(type: MeetingType, eligible: number, present: number, councilSize = 0) {
    if (type === 'rescheduled') {
      return { quorumMet: present > 0, required: 1, present, shortfall: present > 0 ? 0 : 1 };
    }
    const required = quorumRequired(type, eligible, councilSize);
    return { quorumMet: present >= required, required, present, shortfall: Math.max(required - present, 0) };
  }

  function countVoteLocal(threshold: Threshold, b: { eligible: number; present: number; yes: number; no: number; abstain: number }) {
    if (b.yes + b.no > b.present) return { passed: false, threshold, yes: b.yes, denominator: 0, reason: 'yes+no cannot exceed present' };
    if (b.abstain > b.present) return { passed: false, threshold, yes: b.yes, denominator: 0, reason: 'abstain cannot exceed present' };
    if (b.present > b.eligible) return { passed: false, threshold, yes: b.yes, denominator: 0, reason: 'present cannot exceed eligible' };

    const effective = b.present - b.abstain;
    if (effective <= 0) return { passed: false, threshold, yes: b.yes, denominator: 0, reason: 'no effective voters' };

    if (threshold === 'majority') return { passed: b.yes > effective / 2, threshold, yes: b.yes, denominator: effective };
    if (threshold === 'three_quarter') return { passed: b.yes >= (effective * 3) / 4, threshold, yes: b.yes, denominator: effective };
    if (threshold === 'eighty') return { passed: b.yes >= (b.eligible * 80) / 100, threshold, yes: b.yes, denominator: b.eligible };
    // unanimous
    return { passed: b.yes > 0 && b.no === 0, threshold, yes: b.yes, denominator: effective };
  }

  async function runQuorum() {
    error = '';
    if (live) {
      try {
        const res = await apiFetch<ReturnType<typeof checkQuorumLocal>>('/api/v1/meetings/quorum', {
          method: 'POST',
          token: getToken(),
          body: { type: qType, eligible: qEligible, present: qPresent, councilSize: qCouncilSize }
        });
        qResult = res;
        qLive = true;
        return;
      } catch (err) {
        if (err instanceof ApiUnavailableError) {
          qResult = checkQuorumLocal(qType, qEligible, qPresent, qCouncilSize);
          qLive = false;
          return;
        }
        error = err instanceof Error ? err.message : $copy.authError;
      }
    }
    qResult = checkQuorumLocal(qType, qEligible, qPresent, qCouncilSize);
    qLive = false;
  }

  async function runVote() {
    error = '';
    if (live) {
      try {
        const res = await apiFetch<ReturnType<typeof countVoteLocal>>('/api/v1/meetings/vote', {
          method: 'POST',
          token: getToken(),
          body: { threshold: vThreshold, eligible: vEligible, present: vPresent, yes: vYes, no: vNo, abstain: vAbstain }
        });
        vResult = res;
        vLive = true;
        return;
      } catch (err) {
        if (err instanceof ApiUnavailableError) {
          vResult = countVoteLocal(vThreshold, { eligible: vEligible, present: vPresent, yes: vYes, no: vNo, abstain: vAbstain });
          vLive = false;
          return;
        }
        error = err instanceof Error ? err.message : $copy.authError;
      }
    }
    vResult = countVoteLocal(vThreshold, { eligible: vEligible, present: vPresent, yes: vYes, no: vNo, abstain: vAbstain });
    vLive = false;
  }

  const thresholdLabel: Record<Threshold, string> = {
    majority: 'Majority (>50%)',
    three_quarter: '3/4 (≥75%)',
    eighty: '80% (of all eligible)',
    unanimous: 'Unanimous'
  };
</script>

<section class="glass-card rounded-2xl p-8">
  <div class="flex flex-wrap items-start justify-between gap-4">
    <div>
      <h3 class="text-lg font-bold text-slate-800">🗳️ {$copy.meetingsIntro}</h3>
      <p class="mt-1 text-sm text-slate-500">{($copy.meetingsQuorumTool)}</p>
    </div>
    {#if live}
      <span class="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold text-success uppercase">{$copy.liveLabel}</span>
    {/if}
  </div>

  <div class="mt-4 flex gap-2">
    <button class="rounded-lg px-3 py-1.5 text-xs font-semibold {tab === 'quorum' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'}" onclick={() => (tab = 'quorum')}>{$copy.quorumRulesTitle}</button>
    <button class="rounded-lg px-3 py-1.5 text-xs font-semibold {tab === 'vote' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'}" onclick={() => (tab = 'vote')}>{$copy.votingThresholdMatrix}</button>
  </div>

  {#if tab === 'quorum'}
    <div class="mt-5 grid sm:grid-cols-2 gap-4">
      <label class="block text-xs font-bold text-slate-500">{$copy.typeHeader}
        <select bind:value={qType} class="mt-1 w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm">
          <option value="AGM">AGM</option>
          <option value="SGM">SGM</option>
          <option value="council">{$copy.quorumCouncil}</option>
          <option value="rescheduled">{$copy.minuteRuleLabel}</option>
        </select>
      </label>
      {#if qType === 'council'}
        <label class="block text-xs font-bold text-slate-500">{$copy.councilSize}
          <input type="number" min="1" bind:value={qCouncilSize} class="mt-1 w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm" />
        </label>
      {/if}
      <label class="block text-xs font-bold text-slate-500">{$copy.eligibleVoters}
        <input type="number" min="1" bind:value={qEligible} class="mt-1 w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm" />
      </label>
      <label class="block text-xs font-bold text-slate-500">{$copy.presentVoters}
        <input type="number" min="0" bind:value={qPresent} class="mt-1 w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm" />
      </label>
    </div>
    <div class="mt-5 flex items-center gap-3">
      <button class="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white" onclick={runQuorum}>{$copy.requirementLabel}</button>
      {#if qLive}<span class="text-[10px] font-bold text-success uppercase">{$copy.liveLabel}</span>{/if}
    </div>
    {#if qResult}
      <div class="mt-4 rounded-xl border border-border bg-surface-2 p-4 text-sm">
        <p class="font-bold {qResult.quorumMet ? 'text-success' : 'text-danger'}">
          {qResult.quorumMet ? $copy.quorumMet : $copy.quorumNotMet}
        </p>
        <p class="mt-1 text-slate-500">{$copy.requiredLabel}: {qResult.required} · {$copy.presentLabel}: {qResult.present} · {$copy.shortfallLabel}: {qResult.shortfall}</p>
      </div>
    {/if}
  {:else}
    <div class="mt-5 grid sm:grid-cols-2 gap-4">
      <label class="block text-xs font-bold text-slate-500">{$copy.thresholdHeader}
        <select bind:value={vThreshold} class="mt-1 w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm">
          {#each Object.entries(thresholdLabel) as [value, label]}
            <option value={value}>{label}</option>
          {/each}
        </select>
      </label>
      <label class="block text-xs font-bold text-slate-500">{$copy.eligibleVoters}
        <input type="number" min="1" bind:value={vEligible} class="mt-1 w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm" />
      </label>
      <label class="block text-xs font-bold text-slate-500">{$copy.presentVoters}
        <input type="number" min="0" bind:value={vPresent} class="mt-1 w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm" />
      </label>
      <div class="grid grid-cols-3 gap-2">
        <label class="block text-xs font-bold text-slate-500">{$copy.yesLabel}
          <input type="number" min="0" bind:value={vYes} class="mt-1 w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm" />
        </label>
        <label class="block text-xs font-bold text-slate-500">{$copy.noLabel}
          <input type="number" min="0" bind:value={vNo} class="mt-1 w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm" />
        </label>
        <label class="block text-xs font-bold text-slate-500">{$copy.abstainLabel}
          <input type="number" min="0" bind:value={vAbstain} class="mt-1 w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm" />
        </label>
      </div>
    </div>
    <div class="mt-5 flex items-center gap-3">
      <button class="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white" onclick={runVote}>{$copy.countVote}</button>
      {#if vLive}<span class="text-[10px] font-bold text-success uppercase">{$copy.liveLabel}</span>{/if}
    </div>
    {#if vResult}
      <div class="mt-4 rounded-xl border border-border bg-surface-2 p-4 text-sm">
        <p class="font-bold {vResult.passed ? 'text-success' : 'text-danger'}">
          {vResult.passed ? $copy.resolutionPassed : $copy.resolutionFailed}{vResult.reason ? ` — ${vResult.reason}` : ''}
        </p>
        <p class="mt-1 text-slate-500">{$copy.yesLabel}: {vResult.yes} · {$copy.denominatorLabel}: {vResult.denominator}</p>
      </div>
    {/if}
  {/if}

  {#if error}<p class="mt-3 text-sm text-danger" role="alert">{error}</p>{/if}
</section>
