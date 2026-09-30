<script lang="ts">
  /**
   * The honest demo banner.
   *
   * Sits at the very top of the dashboard content while the visitor is on
   * sample data with no session. It states the two things the fine print used
   * to carry alone — nothing here is real, nothing typed is saved — and offers
   * the one action that protects work in progress: finish (and save) the
   * building in the wizard, whose draft now survives a refresh. The rule that
   * decides visibility lives in `$lib/demo-banner` and is tested; the one that
   * must never fail is "a signed-in council never sees this", because their
   * books are real.
   */
  import { copy } from '$lib/i18n';
  import { auth } from '$lib/api/auth';
  import {
    persistDismissal,
    readDismissal,
    shouldShowDemoBanner
  } from '$lib/demo-banner';
  import Icon from '$lib/components/Icon.svelte';

  let dismissedRaw = $state<string | null>(null);

  // Read the stored dismissal once, client-side. The auth store drives the
  // rest: the rule re-evaluates as soon as the session settles, so the banner
  // can never flash for a signed-in council.
  $effect(() => {
    dismissedRaw = readDismissal();
  });

  const show = $derived(
    shouldShowDemoBanner({
      settled: $auth.status !== 'booting',
      signedIn: $auth.status === 'signed-in',
      apiModeDemo: $auth.apiMode === 'demo',
      dismissedRaw
    })
  );

  function dismiss() {
    persistDismissal();
    dismissedRaw = String(
      Math.floor(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate()) / 86_400_000)
    );
  }
</script>

{#if show}
  <div class="demo-banner" role="status">
    <span class="demo-mark" aria-hidden="true"><Icon name="alert" class="h-3.5 w-3.5" /></span>
    <p class="demo-copy">
      <strong>{$copy.demoBannerTitle}</strong>
      <span>{$copy.demoBannerBody}</span>
    </p>
    <a class="demo-action" href="/tools/wizard">{$copy.demoBannerCta} <span aria-hidden="true">→</span></a>
    <button class="demo-dismiss" type="button" aria-label={$copy.demoBannerDismiss} title={$copy.demoBannerDismiss} onclick={dismiss}>
      ×
    </button>
  </div>
{/if}

<style>
  .demo-banner {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
    padding: 11px 14px;
    border: 1px solid color-mix(in srgb, var(--color-warning) 40%, var(--line));
    border-radius: 14px;
    background: color-mix(in srgb, var(--color-warning) 8%, var(--paper));
  }
  .demo-mark {
    flex: 0 0 auto;
    display: grid;
    place-items: center;
    width: 26px;
    height: 26px;
    border-radius: 8px;
    background: color-mix(in srgb, var(--color-warning) 18%, transparent);
    color: var(--color-warning);
  }
  .demo-copy { min-width: 0; flex: 1; margin: 0; display: flex; flex-direction: column; gap: 1px; }
  .demo-copy strong { color: var(--ink); font-size: 12.5px; font-weight: 800; }
  .demo-copy span { color: var(--muted); font-size: 12px; }
  .demo-action { flex: 0 0 auto; color: var(--color-brand-600); font-size: 12px; font-weight: 800; text-decoration: none; }
  .demo-action:hover { text-decoration: underline; }
  .demo-dismiss {
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
  .demo-dismiss:hover { color: var(--ink); background: var(--surface-3); }
  @media (max-width: 640px) {
    .demo-banner { flex-wrap: wrap; gap: 8px 10px; }
    .demo-action { order: 2; }
    .demo-dismiss { order: 3; margin-left: auto; }
  }
</style>
