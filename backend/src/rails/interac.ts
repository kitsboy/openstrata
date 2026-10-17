/**
 * Interac e-Transfer Business Request Money seam.
 *
 * Interac's business rail is not self-serve: a council gets it **through a
 * participating financial institution** (BMO, CIBC, DC Bank, Peoples Trust and
 * Scotiabank today), and that institution is what issues the merchant
 * credential. So this file owns the part OpenStrata can own — build the request,
 * refuse to open an address that is not Interac's, and never walk a request
 * backwards — and leaves the credential to the host's environment (`INTERAC_*`).
 *
 * With no credential configured the API answers from `DemoInteracProvider`: the
 * same request, the same status vocabulary and the same expiry rule, against an
 * in-memory table, with `demo: true` on every answer so no caller can mistake a
 * rehearsal for a bank. Nothing in the demo path contacts anyone.
 *
 * The state machine is small on purpose, because every state here is a sentence
 * someone will say to an owner:
 *
 *   requested → awaiting_payer → approved → deposited
 *            ↘ declined / expired / cancelled
 *
 * `deposited` is money. `approved` is not — the deposit has to land. And a
 * request never moves backwards, so a late or replayed report can not turn a
 * completed transfer into an open one.
 */

export type InteracStatus =
	| 'requested'
	| 'awaiting_payer'
	| 'approved'
	| 'deposited'
	| 'declined'
	| 'expired'
	| 'cancelled';

/** Provider spellings → ours. Anything unrecognised is refused, not guessed. */
const STATUS_ALIASES: Record<string, InteracStatus> = {
	created: 'requested',
	requested: 'requested',
	quote_created: 'requested',
	request_sent: 'requested',
	sent: 'awaiting_payer',
	notified: 'awaiting_payer',
	awaiting_payer: 'awaiting_payer',
	pending: 'awaiting_payer',
	approved: 'approved',
	authorized: 'approved',
	accepted: 'approved',
	deposited: 'deposited',
	settled: 'deposited',
	completed: 'deposited',
	complete: 'deposited',
	paid: 'deposited',
	funded: 'deposited',
	declined: 'declined',
	refused: 'declined',
	rejected: 'declined',
	failed: 'declined',
	expired: 'expired',
	timed_out: 'expired',
	cancelled: 'cancelled',
	canceled: 'cancelled',
	withdrawn: 'cancelled'
};

export function normalizeInteracStatus(raw: unknown): InteracStatus | null {
	if (typeof raw !== 'string') return null;
	const key = raw.trim().toLowerCase().replace(/[\s-]+/g, '_');
	return STATUS_ALIASES[key] ?? null;
}

/** Where a status may go: forward, or to a stop. Never back from a deposit. */
const RANK: Record<InteracStatus, number> = {
	requested: 0,
	awaiting_payer: 1,
	approved: 2,
	deposited: 3,
	declined: 3,
	expired: 3,
	cancelled: 3
};

export function isDepositedStatus(status: InteracStatus): boolean {
	return status === 'deposited';
}

export function isTerminalStatus(status: InteracStatus): boolean {
	return RANK[status] === 3;
}

/**
 * Apply what a provider reported. Returns the current status unchanged when the
 * report is unreadable, is the same state, or would move the request backwards —
 * a replayed webhook, or one arriving out of order, must not reopen a paid
 * request or resurrect a stopped one.
 */
export function applyReportedStatus(current: InteracStatus, reported: unknown): InteracStatus {
	const next = normalizeInteracStatus(reported);
	if (!next || next === current) return current;
	if (isTerminalStatus(current)) return current;
	if (RANK[next] < RANK[current]) return current;
	return next;
}

/** The hosts a payer may be sent to. Interac's own, unless a host widens it. */
export const INTERAC_GATEWAY_HOSTS = ['interac.ca'] as const;

/**
 * https on an allowed host (or a subdomain of one) is the whole test. The payer's
 * banking session rides this URL, so an unexpected host is refused rather than
 * opened — a gateway URL is a fact to check, not an instruction to follow.
 */
