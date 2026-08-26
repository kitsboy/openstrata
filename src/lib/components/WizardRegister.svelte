<script lang="ts">
  /** Register your building (#2) — a guided 3-step onboarding that creates a
   *  council + first admin via `POST /auth/register` when a host is reachable.
   *  Demo mode walks the same steps and explains what the live flow will do. */
  import { copy } from '$lib/i18n';
  import { signUp } from '$lib/api/auth';
  import { ApiError, ApiUnavailableError } from '$lib/api/client';
  import Icon from './Icon.svelte';

  let step = $state(0);
  let councilName = $state('');
  let address = $state('');
  let units = $state('12');
  let displayName = $state('');
  let email = $state('');
  let password = $state('');
  let busy = $state(false);
  let error = $state('');
  let done = $state(false);

  const STEPS: Array<{ icon: 'building' | 'chart' | 'lock'; title: string; hint: string }> = [
    { icon: 'building', title: 'Name & address', hint: 'Your building, your way.' },
    { icon: 'chart', title: 'Scale', hint: 'How many strata lots?' },
    { icon: 'lock', title: 'Account', hint: 'Creates your council admin.' }
  ];

  const canAdvance = $derived(
    (step === 0 && councilName.trim().length > 0) ||
    (step === 1 && Number(units) > 0) ||
    (step === 2 && email.includes('@') && password.length >= 8)
  );

  async function finish() {
    if (busy) return;
    error = '';
    busy = true;
    try {
      await signUp({
        councilName: councilName.trim(),
        email,
        password,
        displayName: displayName.trim() || undefined
      });
      done = true;
    } catch (err) {
      if (err instanceof ApiUnavailableError) {
        error = $copy.authUnavailable;
      } else if (err instanceof ApiError && err.reason) {
        error = err.reason;
      } else {
        error = $copy.authError;
      }
    }
    busy = false;
  }
</script>

<section class="glass-card rounded-2xl p-6">
  <div class="flex items-start justify-between gap-3">
    <div>
      <h3 class="font-bold text-slate-800 flex items-center gap-2">
        <Icon name="building" class="h-4 w-4 text-brand-600" /> {$copy.wizardRegister}
      </h3>
      <p class="mt-1 text-sm text-slate-500">{$copy.wizardIntro}</p>
    </div>
  </div>

  {#if done}
    <div class="mt-4 rounded-xl border border-success/30 bg-success/5 p-4">
      <div class="flex items-center gap-2 text-success">
        <Icon name="check" class="h-4 w-4" /><strong>{$copy.wizardRegistered}</strong>
      </div>
      <p class="mt-2 text-sm text-slate-600">{$copy.authNote}</p>
      <button class="mt-3 rounded-lg bg-brand-600 px-4 py-2 text-xs font-bold text-white" onclick={() => { done = false; step = 0; councilName = ''; address = ''; units = '12'; displayName = ''; email = ''; password = ''; }}>
        {$copy.startNew}
      </button>
    </div>
  {:else}
    <ol class="mt-4 flex gap-2">
      {#each STEPS as s, i}
        <li class="flex flex-1 flex-col gap-1">
          <div class="h-1 rounded-full {i <= step ? 'bg-brand-600' : 'bg-slate-200'}"></div>
          <span class="text-[9px] font-bold uppercase tracking-wide {i === step ? 'text-brand-700' : 'text-slate-400'}">
            <Icon name={s.icon} class="h-3 w-3 inline" /> {s.title}
          </span>
        </li>
      {/each}
    </ol>

    <div class="mt-4">
      {#if step === 0}
        <label class="block">
          <span class="text-[10px] font-bold text-slate-400 uppercase">{$copy.communityName}</span>
          <input bind:value={councilName} placeholder={$copy.communityNamePlaceholder} class="mt-1 w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm text-slate-800 focus:border-brand-300 focus:outline-none" oninput={() => (error = '')} />
        </label>
        <label class="mt-3 block">
          <span class="text-[10px] font-bold text-slate-400 uppercase">{$copy.buildingAddress}</span>
          <input bind:value={address} placeholder={$copy.addressPlaceholder} class="mt-1 w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm text-slate-800 focus:border-brand-300 focus:outline-none" />
        </label>
      {:else if step === 1}
        <label class="block">
          <span class="text-[10px] font-bold text-slate-400 uppercase">{$copy.numberOfUnits}</span>
          <input type="number" min="1" bind:value={units} class="mt-1 w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm text-slate-800 focus:border-brand-300 focus:outline-none" />
        </label>
        <p class="mt-2 text-xs text-slate-500">{$copy.wizardIntro}</p>
      {:else}
        <label class="block">
          <span class="text-[10px] font-bold text-slate-400 uppercase">{$copy.yourName}</span>
          <input bind:value={displayName} placeholder={$copy.yourName} class="mt-1 w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm text-slate-800 focus:border-brand-300 focus:outline-none" />
        </label>
        <label class="mt-3 block">
          <span class="text-[10px] font-bold text-slate-400 uppercase">{$copy.email}</span>
          <input type="email" bind:value={email} autocomplete="email" class="mt-1 w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm text-slate-800 focus:border-brand-300 focus:outline-none" oninput={() => (error = '')} />
        </label>
        <label class="mt-3 block">
          <span class="text-[10px] font-bold text-slate-400 uppercase">{$copy.password}</span>
          <input type="password" bind:value={password} autocomplete="new-password" class="mt-1 w-full rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm text-slate-800 focus:border-brand-300 focus:outline-none" oninput={() => (error = '')} onkeydown={(e) => e.key === 'Enter' && canAdvance && finish()} />
        </label>
      {/if}
    </div>

    {#if error}<p class="mt-3 text-xs font-semibold text-danger" role="alert"><Icon name="alert" class="h-3 w-3 inline" /> {error}</p>{/if}

    <div class="mt-4 flex items-center justify-between gap-2">
      <button class="rounded-lg px-3 py-2 text-xs font-bold text-slate-500" onclick={() => (step = Math.max(0, step - 1))} disabled={step === 0}>{$copy.back}</button>
      {#if step < 2}
        <button class="rounded-lg bg-brand-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-40" onclick={() => (step = step + 1)} disabled={!canAdvance}>{$copy.continue}</button>
      {:else}
        <button class="rounded-lg bg-brand-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-40" onclick={finish} disabled={!canAdvance || busy}>{busy ? '…' : $copy.createWorkspace}</button>
      {/if}
    </div>
  {/if}
</section>
