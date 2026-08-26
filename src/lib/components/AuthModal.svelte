<script lang="ts">
  /**
   * Sign-in / create-account modal for the live backend wiring.
   *
   * Tabs switch between `POST /auth/login` and `POST /auth/register` (open
   * signup: register creates a council + its first admin). On success the
   * `auth` store flips to `signed-in` and the parent closes the modal — the
   * dashboard widgets pick up live data automatically.
   */
  import { signIn, signUp } from '$lib/api/auth';
  import { ApiError, ApiUnavailableError } from '$lib/api/client';
  import { copy } from '$lib/i18n';

  let { close }: { close: () => void } = $props();

  let mode = $state<'signin' | 'signup'>('signin');
  let councilName = $state('');
  let displayName = $state('');
  let email = $state('');
  let password = $state('');
  let busy = $state(false);
  let error = $state('');

  function friendlyMessage(err: unknown): string {
    if (err instanceof ApiUnavailableError) return $copy.authUnavailable;
    if (err instanceof ApiError) {
      // Backend sends human reasons for 400/401/409 (e.g. invalid email,
      // invalid credentials, email already registered).
      if (err.reason) return err.reason;
      return $copy.authError;
    }
    return $copy.authError;
  }

  async function submit() {
    if (busy) return;
    error = '';
    if (mode === 'signup' && !councilName.trim()) {
      error = $copy.nameRequired;
      return;
    }
    busy = true;
    try {
      if (mode === 'signin') {
        await signIn(email, password);
      } else {
        await signUp({
          councilName: councilName.trim(),
          email,
          password,
          displayName: displayName.trim() || undefined
        });
      }
      // The auth store now reports signed-in — the parent closes this modal.
    } catch (err) {
      error = friendlyMessage(err);
    } finally {
      busy = false;
    }
  }
</script>

<div class="modal-backdrop" role="presentation" onclick={(event) => event.target === event.currentTarget && close()}>
  <dialog open class="modal auth-modal" aria-labelledby="auth-modal-title">
    <button class="modal-close" aria-label={$copy.closeDialog} onclick={() => close()}>×</button>
    <div class="modal-icon">◈</div>
    <div class="eyebrow">{mode === 'signin' ? $copy.signIn : $copy.createAccount}</div>
    <h2 id="auth-modal-title">{mode === 'signin' ? $copy.authSignInTitle : $copy.authCreateTitle}</h2>
    <p>{$copy.authIntro}</p>

    <div class="auth-tabs" role="tablist" aria-label="{$copy.signIn}">
      <button class:active={mode === 'signin'} role="tab" aria-selected={mode === 'signin'} onclick={() => { mode = 'signin'; error = ''; }}>{$copy.signIn}</button>
      <button class:active={mode === 'signup'} role="tab" aria-selected={mode === 'signup'} onclick={() => { mode = 'signup'; error = ''; }}>{$copy.createAccount}</button>
    </div>

    {#if mode === 'signup'}
      <label>{$copy.communityName}<input bind:value={councilName} placeholder={$copy.communityNamePlaceholder} oninput={() => (error = '')} /></label>
      <label>{$copy.yourName}<input bind:value={displayName} placeholder={$copy.yourName} oninput={() => (error = '')} /></label>
    {/if}
    <label>{$copy.email}<input type="email" bind:value={email} autocomplete="email" oninput={() => (error = '')} /></label>
    <label>{$copy.password}<input type="password" bind:value={password} autocomplete={mode === 'signin' ? 'current-password' : 'new-password'} onkeydown={(event) => event.key === 'Enter' && submit()} oninput={() => (error = '')} /></label>

    {#if error}<p class="auth-error" role="alert">{error}</p>{/if}

    <div class="modal-actions">
      <button class="secondary-button" onclick={() => close()}>{$copy.cancel}</button>
      <button class="primary-button" disabled={busy} onclick={submit}>
        {busy ? '…' : mode === 'signin' ? $copy.signIn : $copy.createWorkspace} <span>→</span>
      </button>
    </div>
    <small>{$copy.authNote}</small>
  </dialog>
</div>

<style>
  .auth-modal {
    max-width: 420px;
  }
  .auth-tabs {
    display: flex;
    gap: 8px;
    margin: 18px 0 4px;
  }
  .auth-tabs button {
    flex: 1;
    padding: 9px 12px;
    border-radius: 8px;
    border: 1px solid transparent;
    background: transparent;
    color: var(--color-slate-500, #64748b);
    font-weight: 600;
    cursor: pointer;
  }
  .auth-tabs button.active {
    background: var(--color-brand-50, #eef2ff);
    color: var(--color-brand-700, #4338ca);
    border-color: var(--color-brand-200, #c7d2fe);
  }
  .auth-error {
    color: #b91c1c;
    font-size: 0.875rem;
    margin: 8px 0 0;
  }
  :global(.auth-modal) input {
    width: 100%;
  }
</style>