export function isTrustedGatewayUrl(
	url: string,
	allowedHosts: readonly string[] = INTERAC_GATEWAY_HOSTS
): boolean {
	if (typeof url !== 'string' || !url.startsWith('https://')) return false;
	let host: string;
	try {
		host = new URL(url).hostname.toLowerCase();
	} catch {
		return false;
	}
	return allowedHosts.some((allowed) => {
		const want = allowed.trim().toLowerCase();
		return want.length > 0 && (host === want || host.endsWith(`.${want}`));
	});
}

/** A payer identifier Interac can address: an email, or a Canadian mobile. */
export function isPayerContact(value: string): boolean {
	return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim()) || digitsOf(value).length === 10;
}

function digitsOf(value: string): string {
	const digits = value.replace(/\D/g, '');
	return digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits;
}

/** One shape per person: lower-cased email, or +1XXXXXXXXXX. */
export function normalizeContact(value: string): string {
	const trimmed = value.trim();
	if (trimmed.includes('@')) return trimmed.toLowerCase();
	const digits = digitsOf(trimmed);
	return digits.length === 10 ? `+1${digits}` : trimmed;
}

export interface InteracRequestInput {
	/** The council this request belongs to. Every lookup is scoped by it. */
	councilId: string;
	unitRef: string;
	/** Integer cents. Interac is a CAD rail. */
	amountBasis: number;
	/** The shared reference code the ledger reconciles by. */
	referenceCode: string;
	payerContact: string;
	payeeContact: string;
	returnUrl: string;
	cancelUrl?: string;
	language?: string;
}

export interface InteracRequest {
	requestId: string;
	councilId: string;
	unitRef: string;
	amountBasis: number;
	referenceCode: string;
	payerContact: string;
	status: InteracStatus;
	/** Where the payer approves. Empty when `demo` — nothing to open. */
	gatewayUrl: string;
	gatewayHosts: string[];
	expiresAt: string;
	createdAt: string;
	/** True when this answer came from a rehearsal on this host, not from Interac. */
	demo: boolean;
}

/** A refusal to start or read a request, carrying a reason fit to show. */
export class InteracError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'InteracError';
	}
}

export interface InteracProvider {
	readonly demo: boolean;
	create(input: InteracRequestInput, now?: Date): Promise<InteracRequest>;
	/** Council-scoped: one council can never read another's request. */
	status(councilId: string, requestId: string): Promise<InteracRequest | null>;
	/** Apply a status the provider itself reported (webhook / poll result). */
	report?(councilId: string, requestId: string, reported: unknown): Promise<InteracRequest | null>;
}

/** `localhost`, `127.0.0.1` and `[::1]` are the same machine, and all are allowed http. */
function isLoopbackHost(hostname: string): boolean {
	const host = hostname.toLowerCase();
	return host === 'localhost' || host === '127.0.0.1' || host === '[::1]' || host === '::1';
}

/** Validate what is about to be sent. Refused here rather than at the bank. */
export function assertRequestable(input: InteracRequestInput): void {
	if (!Number.isInteger(input.amountBasis) || input.amountBasis <= 0) {
		throw new InteracError('amount must be a positive number of cents');
	}
	if (!input.referenceCode.trim()) throw new InteracError('reference is required');
	if (!input.unitRef.trim()) throw new InteracError('unit is required');
	if (!isPayerContact(input.payerContact)) {
		throw new InteracError('payer contact must be an email address or a mobile number');
	}
	if (!isPayerContact(input.payeeContact)) {
		throw new InteracError('the council needs a receiving email for this rail');
	}
	try {
		const url = new URL(input.returnUrl);
		// Loopback may be http: a council testing this on its own machine is not
		// sending a payer over the open internet. Anything else must be https.
		if (url.protocol !== 'https:' && !isLoopbackHost(url.hostname)) {
			throw new InteracError('returnUrl must be https');
		}
	} catch (err) {
		if (err instanceof InteracError) throw err;
		throw new InteracError('returnUrl must be an absolute url');
	}
}

