<script lang="ts">
  // In-app setup checklist.
  //
  // The public journey strip (StartHere) guides someone deciding whether to sign
  // up. This is the in-product half: once a workspace exists, four things stand
  // between "signed up" and "the building actually runs". It renders on the
  // dashboard, ticks off as steps are done, and can be dismissed.
  //
  // Progress is localStorage-only — no account flag, no API call. The workspace
  // is the record of truth; this is only a nudge, and clearing storage costs a
  // few extra clicks, not data.
  import { onMount } from 'svelte';
  import { copy } from '$lib/i18n';
  import Icon from '$lib/components/Icon.svelte';
  import {
    SETUP_HIDE_KEY,
    SETUP_KEY,
    isComplete,
    nextStep,
    parseProgress,
    serializeProgress,
    setupPercent,
    toggleStep,
    type SetupStepId
  } from '$lib/setup';

  const steps = $derived<
    Array<{ id: SetupStepId; n: number; href: string; label: string; hint: string }>
  >([
    { id: 'units', n: 1, href: '/tools', label: $copy.setupStep1, hint: $copy.setupHint1 },
    { id: 'funds', n: 2, href: '/tools/wizard', label: $copy.setupStep2, hint: $copy.setupHint2 },
    { id: 'bylaws', n: 3, href: '/templates', label: $copy.setupStep3, hint: $copy.setupHint3 },
    { id: 'month', n: 4, href: '/tools', label: $copy.setupStep4, hint: $copy.setupHint4 }
  ]);

  let done = $state<SetupStepId[]>([]);
  let hidden = $state(false);

  function persist() {
    try {
      localStorage.setItem(SETUP_KEY, serializeProgress({ done, hidden }));
      localStorage.setItem(SETUP_HIDE_KEY, hidden ? '1' : '0');
    } catch {
      /* storage unavailable — the panel still works, just stateless */
    }
  }

  onMount(() => {
    const parsed = parseProgress(localStorage.getItem(SETUP_KEY));
    done = parsed.done;
    // The separate hide key is the belt-and-braces read: older builds (and a
    // user who hand-edited one key) should not resurrect a dismissed panel.
    hidden = parsed.hidden || localStorage.getItem(SETUP_HIDE_KEY) === '1';
  });

  const percent = $derived(setupPercent(done));
  const complete = $derived(isComplete(done));
  const upcoming = $derived(nextStep(done));
</script>

