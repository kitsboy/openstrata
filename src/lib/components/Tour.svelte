<script lang="ts">
  // Greeter card — a dismissible welcome overlay for new visitors.
  // Shown only to signed-out / fresh visitors; one dismissal remembers forever.
  //
  // Step 1 is the greeter itself and gets a wider, two-column card:
  //   left  — the 60-second OpenStrata intro video (rendered by Kimi).
  //   right — "What you get" (four plain-language facts) + "Where to start".
  // Steps 2–4 stay lean and narrow: one icon, one title, one line each.
  import { copy } from '$lib/i18n';
  import Icon from '$lib/components/Icon.svelte';
  import Illustrations from '$lib/components/Illustrations.svelte';
  import { icons } from '$lib/icons';

  let { onFinish }: { onFinish: () => void } = $props();

  const TOUR_KEY = 'openstrata-tour-seen';
  let step = $state(0);
  let shown = $state(true);

  const steps = $derived<Array<{
    icon: keyof typeof icons;
    scene: 'building' | 'ledger' | 'bitcoin' | 'empty';
    title: string;
    text: string;
  }>>([
    { icon: 'spark', scene: 'building', title: $copy.tourIntro, text: $copy.tourIntroText },
    { icon: 'shield', scene: 'ledger', title: $copy.tourSignIn, text: $copy.tourSignInText },
    { icon: 'plus', scene: 'empty', title: $copy.tourCreate, text: $copy.tourCreateText },
    { icon: 'chart', scene: 'bitcoin', title: $copy.tourLive, text: $copy.tourLiveText }
  ]);

  // The offer facts + the start steps, paired with their icons so the markup
  // stays a loop instead of a wall of hand-written rows.
  const facts = $derived<Array<{ icon: keyof typeof icons; text: string }>>([
    { icon: 'lock', text: $copy.tourFact1 },
    { icon: 'scale', text: $copy.tourFact2 },
    { icon: 'bitcoin', text: $copy.tourFact3 },
    { icon: 'download', text: $copy.tourFact4 }
  ]);

  const howSteps = $derived<string[]>([$copy.tourHow1, $copy.tourHow2, $copy.tourHow3]);

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

  // The intro video Kimi delivered (HyperFrames, 2026-09-18) lives in the repo
  // at static/video/openstrata-intro.mp4, so it is served from
  // /video/openstrata-intro.mp4. Clear the constant and the card falls back to
  // the honest "watch it in the tools" placeholder instead.
  const VIDEO_SRC = '/video/openstrata-intro.mp4';
  // Kimi's Cam-approved poster (1920×1080, "Govern yourself."). Without it the
  // player idles on a blank first frame, which reads as broken rather than
  // paused. It is the same asset path pattern as the video, so both move
  // together.
  const VIDEO_POSTER = '/video/openstrata-intro-poster.png';

  let videoBroken = $state(false);
  const videoReady = $derived(VIDEO_SRC.length > 0 && !videoBroken);
</script>

