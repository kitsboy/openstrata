<script lang="ts">
  /** PWA chrome (#17) — offline banner + install prompt. The service worker is
   *  already registered (network-first navigations, cache-first assets); this
   *  component surfaces the two moments that matter to a user: the app works
   *  offline, and it can be installed to the home screen. */
  import { onMount } from 'svelte';
  import { copy } from '$lib/i18n';
  import Icon from './Icon.svelte';

  let offline = $state(false);
  let installEvt: Event | null = $state(null);

  onMount(() => {
    const show = () => (offline = !navigator.onLine);
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      installEvt = e;
    };
    window.addEventListener('offline', show);
    window.addEventListener('online', show);
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    show();
    return () => {
      window.removeEventListener('offline', show);
      window.removeEventListener('online', show);
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
    };
  });

  async function install() {
    if (!installEvt) return;
    (installEvt as unknown as { prompt: () => Promise<void> }).prompt();
    installEvt = null;
  }
</script>

{#if offline}
  <div class="os-offline-banner" role="status">
    <Icon name="alert" class="h-3.5 w-3.5" />
    <span><strong>{$copy.offlineTitle}</strong> — {$copy.offlineText}</span>
  </div>
{/if}

{#if installEvt}
  <button class="os-install-chip" onclick={install}>
    <Icon name="download" class="h-3.5 w-3.5" /> {$copy.installApp}
  </button>
{/if}

<style>
  .os-offline-banner {
    position: fixed;
    top: 12px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 60;
    display: flex;
    align-items: center;
    gap: 8px;
    max-width: min(92vw, 560px);
    padding: 8px 14px;
    border-radius: 12px;
    background: #1e293b;
    color: #f8fafc;
    font-size: 12px;
    box-shadow: 0 8px 24px rgb(0 0 0 / 0.25);
  }
  .os-install-chip {
    position: fixed;
    right: 16px;
    bottom: 84px;
    z-index: 55;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    border-radius: 999px;
    border: 1px solid var(--brand-200, #c7d2fe);
    background: var(--brand-50, #eef2ff);
    color: var(--brand-700, #4338ca);
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 6px 20px rgb(0 0 0 / 0.12);
  }
</style>
