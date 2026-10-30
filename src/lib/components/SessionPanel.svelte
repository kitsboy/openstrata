<script lang="ts">
  /**
   * The caller's own signed-in devices.
   *
   * The backend has been able to list and end sessions since 0.3.29, but only
   * through `curl` — so the shared-laptop case ("sign out the one I left
   * behind") had an API and no control. This is that control: every session on
   * the account, the current one named, and one action that ends the rest while
   * keeping this device signed in.
   */
  import { onMount } from 'svelte';
  import { auth, endOtherSessions, fetchSessions, type SessionWire } from '$lib/api/auth';
  import { copy, fill, formatDate, locale } from '$lib/i18n';
  import Icon from './Icon.svelte';

  let sessions = $state<SessionWire[] | null>(null);
  let error = $state('');
  let busy = $state(false);
  let revoked = $state<number | null>(null);

  const signedIn = $derived($auth.status === 'signed-in');
  const visible = $derived((sessions ?? []).filter((s) => s.active));
  const others = $derived(visible.filter((s) => !s.current));

  async function load(): Promise<void> {
    error = '';
    try {
      sessions = await fetchSessions();
    } catch {
      sessions = null;
      error = $copy.sessionsError;
    }
  }

  onMount(() => {
    const unsubscribe = auth.subscribe((session) => {
      if (session.status === 'signed-in') {
        revoked = null;
        void load();
      } else {
        sessions = null;
        revoked = null;
        error = '';
      }
    });
    return unsubscribe;
  });

  async function signOutOthers(): Promise<void> {
    if (busy) return;
    busy = true;
    error = '';
    try {
      revoked = await endOtherSessions();
      await load();
    } catch {
      error = $copy.sessionsError;
    } finally {
      busy = false;
    }
  }

  function when(iso: string): string {
    try {
      return formatDate(iso, $locale, { dateStyle: 'medium', timeStyle: 'short' });
    } catch {
      return iso;
    }
  }
</script>

{#if signedIn}
  <section class="glass-card rounded-2xl p-6" aria-labelledby="sessions-title">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h3 id="sessions-title" class="flex items-center gap-2 font-bold text-slate-800">
          <Icon name="lock" class="h-4 w-4 text-brand-600" /> {$copy.sessionsTitle}
        </h3>
        <p class="mt-1 text-sm text-slate-500">{$copy.sessionsHint}</p>
      </div>
      <button
        type="button"
        class="rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-slate-600 transition-colors hover:bg-surface-3 disabled:cursor-not-allowed disabled:opacity-50"
        disabled={busy || others.length === 0}
        onclick={signOutOthers}
      >
        {$copy.sessionsSignOutAll}
      </button>
    </div>

    {#if error}
      <p class="mt-3 text-xs font-semibold text-danger" role="alert">{error}</p>
    {/if}
    {#if revoked !== null}
      <p class="mt-3 text-xs font-semibold text-success" role="status">
        {fill($copy.sessionsRevoked, { count: revoked })}
      </p>
    {/if}

    {#if sessions === null}
      <p class="mt-4 text-sm text-slate-400" role="status">{$copy.sessionsLoading}</p>
    {:else if visible.length === 0}
      <p class="mt-4 text-sm text-slate-500">{$copy.sessionsEmpty}</p>
    {:else}
      <ul class="mt-4 space-y-2">
        {#each visible as session (session.id)}
          <li class="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl border border-border bg-surface-2 p-3 text-sm">
            <span class="font-semibold text-slate-700">{session.role}</span>
            {#if session.current}
              <span class="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold uppercase text-success">
                {$copy.sessionsCurrent}
              </span>
            {/if}
            <span class="text-xs text-slate-500">{$copy.sessionsStarted}: {when(session.createdAt)}</span>
            <span class="text-xs text-slate-500">{$copy.sessionsLastUsed}: {when(session.lastSeenAt)}</span>
          </li>
        {/each}
      </ul>
      <p class="mt-3 text-xs text-slate-500">{$copy.sessionsSignOutAllNote}</p>
    {/if}
  </section>
{/if}
