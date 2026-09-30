<script lang="ts">
  /**
   * Evidence + export (items #9/#11/#20). The export endpoints require the
   * Bearer token, so plain links won't work — this fetches with the session
   * token and hands the result to the browser: CRT evidence opens as a
   * print-ready document (browser → PDF), the portable bundle downloads as
   * JSON, and Form B/F open for the first unit.
   */
  import { copy } from '$lib/i18n';
  import { auth } from '$lib/api/auth';
  import { apiBaseUrl } from '$lib/api/config';
  import { getToken } from '$lib/api/token';
  import { onMount } from 'svelte';

  let live = $state(false);
  let error = $state('');

  onMount(() => {
    const unsubscribe = auth.subscribe((session) => {
      live = session.status === 'signed-in';
    });
    return unsubscribe;
  });

  async function openHtml(path: string) {
    error = '';
    const base = apiBaseUrl();
    const token = getToken();
    if (!base || !token) return;
    try {
      const res = await fetch(`${base}${path}`, { headers: { authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();
      const win = window.open('', '_blank');
      if (!win) throw new Error('popup blocked');
      win.document.write(html);
      win.document.close();
    } catch (err) {
      error = err instanceof Error ? err.message : $copy.authError;
    }
  }

  async function downloadJson(path: string) {
    error = '';
    const base = apiBaseUrl();
    const token = getToken();
    if (!base || !token) return;
    try {
      const res = await fetch(`${base}${path}`, { headers: { authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `openstrata-portable-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      error = err instanceof Error ? err.message : $copy.authError;
    }
  }
</script>

<section class="glass-card rounded-2xl p-6">
  <div class="flex items-center justify-between mb-4">
    <h3 class="text-lg font-bold text-slate-800">📦 {$copy.evidenceTitle}</h3>
    {#if live}
      <span class="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold text-success uppercase">{$copy.liveLabel}</span>
    {/if}
  </div>
  <p class="text-sm text-slate-500">{$copy.evidenceIntro}</p>

  <div class="mt-4 flex flex-wrap gap-2">
    <button class="rounded-xl border border-border bg-surface-2 px-3 py-2 text-xs font-semibold text-slate-700 disabled:opacity-50" disabled={!live} onclick={() => openHtml('/api/v1/compliance/crt-export?fund=operating')}>{$copy.crtExport}</button>
    <button class="rounded-xl border border-border bg-surface-2 px-3 py-2 text-xs font-semibold text-slate-700 disabled:opacity-50" disabled={!live} onclick={() => openHtml('/api/v1/forms/b/101')}>{$copy.formBPrint}</button>
    <button class="rounded-xl border border-border bg-surface-2 px-3 py-2 text-xs font-semibold text-slate-700 disabled:opacity-50" disabled={!live} onclick={() => openHtml('/api/v1/forms/f/101')}>{$copy.formFPrint}</button>
    <button class="rounded-xl bg-brand-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50" disabled={!live} onclick={() => downloadJson('/api/v1/export/portable')}>{$copy.portableExport}</button>
  </div>

  {#if !live}
    <p class="mt-3 rounded-xl bg-surface-3 px-4 py-3 text-xs text-slate-500">{$copy.evidenceDemo}</p>
  {/if}
  {#if error}<p class="mt-3 text-sm text-danger" role="alert">{error}</p>{/if}
</section>
