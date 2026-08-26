<script lang="ts">
  /**
   * Sign-in / create-account modal — rebuilt as an inviting split-panel flow.
   *
   * Layout: brand panel (illustration + trust points) beside the form on
   * desktop; a compact brand header above the form on mobile.
   *
   * Flow:
   *  - Sign-in is one polished step (email + password with show/hide).
   *  - Create-workspace is a guided 2-step wizard: building & you, then
   *    credentials with a live password-strength meter and per-field errors.
   *  - Success shows a brief welcome moment before the parent closes.
   *  - "Just exploring?" closes straight back into the live demo.
   *
   * On success the `auth` store flips to `signed-in`; the parent's widgets
   * pick up live data automatically.
   */
  import { onMount } from 'svelte';
  import { signIn, signUp } from '$lib/api/auth';
  import { ApiError, ApiUnavailableError } from '$lib/api/client';
  import { copy } from '$lib/i18n';
  import { passwordStrength, passwordMeetsMinimum, isEmailLike } from '$lib/auth-strength';
  import Icon from './Icon.svelte';
  import Illustrations from './Illustrations.svelte';

  let { close }: { close: () => void } = $props();

  let mode = $state<'signin' | 'signup'>('signin');
  let step = $state(0); // signup wizard step
  let councilName = $state('');
  let displayName = $state('');
  let email = $state('');
  let password = $state('');
  let showPassword = $state(false);
  let busy = $state(false);
  let error = $state('');
  let fieldErrors = $state<{ email?: string; password?: string; councilName?: string }>({});
  let success = $state<{ name: string } | null>(null);
  let closeTimer: ReturnType<typeof setTimeout> | null = null;

  onMount(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) close();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      if (closeTimer) clearTimeout(closeTimer);
    };
  });

  // ---- Password strength (client-side, honest) -----------------------------
  const strength = $derived(passwordStrength(password));

  const strengthLabel = $derived(
    strength === 0 ? '' : strength === 1 ? $copy.authStrengthWeak : strength === 2 ? $copy.authStrengthOk : $copy.authStrengthStrong
  );
  const strengthColor = $derived(
    strength === 0 ? '' : strength === 1 ? 'bg-danger' : strength === 2 ? 'bg-amber-400' : 'bg-success'
  );

  function validateField(): boolean {
    const errs: typeof fieldErrors = {};
    if (mode === 'signup') {
      if (step === 0) {
        if (!councilName.trim()) errs.councilName = $copy.nameRequired;
      } else {
        if (!isEmailLike(email)) errs.email = $copy.authEmailInvalid;
        if (!passwordMeetsMinimum(password)) errs.password = $copy.authPasswordHint;
      }
    } else {
      if (!isEmailLike(email)) errs.email = $copy.authEmailInvalid;
      if (!password) errs.password = $copy.authPasswordHint;
    }
    fieldErrors = errs;
    return Object.keys(errs).length === 0;
  }

  function nextStep() {
    if (busy) return;
    if (validateField()) {
      error = '';
      step = 1;
    }
  }

  function friendlyMessage(err: unknown): string {
    if (err instanceof ApiUnavailableError) return $copy.authUnavailable;
    if (err instanceof ApiError) {
      if (err.reason) return err.reason;
      return $copy.authError;
    }
    return $copy.authError;
  }

  async function submit() {
    if (busy) return;
    if (mode === 'signup' && step === 0) return nextStep();
    if (!validateField()) return;
    error = '';
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
      // Brief welcome moment, then the parent closes the modal.
      success = { name: displayName.trim() || councilName.trim() || email.split('@')[0]! };
      closeTimer = setTimeout(() => close(), 1500);
    } catch (err) {
      error = friendlyMessage(err);
    } finally {
      busy = false;
    }
  }

  function switchMode(next: 'signin' | 'signup') {
    if (busy) return;
    mode = next;
    step = 0;
    error = '';
    fieldErrors = {};
    showPassword = false;
  }

  function exploreDemo() {
    if (!busy) close();
  }