/** How long a request stays open. The payer's window, not the council's. */
export const INTERAC_REQUEST_TTL_MINUTES = 30;

/**
 * The rehearsal: same request, same vocabulary, same expiry, in memory.
 *
 * A clock is allowed to do exactly one thing here — let an unanswered request
 * expire. It must never approve one: a timer that says money arrived is the one
 * lie this seam could tell, and the rehearsal is where that would start. The
 * payer's approval arrives the way it would in production, through `report`.
 */

export class DemoInteracProvider implements InteracProvider {
	readonly demo = true;
	private requests = new Map<string, InteracRequest>();
	private seq = 0;

	private key(councilId: string, requestId: string): string {
		return `${councilId}\u0000${requestId}`;
	}

	async create(input: InteracRequestInput, now = new Date()): Promise<InteracRequest> {
		assertRequestable(input);
		this.seq += 1;
		const requestId = `SIM-${input.referenceCode}-${String(this.seq).padStart(4, '0')}`;
		const request: InteracRequest = {
			requestId,
			councilId: input.councilId,
			unitRef: input.unitRef,
			amountBasis: input.amountBasis,
			referenceCode: input.referenceCode,
			payerContact: normalizeContact(input.payerContact),
			status: 'awaiting_payer',
			gatewayUrl: '',
			gatewayHosts: [],
			expiresAt: new Date(now.getTime() + INTERAC_REQUEST_TTL_MINUTES * 60_000).toISOString(),
			createdAt: now.toISOString(),
			demo: true
		};
		this.requests.set(this.key(input.councilId, requestId), request);
		return request;
	}

	async status(councilId: string, requestId: string, now = new Date()): Promise<InteracRequest | null> {
		const found = this.requests.get(this.key(councilId, requestId));
		if (!found) return null;
		const advanced = this.advance(found, now);
		if (advanced !== found) this.requests.set(this.key(councilId, requestId), advanced);
		return advanced;
	}

	async report(councilId: string, requestId: string, reported: unknown): Promise<InteracRequest | null> {
		const found = this.requests.get(this.key(councilId, requestId));
		if (!found) return null;
		const next = { ...found, status: applyReportedStatus(found.status, reported) };
		this.requests.set(this.key(councilId, requestId), next);
		return next;
	}

	/** The clock owns one thing: a request nobody answers expires. */
	private advance(request: InteracRequest, now: Date): InteracRequest {
		if (isTerminalStatus(request.status)) return request;
		if (Date.parse(request.expiresAt) <= now.getTime()) return { ...request, status: 'expired' };
		return request;
	}
}

export interface HttpInteracProviderConfig {
	/** The provider endpoint the council's financial institution issued. */
	apiUrl: string;
	merchantId: string;
	apiKey: string;
	/** Hosts this provider is allowed to send a payer to. */
	gatewayHosts?: readonly string[];
	/** Injectable for tests; defaults to the global fetch. */
	fetchImpl?: typeof fetch;
	/** Request window in minutes; the provider may shorten it. */
	ttlMinutes?: number;
}

/**
 * The live seam. It speaks one small contract to whichever provider the council's
 * institution onboarded — create a request, read a request — and it refuses both
 * an untrusted gateway URL and any answer that is missing the identifiers a
 * return has to match on. The merchant secret is read from the host's
 * environment and is never logged.
 */
export class HttpInteracProvider implements InteracProvider {
	readonly demo = false;
	private readonly config: HttpInteracProviderConfig;
	private readonly gatewayHosts: readonly string[];

	constructor(config: HttpInteracProviderConfig) {
		this.config = config;
		this.gatewayHosts = config.gatewayHosts?.length
			? config.gatewayHosts
			: [...INTERAC_GATEWAY_HOSTS];
	}

	private headers(): Record<string, string> {
		return {
			'content-type': 'application/json',
			authorization: `Bearer ${this.config.apiKey}`,
			'x-merchant-id': this.config.merchantId
		};
	}