{#if hidden}
  <button class="setup-restore" type="button" onclick={() => { hidden = false; persist(); }}>
    <Icon name="check" class="h-3.5 w-3.5" />
    {$copy.setupShow}
  </button>
{:else}
  <section class="setup-panel" aria-label={$copy.setupTitle}>
    <div class="setup-head">
      <div class="setup-copy">
        <p class="setup-eyebrow">{$copy.setupTitle}</p>
        <p class="setup-intro">{complete ? $copy.setupDoneHint : $copy.setupIntro}</p>
      </div>
      <div class="setup-meter-wrap">
        <span class="setup-count" class:full={complete}>{percent}%</span>
        <div
          class="setup-meter"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin="0"
          aria-valuemax="100"
          aria-label={$copy.setupTitle}
        >
          <span style="width: {percent}%"></span>
        </div>
      </div>
      <button
        class="setup-close"
        type="button"
        aria-label={$copy.setupHide}
        title={$copy.setupHide}
        onclick={() => { hidden = true; persist(); }}
      >
        <Icon name="close" class="h-3.5 w-3.5" />
      </button>
    </div>

    <ol class="setup-grid">
      {#each steps as step}
        {@const ticked = done.includes(step.id)}
        <li class:ticked class:next={upcoming === step.id}>
          <button
            class="setup-tick"
            type="button"
            role="checkbox"
            aria-checked={ticked}
            aria-label={step.label}
            onclick={() => { done = toggleStep(done, step.id); persist(); }}
          >
            {#if ticked}
              <Icon name="check" class="h-3.5 w-3.5" />
            {:else}
              <span class="setup-n">{step.n}</span>
            {/if}
          </button>
          <div class="setup-body">
            <p class="setup-label">{step.label}</p>
            <p class="setup-hint">{step.hint}</p>
          </div>
          {#if !ticked}
            <a class="setup-link" href={step.href} aria-label="{step.label} — {$copy.setupOpen}">
              {$copy.setupOpen} <span aria-hidden="true">→</span>
            </a>
          {/if}
        </li>
      {/each}
    </ol>

    {#if complete}
      <p class="setup-done"><Icon name="check" class="h-3.5 w-3.5" /> {$copy.setupDone}</p>
    {/if}
  </section>
{/if}

<style>
  .setup-panel {
    position: relative;
    margin-bottom: 28px;
    border: 1px solid var(--line);
    border-radius: 18px;
    background:
      linear-gradient(180deg, color-mix(in srgb, var(--color-brand-500) 7%, var(--paper)) 0%, var(--paper) 62%);
    box-shadow: var(--shadow);
    padding: 18px 50px 18px 20px;
  }

  .setup-head {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px 20px;
    margin-bottom: 14px;
  }
  .setup-copy { min-width: 0; flex: 1 1 320px; }
  .setup-eyebrow {
    margin: 0;
    color: var(--faint);
    font-family: 'DM Mono', monospace;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }
  .setup-intro { margin: 4px 0 0; color: var(--muted); font-size: 12px; line-height: 1.45; }

  .setup-meter-wrap { display: flex; align-items: center; gap: 10px; flex: 0 0 190px; }
  .setup-count {
    color: var(--muted);
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    font-weight: 700;
  }
  .setup-count.full { color: var(--green); }
  .setup-meter {
    flex: 1 1 auto;
    height: 4px;
    border-radius: 999px;
    background: var(--line);
    overflow: hidden;
  }
  .setup-meter span {
    display: block;
    height: 100%;
    border-radius: 999px;
    background: linear-gradient(90deg, var(--orange-solid), var(--color-brand-600));
    transition: width 0.35s ease;
  }

  .setup-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .setup-grid li {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 10px 12px;
    border: 1px solid var(--line);
    border-radius: 12px;
    background: color-mix(in srgb, var(--canvas) 55%, transparent);
  }
  .setup-grid li.next { border-color: color-mix(in srgb, var(--orange-solid) 45%, var(--line)); }
  .setup-grid li.ticked { background: transparent; }

  .setup-tick {
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
  .setup-tick:hover { border-color: var(--orange-solid); color: var(--orange-solid); }
  .setup-n { font-family: 'DM Mono', monospace; font-size: 10px; font-weight: 700; }
  .ticked .setup-tick {
    border-color: color-mix(in srgb, var(--green) 55%, var(--line));
    background: color-mix(in srgb, var(--green) 14%, transparent);
    color: var(--green);
  }
  .ticked .setup-tick:hover { border-color: var(--green); color: var(--green); }

  .setup-body { flex: 1 1 auto; min-width: 0; }
  .setup-label { margin: 0; color: var(--ink); font-size: 12.5px; font-weight: 700; }
  .ticked .setup-label { color: var(--muted); text-decoration: line-through; }
  .setup-hint { margin: 2px 0 0; color: var(--muted); font-size: 11px; line-height: 1.45; }

  .setup-link {
    flex: 0 0 auto;
    align-self: center;
    color: var(--color-brand-700);
    font-size: 11px;
    font-weight: 700;
    text-decoration: none;
    white-space: nowrap;
  }
  .setup-link:hover { text-decoration: underline; }

  .setup-done {
    display: flex;
    align-items: center;
    gap: 6px;
    margin: 12px 0 0;
    color: var(--green);
    font-size: 12px;
    font-weight: 700;
  }

  .setup-close {
    position: absolute;
    top: 14px;
    right: 14px;
    display: grid;
    place-items: center;
    width: 26px;
    height: 26px;
    border-radius: 8px;
    color: var(--faint);
    background: transparent;
  }
  .setup-close:hover { color: var(--muted); background: var(--color-surface-3); }

  .setup-restore {
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
  .setup-restore:hover { color: var(--ink); border-color: var(--orange-solid); }

  @media (max-width: 900px) {
    .setup-panel { padding: 16px 44px 16px 16px; }
    .setup-grid { grid-template-columns: minmax(0, 1fr); }
    .setup-meter-wrap { flex: 1 1 150px; }
  }

  @media (prefers-reduced-motion: reduce) {
    .setup-meter span { transition: none; }
  }
</style>