</script>

<div class="modal-backdrop auth-backdrop" role="presentation" onclick={(event) => event.target === event.currentTarget && !busy && close()}>
  <dialog open class="auth-shell" aria-labelledby="auth-title" aria-modal="true">
    <button class="auth-close" aria-label={$copy.closeDialog} onclick={exploreDemo}><Icon name="close" class="h-3.5 w-3.5" /></button>

    {#if success}
      <!-- Success moment -->
      <div class="auth-success" role="status">
        <span class="auth-success-mark"><Icon name="check" class="h-6 w-6" /></span>
        <p class="eyebrow">{$copy.authWelcomeBack}</p>
        <h2 id="auth-title">{$copy.welcomeBackTitle}, {success.name} 👋</h2>
        <p>{mode === 'signin' ? $copy.authWelcomeBackText : $copy.authCreatedText}</p>
        <span class="auth-spinner-inline" aria-hidden="true"></span>
        <p class="auth-success-note">{$copy.authLoadingWorkspace}</p>
      </div>
    {:else}
      <div class="auth-split">
        <!-- Brand panel (desktop) -->
        <aside class="auth-brand" aria-hidden="true">
          <div class="auth-brand-lockup">
            <div class="brand-mark auth-brand-mark" aria-hidden="true"><span></span><span></span><span></span></div>
            <div>
              <div class="brand-name">open<span>strata</span></div>
              <div class="brand-subtitle">community operations</div>
            </div>
          </div>
          <Illustrations scene="building" class="auth-brand-art h-28 w-28" />
          <p class="auth-brand-title">{$copy.footerTag}</p>
          <ul class="auth-trust">
            <li><Icon name="shield" class="h-3.5 w-3.5" /><span><strong>{$copy.authTrustChain}</strong><small>{$copy.authTrustChainText}</small></span></li>
            <li><Icon name="lightning" class="h-3.5 w-3.5" /><span><strong>{$copy.authTrustRails}</strong><small>{$copy.authTrustRailsText}</small></span></li>
            <li><Icon name="scale" class="h-3.5 w-3.5" /><span><strong>{$copy.authTrustCompliance}</strong><small>{$copy.authTrustComplianceText}</small></span></li>
          </ul>
          <p class="auth-brand-note"><Icon name="lock" class="h-3 w-3" /> {$copy.authSecureNote}</p>
        </aside>

        <!-- Form panel -->
        <div class="auth-form">
          <p class="eyebrow">{mode === 'signin' ? $copy.signIn : $copy.createAccount}</p>
          <h2 id="auth-title">{mode === 'signin' ? $copy.authWelcomeBack : $copy.authCreateHeading}</h2>
          <p class="auth-sub">{mode === 'signin' ? $copy.authSignInTitle : $copy.authCreateTitle}</p>

          <!-- Mode toggle -->
          <div class="auth-toggle" role="tablist" aria-label={$copy.profile}>
            <button class:active={mode === 'signin'} role="tab" aria-selected={mode === 'signin'} onclick={() => switchMode('signin')}>{$copy.signIn}</button>
            <button class:active={mode === 'signup'} role="tab" aria-selected={mode === 'signup'} onclick={() => switchMode('signup')}>{$copy.createAccount}</button>
          </div>

          {#if mode === 'signup'}
            <!-- Wizard steps -->
            <ol class="auth-steps" aria-hidden="true">
              <li class:active={step === 0} class:done={step > 0}><span>1</span>{$copy.authStepBuilding}</li>
              <li class:active={step === 1}><span>2</span>{$copy.authStepAccount}</li>
            </ol>
          {/if}

          {#if error}
            <p class="auth-error" role="alert"><Icon name="alert" class="h-3 w-3" /> {error}</p>
          {/if}

          {#if mode === 'signin'}
            <label class="auth-field" for="auth-email">
              <span>{$copy.email}</span>
              <input id="auth-email" type="email" bind:value={email} autocomplete="email" class:input-invalid={!!fieldErrors.email} oninput={() => { error = ''; fieldErrors.email = undefined; }} onkeydown={(e) => e.key === 'Enter' && submit()} />
              {#if fieldErrors.email}<small class="auth-field-error">{fieldErrors.email}</small>{/if}
            </label>

            <label class="auth-field" for="auth-password">
              <span>{$copy.password}</span>
              <div class="auth-password-wrap">
                <input id="auth-password" type={showPassword ? 'text' : 'password'} bind:value={password} autocomplete="current-password" class:input-invalid={!!fieldErrors.password} oninput={() => { error = ''; fieldErrors.password = undefined; }} onkeydown={(e) => e.key === 'Enter' && submit()} />
                <button type="button" class="auth-eye" aria-label={showPassword ? $copy.authHidePassword : $copy.authShowPassword} onclick={() => (showPassword = !showPassword)}><Icon name={showPassword ? 'eye-off' : 'eye'} class="h-3.5 w-3.5" /></button>
              </div>
              {#if fieldErrors.password}<small class="auth-field-error">{fieldErrors.password}</small>{/if}
            </label>
          {:else if step === 0}
            <label class="auth-field" for="auth-council">
              <span>{$copy.communityName}</span>
              <input id="auth-council" bind:value={councilName} placeholder={$copy.communityNamePlaceholder} class:input-invalid={!!fieldErrors.councilName} oninput={() => { error = ''; fieldErrors.councilName = undefined; }} />
              {#if fieldErrors.councilName}<small class="auth-field-error">{fieldErrors.councilName}</small>{/if}
            </label>
            <label class="auth-field" for="auth-name">
              <span>{$copy.yourName}</span>
              <input id="auth-name" bind:value={displayName} placeholder={$copy.yourName} oninput={() => (error = '')} />
            </label>
          {:else}
            <label class="auth-field" for="auth-email2">
              <span>{$copy.email}</span>
              <input id="auth-email2" type="email" bind:value={email} autocomplete="email" class:input-invalid={!!fieldErrors.email} oninput={() => { error = ''; fieldErrors.email = undefined; }} onkeydown={(e) => e.key === 'Enter' && submit()} />
              {#if fieldErrors.email}<small class="auth-field-error">{fieldErrors.email}</small>{/if}
            </label>
            <label class="auth-field" for="auth-password2">
              <span>{$copy.password}</span>
              <div class="auth-password-wrap">
                <input id="auth-password2" type={showPassword ? 'text' : 'password'} bind:value={password} autocomplete="new-password" class:input-invalid={!!fieldErrors.password} oninput={() => { error = ''; fieldErrors.password = undefined; }} onkeydown={(e) => e.key === 'Enter' && submit()} />
                <button type="button" class="auth-eye" aria-label={showPassword ? $copy.authHidePassword : $copy.authShowPassword} onclick={() => (showPassword = !showPassword)}><Icon name={showPassword ? 'eye-off' : 'eye'} class="h-3.5 w-3.5" /></button>
              </div>
              {#if password.length > 0 && password.length < 8}
                <small class="auth-strength-hint"><Icon name="clock" class="h-3 w-3" /> {$copy.authPasswordHint}</small>
              {/if}
              {#if fieldErrors.password}<small class="auth-field-error">{fieldErrors.password}</small>{/if}
            </label>
            {#if password.length > 0}
              <div class="auth-strength" aria-hidden="true">
                <span class="auth-strength-bars">
                  <i class={strength >= 1 ? strengthColor : ''}></i>
                  <i class={strength >= 2 ? strengthColor : ''}></i>
                  <i class={strength >= 3 ? strengthColor : ''}></i>
                </span>
                {#if strengthLabel}<span class="auth-strength-label" class:weak={strength === 1} class:ok={strength === 2} class:strong={strength === 3}>{strengthLabel}</span>{/if}
              </div>
            {/if}
          {/if}

          <div class="auth-actions">
            {#if mode === 'signup' && step === 1}
              <button type="button" class="auth-back" onclick={() => { step = 0; fieldErrors = {}; }} disabled={busy}>{$copy.authBack}</button>
            {:else if mode === 'signup'}
              <span></span>
            {/if}
            <button class="auth-submit" disabled={busy || (mode === 'signin' && (!email.trim() || !password))} onclick={submit}>
              {#if busy}
                <span class="auth-spinner" aria-hidden="true"></span>
                {mode === 'signin' ? $copy.authSigningIn : $copy.authCreating}
              {:else}
                {mode === 'signin' ? $copy.signIn : step === 0 ? $copy.authContinue : $copy.createWorkspace}
                <Icon name="arrow-up-right" class="h-3.5 w-3.5" />
              {/if}
            </button>
          </div>

          <button type="button" class="auth-demo" onclick={exploreDemo}><Icon name="spark" class="h-3 w-3" /> {$copy.authDemoBrowse}</button>
          <small class="auth-note">{mode === 'signup' ? $copy.authNote : $copy.authSecureNote}</small>
        </div>
      </div>
    {/if}
  </dialog>
</div>

<style>
  .auth-backdrop {
    z-index: 70;
  }
  .auth-shell {
    position: relative;
    width: min(100%, 880px);
    max-height: min(92vh, 640px);
    overflow: auto;
    border: 1px solid var(--line);
    border-radius: 20px;
    background: var(--paper, #fff);
    box-shadow: 0 40px 120px rgba(10, 27, 36, .3);
  }
  .auth-close {
    position: absolute;
    top: 14px;
    right: 14px;
    z-index: 2;
    display: grid;
    place-items: center;
    width: 30px;
    height: 30px;
    border-radius: 9px;
    color: var(--muted, #64748b);
    background: var(--surface-3, #eef2f2);
  }
  .auth-close:hover { color: var(--ink, #18232b); }

  /* Split layout */
  .auth-split { display: grid; grid-template-columns: 1fr 1.15fr; min-height: 520px; }
  .auth-brand {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
    padding: 34px 30px;
    border-radius: 20px 0 0 20px;
    color: #eaf3f5;
    background:
      radial-gradient(120% 90% at 0% 0%, rgba(8, 145, 178, .35), transparent 55%),
      radial-gradient(120% 100% at 100% 100%, rgba(249, 115, 72, .22), transparent 55%),
      linear-gradient(165deg, #0d2b38, #123b4c);
  }
  .auth-brand-lockup { display: flex; align-items: center; gap: 10px; }
  .auth-brand-lockup .brand-name { color: #fff; }
  .auth-brand-mark { background: var(--orange); box-shadow: 0 6px 18px rgba(249, 115, 72, .28); }
  .auth-brand-art { color: rgba(234, 243, 245, .85); margin: 6px 0 2px; }
  .auth-brand-title { margin: 0; font-size: 15px; font-weight: 800; line-height: 1.45; letter-spacing: -.2px; color: #fff; }
  .auth-trust { display: flex; flex-direction: column; gap: 13px; margin: 4px 0 0; padding: 0; list-style: none; }
  .auth-trust li { display: flex; gap: 10px; align-items: flex-start; color: #b9d2da; }
  .auth-trust li > :global(.inline-flex) { margin-top: 2px; color: #4fd1c5; }
  .auth-trust span { display: flex; flex-direction: column; gap: 1px; }
  .auth-trust strong { font-size: 11px; color: #eaf3f5; }
  .auth-trust small { font-size: 10px; line-height: 1.5; color: #8fb2bd; }
  .auth-brand-note { display: flex; align-items: center; gap: 6px; margin-top: auto; padding-top: 10px; font-size: 10px; color: #7fa3ae; }
  .auth-brand-note :global(.inline-flex) { color: #4fd1c5; }

  /* Form panel */
  .auth-form { padding: 38px 36px 30px; }
  .auth-form .eyebrow { margin-bottom: 4px; }
  .auth-form h2 { margin: 0 0 4px; font-size: 25px; font-weight: 800; letter-spacing: -.8px; color: var(--ink, #18232b); }
  .auth-sub { margin: 0 0 20px; font-size: 12px; line-height: 1.55; color: var(--muted, #64748b); }

  .auth-toggle {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4px;
    margin-bottom: 22px;
    padding: 4px;
    border-radius: 12px;
    background: var(--surface-3, #eef2f2);
  }
  .auth-toggle button {
    padding: 9px 10px;
    border-radius: 9px;
    font-size: 11px;
    font-weight: 800;
    color: var(--muted, #64748b);
    transition: all .18s ease;
  }
  .auth-toggle button.active {
    color: var(--ink, #18232b);
    background: var(--paper, #fff);
    box-shadow: 0 2px 8px rgba(10, 27, 36, .1);
  }

  .auth-steps { display: flex; gap: 18px; margin: 0 0 18px; padding: 0; list-style: none; }
  .auth-steps li { display: flex; align-items: center; gap: 7px; font-size: 10px; font-weight: 800; color: #a3aeb2; }
  .auth-steps li span {
    display: grid; place-items: center; width: 20px; height: 20px;
    border-radius: 50%; font-size: 10px; color: #8d9ba1; background: var(--surface-3, #eef2f2);
  }
  .auth-steps li.active { color: var(--ink, #18232b); }
  .auth-steps li.active span { color: #fff; background: var(--orange); }
  .auth-steps li.done span { color: #fff; background: var(--green); }

  .auth-field { display: block; margin-top: 14px; }
  .auth-field > span { display: block; margin-bottom: 6px; font-size: 10px; font-weight: 800; color: #728188; }
  .auth-field input {
    width: 100%; height: 44px; padding: 0 13px;
    border: 1px solid var(--line); border-radius: 10px; outline: 0;
    color: var(--ink, #18232b); background: var(--canvas, #f6f8f9);
    font-size: 13px; transition: border-color .18s ease, box-shadow .18s ease;
  }
  .auth-field input:focus { border-color: var(--orange); box-shadow: 0 0 0 3px rgba(249, 115, 72, .14); }
  .auth-field input.input-invalid { border-color: var(--red, #e86b72); }
  .auth-password-wrap { position: relative; }
  .auth-password-wrap input { padding-right: 42px; }
  .auth-eye {
    position: absolute; top: 50%; right: 8px; transform: translateY(-50%);
    display: grid; place-items: center; width: 30px; height: 30px;
    border-radius: 8px; color: #8d9ba1;
  }
  .auth-eye:hover { color: var(--ink, #18232b); background: var(--surface-3, #eef2f2); }
  .auth-field-error { display: flex; align-items: center; gap: 5px; margin-top: 5px; font-size: 10px; font-weight: 700; color: var(--red, #e86b72); }
  .auth-strength-hint { display: flex; align-items: center; gap: 5px; margin-top: 5px; font-size: 10px; color: #a3aeb2; }

  .auth-strength { display: flex; align-items: center; gap: 8px; margin-top: 8px; }
  .auth-strength-bars { display: flex; gap: 3px; flex: 1; max-width: 140px; }
  .auth-strength-bars i { height: 4px; flex: 1; border-radius: 3px; background: var(--surface-3, #eef2f2); transition: background .2s ease; }
  .auth-strength-label { font-size: 9px; font-weight: 800; }
  .auth-strength-label.weak { color: var(--red, #e86b72); }
  .auth-strength-label.ok { color: #d99a2b; }
  .auth-strength-label.strong { color: var(--green, #36b989); }

  .auth-error {
    display: flex; align-items: center; gap: 6px;
    margin: 12px 0 0; padding: 9px 12px;
    border: 1px solid rgba(232, 107, 114, .3); border-radius: 10px;
    color: #b33a44; background: #fdf0f1; font-size: 11px; font-weight: 700;
  }

  .auth-actions { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: 22px; }
  .auth-back { padding: 8px 10px; font-size: 11px; font-weight: 800; color: var(--muted, #64748b); }
  .auth-back:hover { color: var(--ink, #18232b); }
  .auth-back:disabled { opacity: .4; }
  .auth-submit {
    display: inline-flex; align-items: center; justify-content: center; gap: 7px;
    min-width: 170px; min-height: 44px; padding: 0 18px;
    border-radius: 11px; color: #fff; background: var(--orange);
    box-shadow: 0 10px 22px rgba(249, 115, 72, .26);
    font-size: 12px; font-weight: 800; transition: all .18s ease;
  }
  .auth-submit:hover { background: var(--orange-deep); transform: translateY(-1px); }
  .auth-submit:disabled { opacity: .5; box-shadow: none; transform: none; }

  .auth-spinner, .auth-spinner-inline {
    width: 14px; height: 14px; border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, .35); border-top-color: #fff;
    animation: auth-spin .7s linear infinite;
  }
  .auth-spinner-inline { width: 16px; height: 16px; margin: 12px auto 0; border-color: rgba(54, 185, 137, .3); border-top-color: var(--green); }
  @keyframes auth-spin { to { transform: rotate(360deg); } }

  .auth-demo {
    display: inline-flex; align-items: center; gap: 6px;
    margin-top: 16px; padding: 6px 8px;
    font-size: 11px; font-weight: 700; color: var(--muted, #64748b);
  }
  .auth-demo:hover { color: var(--ink, #18232b); }
  .auth-demo :global(.inline-flex) { color: var(--orange); }
  .auth-note { display: block; margin-top: 14px; font-size: 9px; line-height: 1.55; color: #a3aeb2; }

  /* Success moment */
  .auth-success { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; min-height: 420px; padding: 40px; text-align: center; }
  .auth-success-mark {
    display: grid; place-items: center; width: 64px; height: 64px; margin-bottom: 10px;
    border-radius: 50%; color: #fff; background: var(--green, #36b989);
    box-shadow: 0 14px 34px rgba(54, 185, 137, .3);
    animation: auth-pop .45s cubic-bezier(.2, 1.4, .4, 1);
  }
  @keyframes auth-pop { from { transform: scale(.4); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  .auth-success .eyebrow { margin-bottom: 2px; color: var(--green, #36b989); }
  .auth-success h2 { margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -.8px; color: var(--ink, #18232b); }
  .auth-success p { margin: 0; font-size: 12px; color: var(--muted, #64748b); }
  .auth-success-note { margin-top: 4px !important; font-size: 10px !important; color: #a3aeb2 !important; }

  /* Dark mode */
  :global(.dark) .auth-shell { background: var(--paper, #16222a); }
  :global(.dark) .auth-form h2 { color: #e7edf0; }
  :global(.dark) .auth-field input { background: var(--canvas, #101b21); border-color: #26363f; }
  :global(.dark) .auth-field > span { color: #9fb2ba; }
  :global(.dark) .auth-toggle { background: #1d2c34; }
  :global(.dark) .auth-toggle button.active { background: #2a3b44; color: #e7edf0; }
  :global(.dark) .auth-back { color: #9fb2ba; }
  :global(.dark) .auth-demo { color: #9fb2ba; }

  /* Mobile */
  @media (max-width: 760px) {
    .auth-split { grid-template-columns: 1fr; }
    .auth-brand { display: none; }
    .auth-form { padding: 40px 24px 28px; }
    .auth-shell { max-height: 92vh; border-radius: 18px; }
  }
</style>
