<script lang="ts">
  import { onMount } from 'svelte';
  import { copy } from '$lib/i18n';
  import { getApiHealth, stampHash, verifyUrl } from '$lib/satohash';

  let health = $state<'checking' | 'online' | 'offline'>('checking');
  let hash = $state('');
  let message = $state('');
  let messageOk = $state(false);

  onMount(() => {
    let alive = true;
    getApiHealth().then((res) => {
      if (!alive) return;
      health = res.ok ? 'online' : 'offline';
    });
    return () => {
      alive = false;
    };
  });

  async function doStamp() {
    message = '';
    messageOk = false;
    const result = await stampHash(hash);
    if (result.ok) {
      messageOk = true;
      message = `${$copy.satohashStampDone}${result.id ? ` — ${result.id}` : ''}`;
    } else {
      message = result.error ?? $copy.satohashHashInvalid;
    }
  }

  function doVerify() {
    const value = hash.trim();
    if (!/^[a-f0-9]{64}$/i.test(value)) {
      message = '';
      messageOk = false;
      message = $copy.satohashHashInvalid;
      return;
    }
    window.open(verifyUrl(value), '_blank', 'noopener,noreferrer');
  }
</script>

<div class="satohash-card">
  <div class="satohash-head">
    <span class="satohash-title">{$copy.satohashHealth}</span>
    <span class="satohash-pill {health}">
      {#if health === 'checking'}…{:else if health === 'online'}● {$copy.satohashOnline}{:else}○ {$copy.satohashOffline}{/if}
    </span>
  </div>

  <div class="satohash-body">
    <label class="satohash-label" for="satohash-hash">{$copy.satohashStampTitle}</label>
    <div class="satohash-row">
      <input
        id="satohash-hash"
        type="text"
        bind:value={hash}
        placeholder={$copy.satohashHashPlaceholder}
        spellcheck="false"
      />
      <button class="satohash-action" onclick={doStamp}>{$copy.satohashStampAction}</button>
      <button class="satohash-action secondary" onclick={doVerify}>{$copy.satohashVerifyAction}</button>
    </div>
    {#if message}
      <p class="satohash-message {messageOk ? 'ok' : 'err'}">{message}</p>
    {/if}
  </div>
</div>

<style>
  .satohash-card { border: 1px solid var(--line); border-radius: 13px; background: var(--paper); box-shadow: var(--shadow-card); overflow: hidden; }
  .satohash-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 16px 24px; border-bottom: 1px solid var(--line); }
  .satohash-title { color: var(--ink); font-size: 16px; font-weight: 800; letter-spacing: -.4px; }
  .satohash-pill { display: inline-flex; align-items: center; gap: 5px; padding: 4px 9px; border-radius: 999px; font-family: 'DM Mono', monospace; font-size: 9px; font-weight: 700; }
  .satohash-pill.online { color: #2da379; background: #edf9f4; }
  .satohash-pill.offline { color: #b48332; background: #fff8e9; }
  .satohash-pill.checking { color: var(--faint); background: var(--surface-3); }
  .satohash-body { padding: 20px 24px 24px; }
  .satohash-label { display: block; margin-bottom: 8px; color: var(--muted); font-size: 11px; font-weight: 700; }
  .satohash-row { display: flex; flex-wrap: wrap; gap: 8px; }
  .satohash-row input { min-width: 0; flex: 1 1 240px; height: 40px; padding: 0 12px; border: 1px solid var(--line); border-radius: 9px; outline: 0; color: var(--ink); background: var(--canvas); font-family: 'DM Mono', monospace; font-size: 11px; }
  .satohash-row input:focus { border-color: #06b6d4; }
  .satohash-action { height: 40px; padding: 0 16px; border-radius: 9px; color: #fff; background: #0891b2; font-size: 11px; font-weight: 800; }
  .satohash-action:hover { background: #0e7490; }
  .satohash-action.secondary { color: var(--muted); background: var(--surface-3); }
  .satohash-action.secondary:hover { color: var(--ink); }
  .satohash-message { margin: 12px 0 0; font-size: 11px; line-height: 1.5; }
  .satohash-message.ok { color: #2da379; }
  .satohash-message.err { color: #cb5a61; }
</style>
