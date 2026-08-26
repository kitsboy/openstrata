<script lang="ts">
  /** Scan to pay (#3/#14) — renders the payment QR for a Lightning invoice or
   *  on-chain address and offers wallet deep links (lightning://, bitcoin:).
   *  Pure client-side: `qrcode` renders to an inline SVG, so no network call. */
  import { onMount } from 'svelte';
  import { copy } from '$lib/i18n';
  import Icon from './Icon.svelte';
  import QRCode from 'qrcode';

  let {
    payload = '',
    rail = 'lightning'
  }: { payload?: string; rail?: 'lightning' | 'onchain' | 'liquid' } = $props();

  let svg = $state('');
  let copied = $state(false);

  const walletLink = $derived(
    rail === 'onchain'
      ? payload.startsWith('bitcoin:') ? payload : `bitcoin:${payload}`
      : rail === 'lightning' && payload.startsWith('lnurl') || payload.startsWith('lnbc')
        ? `lightning:${payload.replace(/^lightning:/, '')}`
        : payload
  );

  onMount(async () => {
    try {
      svg = await QRCode.toString(payload || 'openstrata://scan', {
        type: 'svg',
        margin: 1,
        width: 160,
        errorCorrectionLevel: 'M'
      });
    } catch {
      svg = '';
    }
  });

  async function copyPayload() {
    if (!payload) return;
    try {
      await navigator.clipboard.writeText(payload);
      copied = true;
      setTimeout(() => (copied = false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  }
</script>

<div class="flex flex-col items-center gap-3">
  <div class="rounded-2xl border border-border bg-white p-3 shadow-sm">
    {#if svg}
      {@html svg}
    {:else}
      <div class="h-40 w-40 animate-pulse rounded-lg bg-slate-100"></div>
    {/if}
  </div>
  <div class="flex w-full flex-wrap items-center justify-center gap-2">
    {#if walletLink && walletLink !== payload}
      <a class="flex items-center gap-1.5 rounded-lg bg-bitcoin px-3 py-1.5 text-xs font-bold text-white no-underline" href={walletLink}><Icon name="lightning" class="h-3 w-3" /> {$copy.openInWallet}</a>
    {/if}
    <button class="flex items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-xs font-bold text-slate-700" onclick={copyPayload}><Icon name="file" class="h-3 w-3" /> {copied ? $copy.walletCopied : $copy.receiptCopy}</button>
  </div>
  <p class="text-[10px] font-bold uppercase tracking-wide text-slate-400">{$copy.scanToPay}</p>
</div>