{#if shown}
  <div class="tour-backdrop" role="presentation" onkeydown={(e) => e.key === 'Escape' && close(true)}>
    <button class="tour-scrim" type="button" aria-label={$copy.closeDialog} onclick={() => close(true)}></button>
    <div
      class="tour-card"
      class:tour-card-wide={step === 0}
      role="dialog"
      aria-modal="true"
      tabindex="0"
      aria-label={$copy.tourIntro}
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.key === 'Escape' && close(true)}
    >
      <button class="tour-close" aria-label={$copy.closeDialog} onclick={() => close(true)}><Icon name="close" class="h-3.5 w-3.5" /></button>

      <div class="tour-greet">
        {#if step > 0}
          <div class="tour-art"><Illustrations scene={steps[step].scene} class="h-16 w-16 text-brand-600" /></div>
        {/if}
        <div class="tour-mark"><Icon name={steps[step].icon} class="h-5 w-5" /></div>
        <p class="tour-eyebrow">{$copy.tourIntro} · {step + 1}/4</p>
        <h2>{steps[step].title}</h2>
        <p class="tour-text">{steps[step].text}</p>
      </div>

      {#if step === 0}
        <div class="tour-body">
          <!-- 60-second intro video -->
          <div class="tour-col">
            <div class="tour-video">
              <div class="tour-video-head">
                <Icon name="play" class="h-3.5 w-3.5" />
                <span class="tour-video-label">{$copy.tourVideoTitle}</span>
              </div>

              {#if videoReady}
                <video
                  class="tour-video-el"
                  src={VIDEO_SRC}
                  poster={VIDEO_POSTER}
                  preload="metadata"
                  controls
                  playsinline
                  aria-label={$copy.tourVideoTitle}
                  onerror={() => (videoBroken = true)}
                >
                  <track kind="captions" srclang="en" label="English" />
                </video>
                <p class="tour-video-caption">{$copy.tourVideoSub}</p>
              {:else}
                <div class="tour-video-tease">
                  <div class="tour-video-tease-mark"><Icon name="play" class="h-7 w-7" /></div>
                  <p class="tour-video-tease-title">{$copy.tourVideoSub}</p>
                  <p class="tour-video-tease-hint">{$copy.tourVideoFallback}</p>
                </div>
              {/if}
            </div>
          </div>

          <div class="tour-col">
            <!-- What you get -->
            <div class="tour-block">
              <p class="tour-block-title">{$copy.tourFactsTitle}</p>
              <ul class="tour-facts">
                {#each facts as fact}
                  <li>
                    <span class="tour-fact-icon"><Icon name={fact.icon} class="h-3.5 w-3.5" /></span>
                    <span>{fact.text}</span>
                  </li>
                {/each}
              </ul>
            </div>

            <!-- Where to start -->
            <div class="tour-block">
              <p class="tour-block-title">{$copy.tourHowTitle}</p>
              <ol class="tour-how">
                {#each howSteps as text, i}
                  <li>
                    <span class="tour-how-num">{i + 1}</span>
                    <span>{text}</span>
                  </li>
                {/each}
              </ol>
            </div>
          </div>
        </div>
      {/if}

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
    width: min(100%, 400px);
    max-height: min(92vh, 720px);
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: 24px 22px 20px;
    border: 1px solid var(--line);
    border-radius: 18px;
    background: var(--paper);
    box-shadow: 0 30px 90px rgba(10, 27, 36, .3);
    text-align: center;
  }
  /* Step 1 carries the video + the offer copy, so it gets a wider card. */
  .tour-card-wide { width: min(100%, 720px); }

  .tour-greet { display: flex; flex-direction: column; align-items: center; gap: 9px; }
  .tour-art { margin: 0 auto; opacity: .9; }
  .tour-close { position: absolute; top: 12px; right: 12px; display: grid; place-items: center; width: 28px; height: 28px; border-radius: 8px; color: var(--muted); background: var(--surface-3); }
  .tour-mark { display: grid; place-items: center; width: 44px; height: 44px; border-radius: 13px; color: var(--orange); background: color-mix(in srgb, var(--orange) 10%, transparent); }
  .tour-eyebrow { margin: 0; color: var(--faint); font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: .09em; text-transform: uppercase; }
  .tour-card h2 { margin: 0; color: var(--ink); font-size: 19px; font-weight: 800; letter-spacing: -.4px; }
  .tour-text { margin: 0; color: var(--muted); font-size: 12px; line-height: 1.6; }

  /* Two-column step 1: video on the left, facts + start steps on the right. */
  .tour-body { display: grid; grid-template-columns: 1fr; gap: 14px; margin-top: 16px; text-align: left; }
  @media (min-width: 700px) {
    .tour-body { grid-template-columns: 1fr 1fr; gap: 22px; align-items: start; }
  }
  .tour-col { display: flex; flex-direction: column; gap: 12px; min-width: 0; }

  /* Video */
  .tour-video-head {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 9px;
    color: var(--faint);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: .04em;
    text-transform: uppercase;
  }
  .tour-video-el {
    width: 100%;
    aspect-ratio: 16 / 9;
    border-radius: 12px;
    background: var(--surface-2);
    display: block;
    object-fit: cover;
  }
  .tour-video-caption { margin: 8px 0 0; color: var(--faint); font-size: 10px; line-height: 1.5; }
  .tour-video-tease {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    aspect-ratio: 16 / 9;
    border-radius: 12px;
    background: var(--surface-2);
    color: var(--muted);
    border: 1px solid var(--line);
    text-align: center;
    padding: 16px 12px;
  }
  .tour-video-tease-mark {
    display: grid;
    place-items: center;
    width: 42px;
    height: 42px;
    border-radius: 50%;
    color: var(--ink);
    background: color-mix(in srgb, var(--orange) 12%, transparent);
  }
  .tour-video-tease-title { margin: 0; font-size: 12px; font-weight: 700; color: var(--ink); line-height: 1.45; }
  .tour-video-tease-hint { margin: 0; font-size: 10px; color: var(--faint); }

  /* Facts + start steps */
  .tour-block + .tour-block { border-top: 1px solid var(--line); padding-top: 12px; }
  .tour-block-title {
    margin: 0 0 8px;
    color: var(--faint);
    font-family: 'DM Mono', monospace;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: .09em;
    text-transform: uppercase;
  }
  .tour-facts, .tour-how { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 7px; }
  .tour-facts li, .tour-how li {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    color: var(--muted);
    font-size: 11px;
    line-height: 1.45;
  }
  .tour-fact-icon {
    flex: 0 0 auto;
    display: grid;
    place-items: center;
    width: 22px;
    height: 22px;
    border-radius: 7px;
    color: var(--orange);
    background: color-mix(in srgb, var(--orange) 10%, transparent);
  }
  .tour-how-num {
    flex: 0 0 auto;
    display: grid;
    place-items: center;
    width: 22px;
    height: 22px;
    border-radius: 7px;
    color: var(--ink);
    border: 1px solid var(--line);
    font-family: 'DM Mono', monospace;
    font-size: 10px;
    font-weight: 700;
  }

  .tour-dots { display: flex; justify-content: center; gap: 6px; margin: 16px 0 14px; }
  .tour-dots span { width: 6px; height: 6px; border-radius: 50%; background: var(--line); transition: background .2s ease, width .2s ease; }
  .tour-dots span.tour-dot-active { width: 18px; border-radius: 4px; background: var(--orange); }
  .tour-actions { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
  .tour-skip { padding: 8px 10px; color: var(--faint); background: transparent; font-size: 11px; font-weight: 700; }
  .tour-skip:hover { color: var(--muted); }
  .tour-next { display: inline-flex; align-items: center; gap: 6px; padding: 9px 15px; border-radius: 9px; color: #fff; background: var(--orange-solid); font-size: 11px; font-weight: 800; transition: background .2s ease; }
  .tour-next:hover { background: var(--orange-solid-deep); }

  /* Phones: the step-1 card stacks, so trim the chrome to keep it near a
     single screen — the long copy still scrolls inside the card. */
  @media (max-width: 699px) {
    .tour-card { padding: 20px 18px 16px; max-height: min(94vh, 760px); }
    .tour-greet { gap: 7px; }
    .tour-body { gap: 12px; margin-top: 13px; }
    .tour-col { gap: 10px; }
    .tour-facts, .tour-how { gap: 6px; }
    .tour-block + .tour-block { padding-top: 10px; }
    .tour-video-caption { display: none; }
    .tour-dots { margin: 13px 0 11px; }
  }

  @media (prefers-reduced-motion: reduce) {
    .tour-dots span, .tour-next { transition: none; }
  }
</style>
