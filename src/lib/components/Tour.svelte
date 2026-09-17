<script lang="ts">
  // Greeter card — a dismissible welcome overlay for new visitors.
  // Shown only to signed-out / fresh visitors; one dismissal remembers forever.
  //
  // Two faces in one frame:
  //   1. A short popup greeting with a one-line explanation (the "thanks for
  //      stopping by" card that used to be on the live site).
  //   2. A small video section below it for the 30–60s intro Kimi will record
  //      with HyperFrames using Kimi's own images/video.
  import { copy } from '$lib/i18n';
  import Icon from '$lib/components/Icon.svelte';
  import Illustrations from '$lib/components/Illustrations.svelte';
  import { icons } from '$lib/icons';

  let { onFinish }: { onFinish: () => void } = $props();

  const TOUR_KEY = 'openstrata-tour-seen';
  let step = $state(0);
  let shown = $state(true);

  // Step 0 is the greeting card; the video lives inside the card so a visitor
  // can read the quick greeting, watch the short video, then continue.
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

  // Video played at least once on this visit — keep it collapsed on future
  // step advances so the card stays tidy, but the section stays present.
  let videoSeen = $state(false);
  let videoExpanded = $state(true);

  let videoSrc = $state<string | null>(null);
  let videoFallback = $state(true);

  function tryAttachVideo(src: string) {
    if (!src) return;
    videoSrc = src;
    videoFallback = false;
  }

  // Point this at the intro video once Kimi has rendered it. The frame is
  // built now; the URL is swapped in after the handoff to Kimi.
  // eslint-disable-next-line svelte/no-at-html-tags
  const VIDEO_SRC_PLACEHOLDER = '';

  function beginVideo() {
    tryAttachVideo(VIDEO_SRC_PLACEHOLDER || $copy.tourVideoFallback);
    videoExpanded = true;
    videoSeen = true;
  }

  function videoFallbackClicked() {
    videoExpanded = true;
    videoFallback = true;
    videoSeen = true;
    // Empty src keeps the placeholder state without an error.
    videoSrc = '';
  }
</script>

