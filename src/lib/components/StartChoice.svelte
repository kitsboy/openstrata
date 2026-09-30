<script lang="ts">
  /**
   * The first-visit question — three ways into OpenStrata.
   *
   * Visibility is CSS-driven (`start-pending` on `<html>`), so this can be
   * rendered in the prerendered markup without a flash and without hiding the
   * dashboard from a crawler. See `$lib/start.ts` for the whole rule.
   *
   * Only ever mounted on `/`; the dashboard shell keeps working for everyone who
   * has already answered or is signed in.
   */
  import { copy } from '$lib/i18n';
  import Icon from '$lib/components/Icon.svelte';
  import type { StartChoiceId } from '$lib/start';

  let {
    onChoose,
    onSignIn
  }: { onChoose: (choice: StartChoiceId) => void; onSignIn: () => void } = $props();

  const options = $derived([
    {
      id: 'exploring' as const,
      icon: 'search' as const,
      title: $copy.startExplore,
      hint: $copy.startExploreHint,
      action: $copy.startExploreAction
    },
    {
      id: 'setup' as const,
      icon: 'building' as const,
      title: $copy.startSetup,
      hint: $copy.startSetupHint,
      action: $copy.startSetupAction
    }
  ]);
</script>

<section class="start-choice" aria-labelledby="start-choice-title">
  <p class="start-eyebrow">{$copy.startEyebrow}</p>
  <h1 id="start-choice-title" class="start-title">{$copy.startTitle}</h1>
  <p class="start-intro">{$copy.startIntro}</p>

  <div class="start-grid">
    {#each options as option}
      <button type="button" class="start-card" onclick={() => onChoose(option.id)}>
        <span class="start-glyph"><Icon name={option.icon} class="h-5 w-5" /></span>
        <strong>{option.title}</strong>
        <small>{option.hint}</small>
        <span class="start-action">{option.action} <span aria-hidden="true">→</span></span>
      </button>
    {/each}

    <button type="button" class="start-card" onclick={onSignIn}>
      <span class="start-glyph"><Icon name="lock" class="h-5 w-5" /></span>
      <strong>{$copy.startSignIn}</strong>
      <small>{$copy.startSignInHint}</small>
      <span class="start-action">{$copy.startSignInAction} <span aria-hidden="true">→</span></span>
    </button>
  </div>

  <p class="start-note"><Icon name="shield" class="h-3.5 w-3.5" /> {$copy.startNote}</p>
</section>

<style>
  /* Hidden unless the inline script in app.html says this is a first visit. */
  .start-choice { display: none; }

  .start-choice {
    max-width: 940px;
    margin: 0 auto;
    padding: 18px 0 8px;
  }

  .start-eyebrow {
    margin: 0;
    color: var(--faint);
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }

  .start-title {
    margin: 8px 0 0;
    color: var(--ink);
    font-size: 30px;
    font-weight: 800;
    letter-spacing: -0.6px;
    line-height: 1.15;
  }

  .start-intro {
    margin: 10px 0 0;
    max-width: 62ch;
    color: var(--muted);
    font-size: 14px;
    line-height: 1.55;
  }

  .start-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
    margin-top: 24px;
  }

  .start-card {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    padding: 18px;
    border: 1px solid var(--line);
    border-radius: 16px;
    background: var(--paper);
    box-shadow: var(--shadow-sm, 0 1px 2px rgba(16, 45, 59, 0.06));
    text-align: left;
    transition: border-color 0.2s ease, transform 0.2s ease;
  }

  .start-card:hover {
    border-color: color-mix(in srgb, var(--color-brand-500) 45%, var(--line));
    transform: translateY(-1px);
  }

  .start-glyph {
    display: grid;
    place-items: center;
    width: 34px;
    height: 34px;
    border-radius: 10px;
    background: color-mix(in srgb, var(--color-brand-500) 12%, transparent);
    color: var(--color-brand-700);
  }

  .start-card strong { color: var(--ink); font-size: 14.5px; font-weight: 800; }
  .start-card small { color: var(--muted); font-size: 12px; line-height: 1.5; }

  .start-action {
    margin-top: auto;
    padding-top: 10px;
    color: var(--color-brand-700);
    font-size: 11.5px;
    font-weight: 700;
  }

  .start-note {
    display: flex;
    align-items: center;
    gap: 7px;
    margin: 18px 0 0;
    color: var(--muted);
    font-size: 11.5px;
    font-weight: 600;
  }

  @media (max-width: 900px) {
    .start-grid { grid-template-columns: minmax(0, 1fr); }
    .start-title { font-size: 25px; }
  }

  @media (prefers-reduced-motion: reduce) {
    .start-card { transition: none; }
    .start-card:hover { transform: none; }
  }
</style>