	private base(): string {
		return this.config.apiUrl.replace(/\/+$/, '');
	}

	private toRequest(input: InteracRequestInput, payload: unknown, now: Date): InteracRequest {
		const data = (payload ?? {}) as Record<string, unknown>;
		const requestId = typeof data.requestId === 'string' ? data.requestId : '';
		const gatewayUrl = typeof data.gatewayUrl === 'string' ? data.gatewayUrl : '';
		if (!requestId) throw new InteracError('provider did not return a request id');
		if (!gatewayUrl) throw new InteracError('provider did not return a gateway url');
		if (!isTrustedGatewayUrl(gatewayUrl, this.gatewayHosts)) {
			throw new InteracError('provider returned a gateway url outside the allowed hosts');
		}
		return {
			requestId,
			councilId: input.councilId,
			unitRef: input.unitRef,
			amountBasis: input.amountBasis,
			referenceCode: input.referenceCode,
			payerContact: normalizeContact(input.payerContact),
			status: normalizeInteracStatus(data.status) ?? 'requested',
			gatewayUrl,
			gatewayHosts: [...this.gatewayHosts],
			expiresAt:
				typeof data.expiresAt === 'string'
					? data.expiresAt
					: new Date(
							now.getTime() + (this.config.ttlMinutes ?? INTERAC_REQUEST_TTL_MINUTES) * 60_000
						).toISOString(),
			createdAt: now.toISOString(),
			demo: false
		};
	}

	async create(input: InteracRequestInput, now = new Date()): Promise<InteracRequest> {
		assertRequestable(input);
		const doFetch = this.config.fetchImpl ?? fetch;
		let response: Response;
		try {
			response = await doFetch(`${this.base()}/requests`, {
				method: 'POST',
				headers: this.headers(),
				body: JSON.stringify({
					amountBasis: input.amountBasis,
					currency: 'CAD',
					referenceCode: input.referenceCode,
					unitRef: input.unitRef,
					payeeContact: normalizeContact(input.payeeContact),
					payerContact: normalizeContact(input.payerContact),
					returnUrl: input.returnUrl,
					cancelUrl: input.cancelUrl,
					language: input.language
				})
			});
		} catch {
			throw new InteracError('the Interac provider could not be reached');
		}
		if (!response.ok) {
			throw new InteracError(`the Interac provider refused the request (${response.status})`);
		}
		return this.toRequest(input, await response.json(), now);
	}

	async status(councilId: string, requestId: string, now = new Date()): Promise<InteracRequest | null> {
		const doFetch = this.config.fetchImpl ?? fetch;
		let response: Response;
		try {
			response = await doFetch(`${this.base()}/requests/${encodeURIComponent(requestId)}`, {
				method: 'GET',
				headers: this.headers()
			});
		} catch {
			throw new InteracError('the Interac provider could not be reached');
		}
		if (response.status === 404) return null;
		if (!response.ok) {
			throw new InteracError(`the Interac provider refused the lookup (${response.status})`);
		}
		const data = (await response.json()) as Record<string, unknown>;
		const reported = normalizeInteracStatus(data.status);
		if (!reported) throw new InteracError('the provider reported a status we do not recognise');
		return {
			requestId,
			councilId,
			unitRef: typeof data.unitRef === 'string' ? data.unitRef : '',
			amountBasis: typeof data.amountBasis === 'number' ? data.amountBasis : 0,
			referenceCode: typeof data.referenceCode === 'string' ? data.referenceCode : '',
			payerContact: typeof data.payerContact === 'string' ? data.payerContact : '',
			status: reported,
			gatewayUrl: typeof data.gatewayUrl === 'string' ? data.gatewayUrl : '',
			gatewayHosts: [...this.gatewayHosts],
			expiresAt: typeof data.expiresAt === 'string' ? data.expiresAt : '',
			createdAt: typeof data.createdAt === 'string' ? data.createdAt : now.toISOString(),
			demo: false
		};
	}
}
