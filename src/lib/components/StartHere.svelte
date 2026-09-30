<script lang="ts">
  // "Start here" — a three-leg journey strip that answers the question a
  // first-time visitor actually has: what do I do next?
  //
  //   Explore the modules → Configure your building → Register and go live
  //
  // It sits directly under a page header band, highlights the leg you are on,
  // ticks off the legs you have already visited, and nudges the next one. All
  // progress is local (see $lib/journey) — no account, no network call.
  import { onMount } from 'svelte';
  import { copy } from '$lib/i18n';
  import Icon from '$lib/components/Icon.svelte';
  import {
    JOURNEY_HIDE_KEY,
    JOURNEY_KEY,
    journeyPercent,
    nextStep,
    parseReached,
    withStep,
    type JourneyStep
  } from '$lib/journey';

  let { step }: { step: JourneyStep } = $props();

  const legs = $derived<Array<{ n: JourneyStep; href: string; label: string; hint: string }>>([
    { n: 1, href: '/tools', label: $copy.journeyStep1, hint: $copy.journeyHint1 },
    { n: 2, href: '/tools/wizard', label: $copy.journeyStep2, hint: $copy.journeyHint2 },
    { n: 3, href: '/docs/manual/getting-started', label: $copy.journeyStep3, hint: $copy.journeyHint3 }
  ]);

  let hidden = $state(false);
  let reached = $state<JourneyStep[]>([]);
  let percent = $state(0);

  onMount(() => {
    try {
      if (localStorage.getItem(JOURNEY_HIDE_KEY) === '1') {
        hidden = true;
        return;
      }
      reached = withStep(parseReached(localStorage.getItem(JOURNEY_KEY)), step);
      localStorage.setItem(JOURNEY_KEY, JSON.stringify(reached));
    } catch {
      /* storage unavailable — the strip still renders, just stateless */
      reached = [step];
    }
    percent = journeyPercent(reached);
  });

  // The leg to nudge: the first one not yet visited, falling back to the
  // current leg so a completed journey still shows a sensible caption.
  const target = $derived(nextStep(reached) ?? step);
  const allDone = $derived(reached.length === legs.length);
</script>

{#if !hidden}
  <section class="start-here" aria-label={$copy.journeyTitle}>
    <div class="sh-inner">
      <div class="sh-head">
        <p class="sh-eyebrow">{$copy.journeyTitle}</p>
        <p class="sh-hint">{allDone ? $copy.journeyStep3 : legs[target - 1].hint}</p>
      </div>

      <ol class="sh-track">
        {#each legs as leg}
          <li
            class:done={reached.includes(leg.n) && leg.n !== step}
            class:active={leg.n === step}
          >
            <a href={leg.href} aria-current={leg.n === step ? 'step' : undefined}>
              <span class="sh-node">
                {#if reached.includes(leg.n) && leg.n !== step}
                  <Icon name="check" class="h-3 w-3" />
                {:else}
                  {leg.n}
                {/if}
              </span>
              <span class="sh-label">{leg.label}</span>
            </a>
          </li>
        {/each}
      </ol>

      <div class="sh-meter" role="progressbar" aria-valuenow={percent} aria-valuemin="0" aria-valuemax="100">
        <span style="width: {percent}%"></span>
      </div>

      <button
        class="sh-close"
        type="button"
        aria-label={$copy.closeDialog}
        onclick={() => {
          hidden = true;
          try {
            localStorage.setItem(JOURNEY_HIDE_KEY, '1');
          } catch {
            /* storage unavailable */
          }
        }}
      >
        <Icon name="close" class="h-3 w-3" />
      </button>
    </div>
  </section>
{/if}

<style>
  .start-here {
    border-bottom: 1px solid var(--line);
    background: color-mix(in srgb, var(--paper) 70%, transparent);
  }
  .sh-inner {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 14px 26px;
    max-width: 80rem;
    margin: 0 auto;
    padding: 14px 3rem 14px 1.5rem;
  }
  .sh-head { min-width: 0; flex: 0 1 260px; }
  .sh-eyebrow {
    margin: 0;
    color: var(--faint);
    font-family: 'DM Mono', monospace;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: .1em;
    text-transform: uppercase;
  }
  .sh-hint { margin: 3px 0 0; color: var(--muted); font-size: 11px; line-height: 1.45; }

  .sh-track {
    display: flex;
    flex: 1 1 auto;
    align-items: center;
    gap: 0;
    min-width: 0;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .sh-track li { position: relative; flex: 1 1 0; min-width: 0; }
  /* Connector rail between legs, drawn behind the nodes. */
  .sh-track li + li::before {
    content: '';
    position: absolute;
    top: 11px;
    right: calc(50% + 15px);
    left: calc(-50% + 15px);
    height: 1px;
    background: var(--line);
  }
  .sh-track li.done + li::before,
  .sh-track li.active + li::before { background: color-mix(in srgb, var(--green) 55%, var(--line)); }

  .sh-track a {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    text-decoration: none;
    text-align: center;
  }
  .sh-node {
    display: grid;
    place-items: center;
    width: 23px;
    height: 23px;
    border-radius: 50%;
    border: 1px solid var(--line);
    background: var(--paper);
    color: var(--faint);
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    font-weight: 700;
    transition: background .2s ease, color .2s ease, border-color .2s ease;
  }
  .sh-label { color: var(--muted); font-size: 10px; font-weight: 700; line-height: 1.3; }
  .sh-track a:hover .sh-node { border-color: var(--orange-solid); color: var(--orange-solid); }
  .sh-track a:hover .sh-label { color: var(--ink); }

  .sh-track li.active .sh-node {
    border-color: var(--orange-solid);
    background: var(--orange-solid);
    color: #fff;
    box-shadow: 0 0 0 4px color-mix(in srgb, var(--orange-solid) 16%, transparent);
  }
  .sh-track li.active .sh-label { color: var(--ink); }
  .sh-track li.done .sh-node {
    border-color: color-mix(in srgb, var(--green) 55%, var(--line));
    background: color-mix(in srgb, var(--green) 14%, transparent);
    color: var(--green);
  }

  .sh-meter {
    flex: 0 0 70px;
    height: 3px;
    border-radius: 999px;
    background: var(--line);
    overflow: hidden;
  }
  .sh-meter span {
    display: block;
    height: 100%;
    border-radius: 999px;
    background: linear-gradient(90deg, var(--orange-solid), var(--color-brand-600));
    transition: width .35s ease;
  }

  .sh-close {
    position: absolute;
    top: 50%;
    right: 10px;
    translate: 0 -50%;
    display: grid;
    place-items: center;
    width: 24px;
    height: 24px;
    border-radius: 7px;
    color: var(--faint);
    background: transparent;
  }
  .sh-close:hover { color: var(--muted); background: var(--color-surface-3); }

  @media (max-width: 720px) {
    .sh-inner { padding: 13px 2.75rem 13px 1rem; gap: 12px; }
    .sh-head { flex: 1 1 100%; }
    .sh-meter { display: none; }
    .sh-label { font-size: 9px; }
  }

  @media (prefers-reduced-motion: reduce) {
    .sh-node, .sh-meter span { transition: none; }
  }
</style>
