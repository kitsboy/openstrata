<script lang="ts">
  // First-run tour — a 4-step dismissible highlight overlay for new councils.
  // Shown only to signed-out / fresh visitors; one dismissal remembers forever.
  import { copy } from '$lib/i18n';
  import Icon from '$lib/components/Icon.svelte';
  import { icons } from '$lib/icons';

  let { onFinish }: { onFinish: () => void } = $props();

  const TOUR_KEY = 'openstrata-tour-seen';
  let step = $state(0);
  let shown = $state(true);

  const steps = $derived<Array<{ icon: keyof typeof icons; title: string; text: string }>>([
    { icon: 'spark', title: $copy.tourIntro, text: $copy.tourIntroText },
    { icon: 'shield', title: $copy.tourSignIn, text: $copy.tourSignInText },
    { icon: 'plus', title: $copy.tourCreate, text: $copy.tourCreateText },
    { icon: 'chart', title: $copy.tourLive, text: $copy.tourLiveText }
  ]);

  function close(remember = true) {
    shown = false;
    if (remember) {
      try {
        localStorage.setItem(TOUR_KEY, '1');
      } catch {
        /* storage unavailable */
      }
    }
    onFinish();
  }
</script>

{#if shown}
  <div class="tour-backdrop" role="presentation" onkeydown={(e) => e.key === 'Escape' && close(true)}>
    <button class="tour-scrim" type="button" aria-label={$copy.closeDialog} onclick={() => close(true)}></button>
    <div class="tour-card" role="dialog" aria-modal="true" tabindex="0" aria-label={$copy.tourIntro} onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.key === 'Escape' && close(true)}>
      <button class="tour-close" aria-label={$copy.closeDialog} onclick={() => close(true)}><Icon name="close" class="h-3.5 w-3.5" /></button>
      <div class="tour-mark"><Icon name={steps[step].icon} class="h-5 w-5" /></div>
      <p class="tour-eyebrow">{$copy.tourIntro} · {step + 1}/4</p>
      <h2>{steps[step].title}</h2>
      <p class="tour-text">{steps[step].text}</p>
      <div class="tour-dots" aria-hidden="true">
        {#each steps as _, i}<span class:tour-dot-active={i === step}></span>{/each}
      </div>
      <div class="tour-actions">
        <button class="tour-skip" onclick={() => close(true)}>{$copy.tourSkip}</button>
        {#if step < steps.length - 1}
          <button class="tour-next" onclick={() => (step += 1)}>{$copy.tourNext} <Icon name="chevron-right" class="h-3 w-3" /></button>
        {:else}
          <button class="tour-next" onclick={() => close(true)}>{$copy.tourDone} <Icon name="check" class="h-3 w-3" /></button>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .tour-backdrop {
    position: fixed;
    inset: 0;
    z-index: 95;
    display: grid;
    place-items: center;
    padding: 20px;
    background: rgba(10, 27, 36, .55);
    backdrop-filter: blur(4px);
  }
  .tour-scrim { position: absolute; inset: 0; background: transparent; }
  .tour-card {
    position: relative;
    z-index: 1;
    width: min(100%, 380px);
    padding: 30px 28px 24px;
    border: 1px solid var(--line);
    border-radius: 18px;
    background: var(--paper);
    box-shadow: 0 30px 90px rgba(10, 27, 36, .3);
    text-align: center;
  }
  .tour-close { position: absolute; top: 14px; right: 14px; display: grid; place-items: center; width: 28px; height: 28px; border-radius: 8px; color: var(--muted); background: var(--surface-3); }
  .tour-mark { display: grid; place-items: center; width: 46px; height: 46px; margin: 0 auto 14px; border-radius: 13px; color: var(--orange); background: color-mix(in srgb, var(--orange) 10%, transparent); }
  .tour-eyebrow { margin: 0 0 6px; color: var(--faint); font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: .09em; text-transform: uppercase; }
  .tour-card h2 { margin: 0 0 8px; color: var(--ink); font-size: 19px; font-weight: 800; letter-spacing: -.4px; }
  .tour-text { margin: 0; color: var(--muted); font-size: 12px; line-height: 1.6; }
  .tour-dots { display: flex; justify-content: center; gap: 6px; margin: 18px 0 20px; }
  .tour-dots span { width: 6px; height: 6px; border-radius: 50%; background: var(--line); transition: background .2s ease, width .2s ease; }
  .tour-dots span.tour-dot-active { width: 18px; border-radius: 4px; background: var(--orange); }
  .tour-actions { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
  .tour-skip { padding: 8px 10px; color: var(--faint); background: transparent; font-size: 11px; font-weight: 700; }
  .tour-skip:hover { color: var(--muted); }
  .tour-next { display: inline-flex; align-items: center; gap: 6px; padding: 9px 15px; border-radius: 9px; color: #fff; background: var(--orange); font-size: 11px; font-weight: 800; transition: background .2s ease; }
  .tour-next:hover { background: var(--orange-deep); }
</style>
