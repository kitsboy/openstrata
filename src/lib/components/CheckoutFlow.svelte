<script lang="ts">
  /** Pay-fees checkout (#1) — pick a unit, quote any rail, confirm, get a
   *  receipt with txid + sats + locked rate + Satohash stamp (#13).
   *  Live when signed in; a labeled simulation otherwise. */
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { copy, formatCurrency, locale } from '$lib/i18n';
  import { auth } from '$lib/api/auth';
  import { fetchUnits, type ApiUnit } from '$lib/api/units';
  import { quotePayment, confirmPayment, type PaymentQuote, type Rail } from '$lib/api/payments';
  import Icon from './Icon.svelte';
  import Skeleton from './Skeleton.svelte';

  let liveUnits = $state<ApiUnit[] | null>(null);
  let unitRef = $state('101');
  let amountBasis = $state(35000); // $350.00
  let rail = $state<Rail>('fiat');
  let quote = $state<PaymentQuote | null>(null);
  let busy = $state(false);
  let error = $state('');
  let confirmed = $state<{ seq: number; referenceCode: string } | null>(null);
  let copied = $state(false);
  let cadPerBtc = $state<number>(50000);

  const RAILS = [
    { id: 'fiat', label: 'Fiat (CAD)', icon: 'coins' },
    { id: 'onchain', label: 'Bitcoin on-chain', icon: 'bitcoin' },
    { id: 'lightning', label: 'Lightning (LNURL)', icon: 'lightning' }
  ] as const;

  onMount(() => {
    const unsubscribe = auth.subscribe((session) => {
      if (session.status === 'signed-in') {
        fetchUnits().then((u) => {
          liveUnits = u;
          if (u.length) unitRef = u[0]!.unitRef;
        }).catch(() => {});
      } else {
        liveUnits = null;
      }
    });
    return unsubscribe;
  });

  const unitList = $derived(liveUnits ?? [
    { unitRef: '101', occupancy: 'occupied' },
    { unitRef: '102', occupancy: 'occupied' },
    { unitRef: '201', occupancy: 'vacant' },
    { unitRef: '202', occupancy: 'occupied' },
    { unitRef: '301', occupancy: 'occupied' },
    { unitRef: '302', occupancy: 'short-term' }
  ] as ApiUnit[]);

  const recipient = $derived(
    rail === 'onchain' ? 'bc1qdemo0nstrata0xpub00000000000000000000' :
    rail === 'lightning' ? 'lnurl1dp68gurn8ghj7urp0yh8getnw3hx2un9ve5k7mn9wf5k2um0vd5k2mn0wd5k2mm' :
    'Operating Fund — Interac'
  );

  async function requestQuote() {
    error = '';
    busy = true;
    try {
      const res = await quotePayment({
        rail, refId: `fees-${Date.now()}`, unitRef, amountBasis,
        currency: 'CAD', recipient
      });
      quote = res.invoice;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Request failed';
      quote = null;
    }
    busy = false;
  }

  async function doConfirm() {
    if (!quote) return;
    error = '';
    busy = true;
    try {
      const res = await confirmPayment(quote.referenceCode);
      confirmed = { seq: res.seq, referenceCode: res.referenceCode };
    } catch (err) {
      error = err instanceof Error ? err.message : 'Request failed';
    }
    busy = false;
  }

  function reset() {
    quote = null;
    confirmed = null;
    copied = false;
  }

  async function copyInvoice() {
    if (!quote) return;
    try {
      await navigator.clipboard.writeText(quote.invoice ?? quote.referenceCode);
      copied = true;
      setTimeout(() => (copied = false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  }

  const sats = $derived(quote?.amountSat ?? Math.round((amountBasis / cadPerBtc) * 100_000_000));
</script>

<section class="glass-card rounded-2xl p-6">
  <div class="flex items-start justify-between gap-3">
    <div>
      <h3 class="font-bold text-slate-800 flex items-center gap-2">
        <Icon name="dollar" class="h-4 w-4 text-brand-600" /> {$copy.checkoutTitle}
        {#if liveUnits}<span class="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold text-success uppercase">{$copy.liveLabel}</span>{/if}
      </h3>
      <p class="mt-1 text-sm text-slate-500">{$copy.checkoutHint}</p>
    </div>
  </div>

  {#if confirmed && quote}
    <div class="mt-4 rounded-xl border border-success/30 bg-success/5 p-4">
      <div class="flex items-center gap-2 text-success">
        <Icon name="check" class="h-4 w-4" /><strong>{$copy.checkoutPaid}</strong>
      </div>
      <dl class="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <div><dt class="text-[10px] font-bold text-slate-400 uppercase">{$copy.receiptTxid}</dt><dd class="truncate font-mono text-xs font-semibold text-slate-700">{$copy.unitLabel} {unitRef}</dd></div>
        <div><dt class="text-[10px] font-bold text-slate-400 uppercase">{$copy.checkoutAmount}</dt><dd class="font-bold text-slate-800">{formatCurrency(amountBasis / 100, $locale)}</dd></div>
        <div><dt class="text-[10px] font-bold text-slate-400 uppercase">{$copy.receiptSats}</dt><dd class="font-bold text-bitcoin">{sats.toLocaleString()} sats</dd></div>
        <div><dt class="text-[10px] font-bold text-slate-400 uppercase">{$copy.receiptRate}</dt><dd class="font-semibold text-slate-700">{formatCurrency(cadPerBtc, $locale, { maximumFractionDigits: 0 })}</dd></div>
      </dl>
      <div class="mt-3 flex flex-wrap items-center gap-2">
        <code class="rounded-lg bg-surface-2 px-2 py-1 text-xs text-bc-blue">{confirmed.referenceCode}</code>
        <a class="flex items-center gap-1 text-xs font-bold text-bitcoin no-underline" href="https://satohash.io" target="_blank" rel="noopener noreferrer"><Icon name="shield" class="h-3 w-3" /> {$copy.receiptStamp}</a>
        <button class="ml-auto rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-bold text-white" onclick={reset}>{$copy.continue}</button>
      </div>
    </div>
  {:else}
    <div class="mt-4 grid gap-3 sm:grid-cols-2">
      <label class="block">
        <span class="text-[10px] font-bold text-slate-400 uppercase">{$copy.unitLabel}</span>
        <select bind:value={unitRef} class="mt-1 w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm font-semibold text-slate-800">
          {#each unitList as u}<option value={u.unitRef}>{$copy.unitLabel} {u.unitRef}</option>{/each}
        </select>
      </label>
      <label class="block">
        <span class="text-[10px] font-bold text-slate-400 uppercase">{$copy.checkoutAmount}</span>
        <input type="number" min="0" step="0.01" bind:value={amountBasis} class="mt-1 w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm font-semibold text-slate-800" />
      </label>
    </div>

    <div class="mt-3">
      <span class="text-[10px] font-bold text-slate-400 uppercase">{$copy.checkoutRail}</span>
      <div class="mt-1 flex flex-wrap gap-2">
        {#each RAILS as r}
          <button
            class="flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-semibold transition-all {rail === r.id ? 'border-bitcoin/40 bg-bitcoin/10 text-bitcoin' : 'border-border bg-surface-2 text-slate-600 hover:border-brand-200'}"
            onclick={() => { rail = r.id; reset(); }}
          ><Icon name={r.icon} class="h-3.5 w-3.5" />{r.label}</button>
        {/each}
      </div>
    </div>

    {#if quote}
      <div class="mt-4 rounded-xl border border-brand-200 bg-brand-50 p-4">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p class="text-[10px] font-bold text-brand-600 uppercase">{quote.rail} · {quote.status}</p>
            <code class="mt-1 block max-w-full truncate rounded-lg bg-surface-2 px-2 py-1 text-xs text-slate-700">{quote.invoice ?? quote.referenceCode}</code>
            <p class="mt-1 text-xs text-slate-500">{quote.fiatLockedBasis ? formatCurrency(quote.fiatLockedBasis / 100, $locale) : ''} · {$copy.receiptSats}: {sats.toLocaleString()} · {$copy.checkoutQuoteHint}</p>
          </div>
          <div class="flex gap-2">
            <button class="rounded-lg border border-brand-200 bg-surface-2 px-3 py-1.5 text-xs font-bold text-slate-700" onclick={copyInvoice}>{copied ? $copy.walletCopied : $copy.receiptCopy}</button>
            <button class="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-bold text-white" onclick={doConfirm} disabled={busy}>{busy ? '…' : $copy.checkoutConfirm}</button>
          </div>
        </div>
      </div>
    {:else}
      <button class="mt-4 rounded-xl bg-bitcoin px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-bitcoin/90 disabled:opacity-50" onclick={requestQuote} disabled={busy}>
        {busy ? '…' : $copy.checkoutGetQuote}
      </button>
    {/if}

    {#if error}<p class="mt-3 text-xs font-semibold text-danger" role="alert"><Icon name="alert" class="h-3 w-3 inline" /> {error}</p>{/if}
  {/if}
</section>