{#if shown}
  <div class="tour-backdrop" role="presentation" onkeydown={(e) => e.key === 'Escape' && close(true)}>
    <button class="tour-scrim" type="button" aria-label={$copy.closeDialog} onclick={() => close(true)}></button>
    <div class="tour-card" role="dialog" aria-modal="true" tabindex="0" aria-label={$copy.tourIntro} onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.key === 'Escape' && (videoExpanded = false)}>
      <button class="tour-close" aria-label={$copy.closeDialog} onclick={() => close(true)}><Icon name="close" class="h-3.5 w-3.5" /></button>

      <!-- Greeting card -->
      <div class="tour-greet">
        <div class="tour-art"><Illustrations scene={steps[step].scene} class="h-20 w-20 text-brand-600" /></div>
        <div class="tour-mark"><Icon name={steps[step].icon} class="h-5 w-5" /></div>
        <p class="tour-eyebrow">{$copy.tourIntro} · {step + 1}/4</p>
        <h2>{steps[step].title}</h2>
        <p class="tour-text">{steps[step].text}</p>

        <!-- Video section: 30–60s intro, rendered by Kimi -->
        <div class="tour-video">
          <div class="tour-video-head">
            <Icon name="play" class="h-3.5 w-3.5" />
            <span class="tour-video-label">{$copy.tourVideoTitle}</span>
          </div>

          {#if videoExpanded}
            <div class="tour-video-frame">
              {#if videoFallback}
                <!-- Kimi placeholder: replaced when the video lands -->
                <div class="tour-video-tease" role="button" tabindex="0" aria-label={$copy.tourVideoCta} onclick={videoFallbackClicked} onkeydown={(e) => e.key === 'Enter' && videoFallbackClicked()}>
                  <div class="tour-video-tease-mark"><Icon name="play" class="h-7 w-7" /></div>
                  <p class="tour-video-tease-title">{$copy.tourVideoSub}</p>
                  <p class="tour-video-tease-hint">{$copy.tourVideoFallback}</p>
                  <button class="tour-video-tease-cta" type="button" onclick={beginVideo}>{$copy.tourVideoCta}</button>
                </div>
              {:else if videoSrc}
                <video
                  class="tour-video-el"
                  src={videoSrc}
                  preload="metadata"
                  controls
                  aria-label={$copy.tourVideoTitle}
                  onclick={() => (videoSeen = true)}
                >
                  <track kind="captions" srclang="en" label="English" />
                </video>
              {/if}
            </div>
          {:else}
            <button class="tour-video-trigger" type="button" onclick={() => (videoExpanded = true)}>
              <Icon name="chevron-down" class="h-3 w-3" />
              <span class="tour-video-trigger-label">{$copy.tourVideoTitle}</span>
            </button>
          {/if}
        </div>

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
    padding: 26px 24px 22px;
    border: 1px solid var(--line);
    border-radius: 18px;
    background: var(--paper);
    box-shadow: 0 30px 90px rgba(10, 27, 36, .3);
    text-align: center;
  }
  .tour-greet { display: flex; flex-direction: column; align-items: center; gap: 12px; }
  .tour-art { margin: 0 auto; opacity: .9; }
  .tour-close { position: absolute; top: 14px; right: 14px; display: grid; place-items: center; width: 28px; height: 28px; border-radius: 8px; color: var(--muted); background: var(--surface-3); }
  .tour-mark { display: grid; place-items: center; width: 46px; height: 46px; border-radius: 13px; color: var(--orange); background: color-mix(in srgb, var(--orange) 10%, transparent); }
  .tour-eyebrow { margin: 0; color: var(--faint); font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: .09em; text-transform: uppercase; }
  .tour-card h2 { margin: 0; color: var(--ink); font-size: 19px; font-weight: 800; letter-spacing: -.4px; }
  .tour-text { margin: 0; color: var(--muted); font-size: 12px; line-height: 1.6; }

  /* Video section */
  .tour-video { width: 100%; margin-top: 6px; border-top: 1px solid var(--line); padding-top: 12px; }
  .tour-video-head {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    color: var(--faint);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: .04em;
    text-transform: uppercase;
  }
  .tour-video-label { color: var(--faint); }

  .tour-video-frame { margin-top: 10px; position: relative; }
  .tour-video-el {
    width: 100%;
    aspect-ratio: 16 / 9;
    border-radius: 12px;
    background: var(--surface-2);
    display: block;
    object-fit: cover;
  }
  .tour-video-tease {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    width: 100%;
    aspect-ratio: 16 / 9;
    border-radius: 12px;
    background: var(--surface-2);
    color: var(--muted);
    border: 1px solid var(--line);
    cursor: pointer;
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
    transition: background .2s ease;
  }
  .tour-video-tease:hover .tour-video-tease-mark { background: color-mix(in srgb, var(--orange) 22%, transparent); }
  .tour-video-tease-title { margin: 0; font-size: 12px; font-weight: 700; color: var(--ink); line-height: 1.45; }
  .tour-video-tease-hint { margin: 0; font-size: 10px; color: var(--faint); }
  .tour-video-tease-cta {
    margin-top: 6px;
    padding: 7px 14px;
    border-radius: 9px;
    color: #fff;
    background: var(--orange);
    font-size: 10px;
    font-weight: 800;
    letter-spacing: .02em;
  }

  .tour-video-trigger {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border: 0;
    background: transparent;
    color: var(--faint);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: .04em;
    text-transform: uppercase;
    cursor: pointer;
    padding: 6px 0;
  }
  .tour-video-trigger-label { color: var(--faint); }

  .tour-dots { display: flex; justify-content: center; gap: 6px; margin: 18px 0 16px; }
  .tour-dots span { width: 6px; height: 6px; border-radius: 50%; background: var(--line); transition: background .2s ease, width .2s ease; }
  .tour-dots span.tour-dot-active { width: 18px; border-radius: 4px; background: var(--orange); }
  .tour-actions { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
  .tour-skip { padding: 8px 10px; color: var(--faint); background: transparent; font-size: 11px; font-weight: 700; }
  .tour-skip:hover { color: var(--muted); }
  .tour-next { display: inline-flex; align-items: center; gap: 6px; padding: 9px 15px; border-radius: 9px; color: #fff; background: var(--orange); font-size: 11px; font-weight: 800; transition: background .2s ease; }
  .tour-next:hover { background: var(--orange-deep); }
</style>
