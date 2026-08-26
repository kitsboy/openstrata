<script lang="ts">
  /** Members & roles (#18): admin invites, role assignment, temp-password
   *  handoff. Uses GET/POST /auth/users — admin-only, gated by the session. */
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { copy } from '$lib/i18n';
  import { auth, listUsers, inviteUser, type PublicUser, type UserRole } from '$lib/api/auth';
  import Icon from './Icon.svelte';
  import Skeleton from './Skeleton.svelte';
  import EmptyState from './EmptyState.svelte';

  let users = $state<PublicUser[] | null>(null);
  let loading = $state(false);
  let showInvite = $state(false);
  let email = $state('');
  let displayName = $state('');
  let role = $state<'treasurer' | 'member'>('member');
  let tempPassword = $state('');
  let error = $state('');
  let inviteError = $state('');

  onMount(() => {
    const unsubscribe = auth.subscribe((session) => {
      if (session.status === 'signed-in' && session.user?.role === 'admin') {
        loading = true;
        listUsers()
          .then((u) => (users = u))
          .catch(() => { users = null; })
          .finally(() => (loading = false));
      } else {
        users = null;
      }
    });
    return unsubscribe;
  });

  const isAdmin = $derived(get(auth).user?.role === 'admin');

  async function doInvite() {
    inviteError = '';
    if (!email.trim()) {
      inviteError = $copy.nameRequired;
      return;
    }
    try {
      const res = await inviteUser({ email: email.trim(), displayName: displayName.trim() || undefined, role });
      tempPassword = res.temporaryPassword;
      users = [...(users ?? []), res.user];
      email = '';
      displayName = '';
      showInvite = false;
    } catch (err) {
      inviteError = err instanceof Error ? err.message : 'Request failed';
    }
  }

  const roleTone = (r: UserRole) =>
    r === 'admin' ? 'bg-danger/10 text-danger' :
    r === 'treasurer' ? 'bg-brand-600/10 text-brand-700' :
    'bg-surface-3 text-slate-500';
</script>

{#if isAdmin}
  <section class="glass-card rounded-2xl p-6">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h3 class="font-bold text-slate-800 flex items-center gap-2">
          <Icon name="shield" class="h-4 w-4 text-brand-600" /> {$copy.managerTitle}
        </h3>
        <p class="mt-1 text-sm text-slate-500">{$copy.managerHint}</p>
      </div>
      <button class="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-bold text-white" onclick={() => (showInvite = !showInvite)}>+ {$copy.managerInvite}</button>
    </div>

    {#if showInvite}
      <div class="mt-4 grid gap-3 rounded-xl border border-border bg-surface-2 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <input bind:value={displayName} placeholder={$copy.yourName} class="rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm" />
        <input bind:value={email} placeholder={$copy.email} class="rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm" />
        <select bind:value={role} class="rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm">
          <option value="member">member</option><option value="treasurer">treasurer</option>
        </select>
        <button class="rounded-xl bg-brand-600 px-4 py-2 text-sm font-bold text-white" onclick={doInvite}>{$copy.managerInvite}</button>
        {#if inviteError}<p class="text-xs font-semibold text-danger sm:col-span-2 lg:col-span-4" role="alert">{inviteError}</p>{/if}
      </div>
    {/if}

    {#if tempPassword}
      <div class="mt-4 rounded-xl border border-brand-200 bg-brand-50 p-4">
        <p class="text-xs font-bold text-brand-700 uppercase">{$copy.managerTempPassword}</p>
        <code class="mt-1 block select-all rounded-lg bg-surface-2 px-3 py-2 font-mono text-sm text-slate-800">{tempPassword}</code>
        <p class="mt-1 text-xs text-slate-500">{$copy.authNote}</p>
      </div>
    {/if}

    <div class="mt-4">
      {#if loading}
        <div class="space-y-2"><Skeleton height="40px" /><Skeleton height="40px" /></div>
      {:else if users === null || users.length === 0}
        <EmptyState icon="shield" title={$copy.managerEmpty} />
      {:else}
        <div class="divide-y divide-border rounded-xl border border-border">
          {#each users as u}
            <div class="flex items-center gap-3 p-3">
              <span class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600/10 text-[10px] font-bold text-brand-700">
                {u.displayName.split(/\s+/).map((p) => p[0] ?? '').join('').slice(0, 2).toUpperCase()}
              </span>
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-bold text-slate-800">{u.displayName}</p>
                <p class="truncate text-xs text-slate-400">{u.email}</p>
              </div>
              <span class={`rounded-full px-2.5 py-1 text-[10px] font-bold ${roleTone(u.role)}`}>{u.role}</span>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </section>
{/if}
