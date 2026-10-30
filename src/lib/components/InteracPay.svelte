<script lang="ts">
	/**
	 * The Interac e-Transfer handshake for one lot's balance: the button, the
	 * request, the bank, and the answer.
	 *
	 * Interac's business rail works by handing the payer to Interac, where they
	 * choose *their own* financial institution and approve from their banking app
	 * — the council never holds a banking login. That is the whole shape of this
	 * component: start a request with the amount and reference locked in, hand the
	 * payer over, then take the answer back and be careful about what it means.
	 *
	 * The honesty is in the details:
	 *
	 *   - A host is required for a live request (the merchant credential lives
	 *     there). With none configured, or with no session on this browser, the
	 *     handshake runs as a labelled simulation of the same states instead of
	 *     pretending a bank was contacted.
	 *   - A gateway URL that is not https on an allowed host is never opened.
	 *   - A status that arrives in a link is a claim: it is repeated as
	 *     "waiting for the council's confirmation", never as paid. Only the host
	 *     says deposited.
	 */
	import { replaceState } from '$app/navigation';
	import Icon from './Icon.svelte';
	import { focusModal } from '$lib/focus-modal';
	import { copy } from '$lib/i18n';
	import { money } from '$lib/demo/format';
	import {
		DEFAULT_GATEWAY_HOSTS,
		advance,
		buildRequest,
		contactKind,
		findInstitutions,
		handshakeStage,
		isTerminal,
		isTrustedGateway,
		normalizeStatus,
		RETURN_PARAM,
		RETURN_STATUS_PARAM,
		type HandshakeStatus,
		type ReturnSignal
	} from '$lib/interac';
	import { ApiUnavailableError } from '$lib/api/client';
	import { isApiConfigured } from '$lib/api/config';
	import { interacRequestStatus, startInteracRequest } from '$lib/api/interac';
	import { providerReturnHref } from '$lib/pay-sheet';

	let {
		cents,
		reference,
		unitId,
		payee,
		/**
		 * The signed bill link this sheet was opened with, if any. It is the owner's
		 * credential when no one is signed in, so it is what makes a live request
		 * possible from an anonymous phone; the host reads the amount and payee
		 * from the link rather than from this page.
		 */
		link = null,
		/** A return parsed from the URL by the page that owns the address bar. */
		returned = null
	}: {
		cents: number;
		reference: string;
		unitId: string;
		payee: string;
		link?: string | null;
		returned?: ReturnSignal | null;
	} = $props();

	/**
	 * A bill link is a bearer credential, and the bank handoff leaves the tab. So
	 * the token is remembered per request id on this device rather than put in the
	 * return URL the provider is given: the payer comes back with the request id,
	 * and the token is recovered from here instead of from Interac's logs.
	 */
	const LINK_STORE = 'openstrata-pay-link:';

	function rememberLink(requestId: string, token: string) {
		try {
			sessionStorage.setItem(`${LINK_STORE}${requestId}`, token);
		} catch {
			/* storage disabled: the return then reads the request as a claim only */
		}
	}

	function rememberedLink(requestId: string): string | null {
		try {
			return sessionStorage.getItem(`${LINK_STORE}${requestId}`);
		} catch {
			return null;
		}
	}

	let open = $state(false);
	let stage = $state<'contact' | 'handoff' | 'result'>('contact');
	let contact = $state('');
	let requestId = $state('');
	let status = $state<HandshakeStatus>('requested');
	let gatewayUrl = $state('');
	let trusted = $state(true);
	let live = $state(false);
	let confirmed = $state(false);
	let busy = $state(false);
	let error = $state('');
	let query = $state('');
	let picked = $state('');

	/** The list Interac's page shows, searched without leaving the dialog. */
	const institutions = $derived(findInstitutions(query));
	const step = $derived(handshakeStage(status));
	/**
	 * A status that arrived in a link, with no host yet to confirm it. The card
	 * must not print "approved and deposited" on that alone — a URL is a claim,
	 * and this is the one place the page could be believed about money.
	 */
	const unconfirmedClaim = $derived(
		Boolean(returned) &&
			!confirmed &&
			(status === 'deposited' || status === 'approved')
	);
	const headline = $derived(
		unconfirmedClaim
			? $copy.payInteracReturned
			: status === 'requested'
			? $copy.payInteracRequested
			: status === 'awaiting_payer'
				? $copy.payInteracWaiting
				: status === 'approved'
					? $copy.payInteracApproved
					: status === 'deposited'
						? $copy.payInteracDeposited
						: status === 'declined'
							? $copy.payInteracDeclined
							: status === 'expired'
								? $copy.payInteracExpired
								: $copy.payInteracCancelled
	);

	/**
	 * A real return: pick the thread up where the bank left it, then ask the host
	 * what it actually is. Without a host the link's word is kept as a claim.
	 */
	$effect(() => {
		const signal = returned;
		if (!signal || signal.requestId === requestId) return;
		requestId = signal.requestId;
		status = signal.status ?? 'requested';
		stage = 'result';
		open = true;
		confirmed = false;
		void confirm(signal.requestId, signal);
	});

	async function confirm(id: string, signal: ReturnSignal) {
		try {
			const result = await interacRequestStatus(id, link ?? rememberedLink(id));
			live = !result.demo;
			status = normalizeStatus(result.status) ?? signal.status ?? 'requested';
			confirmed = true;
		} catch {
			// No host, no session, or the host is unreachable: the claim stands as a
			// claim. Nothing here decides that money arrived.
			confirmed = false;
		}
	}

	function reset() {
		stage = 'contact';
		contact = '';
		requestId = '';
		status = 'requested';
		gatewayUrl = '';
		trusted = true;
		live = false;
		confirmed = false;
		error = '';
		query = '';
		picked = '';
	}

	function openDialog() {
		error = '';
		open = true;
	}

	function close() {
		open = false;
		if (stage === 'result') reset();
	}


	/** Write the return the same way a live provider would, so a reload resumes. */
	function writeReturn(id: string, next: HandshakeStatus) {
		const url = new URL(location.href);
		url.searchParams.set(RETURN_PARAM, id);
		url.searchParams.set(RETURN_STATUS_PARAM, next);
		void replaceState(url, {});
	}

	/** A simulation identifier: recognisably ours, never mistakable for a bank's. */
	function demoRequestId(): string {
		const tail = Math.random().toString(36).slice(2, 6).toUpperCase();
		return `SIM-${reference}-${tail}`;
	}

	async function startHandshake() {
		error = '';
		if (contactKind(contact) === 'invalid') {
			error = $copy.payInteracContactInvalid;
			return;
		}
		const built = buildRequest({
			cents,
			reference,
			unitRef: unitId,
			payeeContact: payee,
			payerContact: contact,
			// The token is not handed to the provider: it is a credential for this
			// bill, and the bank has no use for it.
			returnUrl: providerReturnHref(location.href)
		});
		if (!built.ok) {
			error = built.reason;
			return;
		}

		busy = true;
		try {
			const result = await startInteracRequest(built.body, { payLink: link });
			if (link) rememberLink(result.requestId, link);
			live = !result.demo;
			requestId = result.requestId;
			gatewayUrl = result.gatewayUrl;
			const hosts = result.gatewayHosts?.length ? result.gatewayHosts : DEFAULT_GATEWAY_HOSTS;
			// A rehearsal hands back no address to open, so only a live answer is
			// ever checked against the allow-list.
			trusted = result.demo ? true : isTrustedGateway(result.gatewayUrl, hosts);
			status = normalizeStatus(result.status) ?? 'requested';
			stage = 'handoff';
			if (!trusted) error = $copy.payInteracUntrusted;
		} catch (err) {
			// "No host" is demo mode and rehearses. "Host configured but unreachable"
			// is a failure, and saying so is the difference between a labelled
			// rehearsal and a payer believing a live rail went quiet.
			if (err instanceof ApiUnavailableError) {
				// A real bill link is never rehearsed: simulating an approval of an
				// amount a council actually printed would be the one lie this dialog
				// must not tell.
				if (isApiConfigured() || link) error = $copy.payInteracUnreachable;
				else simulate();
			} else {
				error = err instanceof Error ? err.message : String(err);
			}
		} finally {
			busy = false;
		}
	}

	/**
	 * No host configured: the same handshake against the same states, on this
	 * device, labelled as a simulation. Nothing is sent anywhere.
	 */
	function simulate() {
		live = false;
		requestId = demoRequestId();
		status = advance('requested', 'start');
		stage = 'handoff';
		writeReturn(requestId, status);
	}

	/**
	 * Simulated approval, then the deposit landing — two beats, as a bank does.
	 * The payer is finished acting the moment they approve, so the card moves to
	 * the answer straight away and the second beat updates it in place; leaving
	 * them on a bank picker that nothing further will happen to would be a lie of
	 * omission. (It shipped that way for one build: approved, then nothing.)
	 */
	function approve() {
		status = advance(status, 'approve');
		stage = 'result';
		writeReturn(requestId, status);
		setTimeout(() => {
			status = advance(status, 'settle');
			writeReturn(requestId, status);
		}, 1200);
	}

	function stop(action: 'decline' | 'cancel') {
		status = advance(status, action);
		stage = 'result';
		writeReturn(requestId, status);
	}

	/** The live handoff: the payer's own bank page, in this tab. */
	function handoff() {
		if (!trusted || !gatewayUrl) return;
		location.assign(gatewayUrl);
	}
