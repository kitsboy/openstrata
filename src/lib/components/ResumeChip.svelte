<script lang="ts">
  /**
   * "Continue where you left off" — one chip between the greeting and the task
   * list when a wizard draft is waiting.
   *
   * The 8-step wizard keeps everything in component state, so someone who
   * stopped halfway used to come back to a blank form. The wizard now persists
   * a draft (`$lib/resume`), and this chip is how the dashboard says so: which
   * building, which step, one click back. A draft is device-local like the
   * tour and the setup ticks — no account, nothing to opt out of beyond one
   * dismiss button that clears it.
   */
  import { goto } from '$app/navigation';
  import { copy } from '$lib/i18n';
  import { clearWizardDraft, readWizardDraft, shouldResume, WIZARD_TOTAL_STEPS, type WizardDraft } from '$lib/resume';
  import { onMount } from 'svelte';

  let draft = $state<WizardDraft | null>(null);

  onMount(() => {
    draft = readWizardDraft();
  });

  const show = $derived(shouldResume(draft));

  function dismiss() {
    clearWizardDraft();
    draft = null;
  }
</script>

{#if show && draft}
  <div class="resume-chip" role="status">
    <span class="resume-dot" aria-hidden="true"></span>
    <p class="resume-copy">
      <strong>{$copy.resumeTitle}</strong>
      <span>
        {draft.name} — {draft.step + 1} {$copy.resumeOf} {WIZARD_TOTAL_STEPS} · {$copy.resumeProgress}
      </span>
    </p>
    <a class="resume-action" href="/tools/wizard" onclick={(event) => { event.preventDefault(); goto('/tools/wizard'); }}>
      {$copy.resumeAction} <span aria-hidden="true">→</span>
    </a>
    <button class="resume-dismiss" type="button" aria-label={$copy.resumeDismiss} title={$copy.resumeDismiss} onclick={dismiss}>
      ×
    </button>
  </div>
{/if}

<style>
  .resume-chip {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 20px;
    padding: 12px 16px;
    border: 1px solid color-mix(in srgb, var(--color-brand-500) 35%, var(--line));
    border-radius: 14px;
    background: color-mix(in srgb, var(--color-brand-500) 6%, var(--paper));
  }
  .resume-dot {
    flex: 0 0 auto;
    width: 9px;
    height: 9px;
    border-radius: 999px;
    background: var(--color-brand-500);
  }
  .resume-copy { min-width: 0; flex: 1; margin: 0; display: flex; flex-direction: column; gap: 1px; }
  .resume-copy strong { color: var(--ink); font-size: 13px; font-weight: 800; }
  .resume-copy span { overflow: hidden; color: var(--muted); font-size: 12px; text-overflow: ellipsis; white-space: nowrap; }
  .resume-action { flex: 0 0 auto; color: var(--color-brand-600); font-size: 12px; font-weight: 800; text-decoration: none; }
  .resume-action:hover { text-decoration: underline; }
  .resume-dismiss {
    flex: 0 0 auto;
    display: grid;
    place-items: center;
    width: 26px;
    height: 26px;
    border: 0;
    border-radius: 8px;
    color: var(--faint);
    background: transparent;
    font-size: 15px;
    line-height: 1;
  }
  .resume-dismiss:hover { color: var(--ink); background: var(--surface-3); }
  @media (max-width: 640px) {
    .resume-chip { flex-wrap: wrap; gap: 8px 12px; }
    .resume-action { order: 2; }
    .resume-dismiss { order: 3; margin-left: auto; }
  }
</style>