</script>

<div class="interac">
	<button type="button" class="interac-open" onclick={openDialog}>
		<span class="interac-open-glyph"><Icon name="lock" class="h-4 w-4" /></span>
		<span class="interac-open-text">
			<span class="interac-open-name">{$copy.payInteracButton}</span>
			<span class="interac-open-note">{$copy.payInteracButtonNote}</span>
		</span>
	</button>

	{#if open}
		<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
		<div class="interac-backdrop" role="presentation" onclick={close}>
			<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
			<div
				class="interac-card"
				role="dialog"
				aria-modal="true"
				aria-labelledby="interac-title"
				tabindex="-1"
				use:focusModal={close}
				onclick={(event) => event.stopPropagation()}
			>
				<header class="interac-head">
					<h3 id="interac-title">{$copy.payInteracTitle}</h3>
					<span class="interac-badge" data-live={live}>
						{live ? $copy.payInteracLiveBadge : $copy.payInteracDemoBadge}
					</span>
					<button
						type="button"
						class="interac-close"
						aria-label={$copy.close}
						onclick={close}
					><Icon name="close" class="h-4 w-4" /></button>
				</header>

				<dl class="interac-facts">
					<div>
						<dt>{$copy.payInteracAmount}</dt>
						<dd class="amount">{money(cents)}</dd>
					</div>
					<div>
						<dt>{$copy.payInteracReference}</dt>
						<dd class="mono">{reference}</dd>
					</div>
					{#if requestId}
						<div>
							<dt>{$copy.payInteracRequestLabel}</dt>
							<dd class="mono">{requestId}</dd>
						</div>
					{/if}
				</dl>

				<ol class="interac-steps" aria-hidden="true">
					{#each [1, 2, 3, 4] as beat (beat)}
						<li data-state={beat < step ? 'done' : beat === step ? 'current' : 'todo'}>
							{#if beat < step}<Icon name="check" class="h-3 w-3" />{:else}{beat}{/if}
						</li>
					{/each}
				</ol>

				<p class="sr-only" aria-live="polite">{headline}</p>

				{#if stage === 'contact'}
					<div class="interac-body">
						<h4>{$copy.payInteracContactTitle}</h4>
						<p class="interac-hint">{$copy.payInteracContactHint}</p>
						<label class="interac-field">
							<span class="sr-only">{$copy.payInteracContactTitle}</span>
							<input
								type="text"
								autocomplete="email"
								placeholder={$copy.payInteracContactPlaceholder}
								bind:value={contact}
								oninput={() => (error = '')}
								onkeydown={(event) => event.key === 'Enter' && startHandshake()}
							/>
						</label>
						{#if error}
							<p class="interac-error" role="alert"><Icon name="alert" class="h-4 w-4" /> {error}</p>
						{/if}
						<button type="button" class="interac-cta" disabled={busy} onclick={startHandshake}>
							<Icon name="mail" class="h-4 w-4" />
							{busy ? $copy.payInteracStarting : $copy.payInteracStart}
						</button>
					</div>
				{:else if stage === 'handoff'}
					<div class="interac-body">
						<h4>{$copy.payInteracHandoffTitle}</h4>
						<p class="interac-hint">
							{$copy.payInteracHandoffNote
								.replace('{amount}', money(cents))
								.replace('{reference}', reference)}
						</p>

						{#if live}
							{#if trusted}
								<button type="button" class="interac-cta" onclick={handoff}>
									<Icon name="external" class="h-4 w-4" /> {$copy.payInteracContinue}
								</button>
							{:else}
								<p class="interac-error" role="alert">
									<Icon name="alert" class="h-4 w-4" /> {error || $copy.payInteracUntrusted}
								</p>
							{/if}
							<p class="interac-hint">{$copy.payInteracCancelNote}</p>
						{:else}
							<p class="interac-sim"><Icon name="shield" class="h-4 w-4" /> {$copy.payInteracSimulated}</p>
							<h5>{$copy.payInteracPickBank}</h5>
							<p class="interac-hint">{$copy.payInteracPickBankHint}</p>
							<label class="interac-field">
								<span class="sr-only">{$copy.payInteracSearch}</span>
								<input
									type="search"
									placeholder={$copy.payInteracSearch}
									bind:value={query}
								/>
							</label>
							<ul class="interac-banks">
								{#each institutions as bank (bank.id)}
									<li>
										<button
											type="button"
											data-picked={picked === bank.id}
											onclick={() => (picked = bank.id)}
										>
											<span class="interac-bank-name">{bank.name}</span>
											{#if picked === bank.id}<Icon name="check" class="h-3.5 w-3.5" />{/if}
										</button>
									</li>
								{/each}
							</ul>
							{#if institutions.length === 0}
								<p class="interac-hint">{$copy.payInteracNoBank}</p>
							{/if}
							<button type="button" class="interac-cta" disabled={!picked} onclick={approve}>
								<Icon name="check" class="h-4 w-4" /> {$copy.payInteracApprove}
							</button>
							<div class="interac-alt">
								<button type="button" onclick={() => stop('decline')}>{$copy.payInteracDecline}</button>
								<button type="button" onclick={() => stop('cancel')}>{$copy.payInteracCancel}</button>
							</div>
							<p class="interac-hint">{$copy.payInteracCancelNote}</p>
						{/if}
					</div>
				{:else}
					<div class="interac-body">
						<p class="interac-headline" data-state={unconfirmedClaim ? 'waiting' : status}>
							{#if status === 'deposited' && !unconfirmedClaim}
								<Icon name="check" class="h-4 w-4" />
							{:else if status === 'approved' || unconfirmedClaim}
								<Icon name="clock" class="h-4 w-4" />
							{:else if status === 'requested' || status === 'awaiting_payer'}
								<Icon name="clock" class="h-4 w-4" />
							{:else}
								<Icon name="close" class="h-4 w-4" />
							{/if}
							{headline}
						</p>

						<!-- Only a live answer can be described as the bank's answer. In the
						     rehearsal the banner below says nothing was sent, which is the
						     whole truth and needs no second sentence. -->
						<!-- Only a live answer may be described as the bank's answer, and an
						     unconfirmed claim says what it is: a claim the council confirms. -->
						{#if unconfirmedClaim || (live && isTerminal(status) && status === 'deposited')}
							<p class="interac-hint">
								{confirmed ? $copy.payInteracConfirmed : $copy.payInteracUnconfirmed}
							</p>
						{/if}
						{#if returned && !returned.status && !confirmed}
							<p class="interac-hint">{$copy.payInteracUnknownReturn}</p>
						{/if}
						{#if !live}
							<p class="interac-sim"><Icon name="shield" class="h-4 w-4" /> {$copy.payInteracSimulated}</p>
						{/if}

						<div class="interac-alt">
							<button type="button" class="interac-cta" onclick={close}>{$copy.payInteracDone}</button>
						</div>
					</div>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	/* Tokens only, like the sheet this sits in: no literal fill, so both themes
	   work and the contrast audit keeps holding every ink used here. */
	.interac-open {
		display: flex;
		align-items: center;
		gap: 11px;
		width: 100%;
		margin-top: 14px;
		padding: 13px 15px;
		border: 1px solid var(--brand-text);
		border-radius: 13px;
		background: color-mix(in srgb, var(--brand-text) 6%, var(--paper));
		color: var(--ink);
		text-align: left;
		transition:
			background 0.18s ease,
			transform 0.18s ease;
	}
	.interac-open:hover {
		background: color-mix(in srgb, var(--brand-text) 12%, var(--paper));
		transform: translateY(-1px);
	}
	.interac-open-glyph {
		display: inline-flex;
		color: var(--brand-text);
	}
	.interac-open-text {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.interac-open-name {
		font-size: 14.5px;
		font-weight: 800;
	}
	.interac-open-note {
		font-size: 11.5px;
		color: var(--muted);
	}

	.interac-backdrop {
		position: fixed;
		inset: 0;
		z-index: 100;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 16px;
		background: color-mix(in srgb, var(--ink) 34%, transparent);
	}
	.interac-card {
		width: 100%;
		max-width: 520px;
		max-height: 88vh;
		overflow-y: auto;
		border: 1px solid var(--line);
		border-radius: 16px;
		background: var(--paper);
		box-shadow: var(--shadow-card);
	}
	.interac-head {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 14px 16px;
		border-bottom: 1px solid var(--line);
		background: var(--color-surface-2);
	}
	.interac-head h3 {
		margin: 0;
		font-size: 15px;
		font-weight: 800;
		color: var(--ink);
	}
	.interac-badge {
		padding: 3px 8px;
		border: 1px solid var(--line);
		border-radius: 999px;
		font-size: 10px;
		font-weight: 800;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--muted);
	}
	.interac-badge[data-live='true'] {
		color: var(--brand-text);
		border-color: color-mix(in srgb, var(--brand-text) 40%, transparent);
	}
	.interac-close {
		margin-left: auto;
		display: inline-grid;
		place-items: center;
		width: 28px;
		height: 28px;
		border-radius: 50%;
		background: transparent;
		color: var(--muted);
	}
	.interac-close:hover {
		background: var(--color-surface-3);
		color: var(--ink);
	}

	.interac-facts {
		display: flex;
		flex-wrap: wrap;
		gap: 6px 26px;
		margin: 0;
		padding: 14px 16px;
		border-bottom: 1px dashed var(--line);
	}
	.interac-facts dt {
		font-size: 10px;
		font-weight: 800;
		letter-spacing: 0.09em;
		text-transform: uppercase;
		color: var(--muted);
	}
	.interac-facts dd {
		margin: 3px 0 0;
		font-size: 13px;
		color: var(--ink);
	}
	.interac-facts dd.amount {
		font-size: 20px;
		font-weight: 800;
		font-variant-numeric: tabular-nums;
	}
	.interac-facts dd.mono {
		font-family: 'DM Mono', ui-monospace, monospace;
		font-size: 12px;
	}

	.interac-steps {
		display: flex;
		gap: 6px;
		margin: 0;
		padding: 12px 16px 0;
		list-style: none;
	}
	.interac-steps li {
		display: inline-grid;
		place-items: center;
		width: 22px;
		height: 22px;
		border: 1px solid var(--line);
		border-radius: 50%;
		font-size: 11px;
		font-weight: 800;
		color: var(--muted);
	}
	.interac-steps li[data-state='done'] {
		background: var(--brand-text);
		border-color: var(--brand-text);
		color: var(--paper);
	}
	.interac-steps li[data-state='current'] {
		border-color: var(--brand-text);
		color: var(--brand-text);
	}

	.interac-body {
		padding: 14px 16px 18px;
	}
	.interac-body h4 {
		margin: 0 0 6px;
		font-size: 15px;
		font-weight: 800;
		color: var(--ink);
	}
	.interac-body h5 {
		margin: 14px 0 4px;
		font-size: 12.5px;
		font-weight: 800;
		color: var(--ink);
	}
	.interac-hint {
		margin: 6px 0 0;
		font-size: 12.5px;
		line-height: 1.55;
		color: var(--muted);
	}
	.interac-field {
		display: block;
		margin-top: 10px;
	}
	.interac-field input {
		width: 100%;
		padding: 11px 12px;
		border: 1px solid var(--line);
		border-radius: 11px;
		background: var(--color-surface-2);
		color: var(--ink);
		font-size: 13.5px;
	}
	.interac-field input:focus-visible {
		outline: 3px solid var(--brand-text);
		outline-offset: 2px;
	}
	.interac-cta {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		width: 100%;
		margin-top: 14px;
		padding: 12px 14px;
		border-radius: 12px;
		background: var(--brand-text);
		color: var(--paper);
		font-size: 14px;
		font-weight: 800;
	}
	.interac-cta:disabled {
		opacity: 0.55;
	}
	.interac-alt {
		display: flex;
		gap: 10px;
		margin-top: 10px;
	}
	.interac-alt > button {
		flex: 1;
		padding: 9px 12px;
		border: 1px solid var(--line);
		border-radius: 11px;
		background: var(--paper);
		color: var(--ink);
		font-size: 12.5px;
		font-weight: 700;
	}
	.interac-alt > button.interac-cta {
		border-color: var(--brand-text);
		background: var(--brand-text);
		color: var(--paper);
	}
	.interac-sim,
	.interac-error,
	.interac-headline {
		display: flex;
		align-items: flex-start;
		gap: 8px;
		margin: 12px 0 0;
		padding: 10px 12px;
		border: 1px solid var(--line);
		border-radius: 11px;
		font-size: 12.5px;
		line-height: 1.5;
	}
	.interac-sim {
		color: var(--muted);
		background: var(--color-surface-2);
	}
	.interac-error {
		color: var(--warning-text);
		border-color: color-mix(in srgb, var(--warning-text) 34%, transparent);
	}
	.interac-headline {
		margin-top: 0;
		font-size: 14px;
		font-weight: 800;
		color: var(--ink);
		background: var(--color-surface-2);
	}
	.interac-headline[data-state='deposited'] {
		color: var(--success-text, var(--ink));
	}
	.interac-headline[data-state='declined'],
	.interac-headline[data-state='expired'],
	.interac-headline[data-state='cancelled'] {
		color: var(--warning-text);
	}

	.interac-banks {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		gap: 6px;
		max-height: 190px;
		margin: 10px 0 0;
		padding: 0;
		overflow-y: auto;
		list-style: none;
	}
	.interac-banks button {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 6px;
		width: 100%;
		padding: 9px 11px;
		border: 1px solid var(--line);
		border-radius: 10px;
		background: var(--paper);
		color: var(--ink);
		font-size: 12.5px;
		font-weight: 700;
		text-align: left;
	}
	.interac-banks button[data-picked='true'] {
		border-color: var(--brand-text);
		box-shadow: inset 0 0 0 1px var(--brand-text);
		color: var(--brand-text);
	}
	.interac-bank-name {
		min-width: 0;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
		border: 0;
	}
</style>
