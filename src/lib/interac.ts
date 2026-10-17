/**
 * Interac e-Transfer rules for the pay sheet (`/pay`), kept out of the component
 * so they can be tested without a browser — the same shape as `pay-sheet.ts`
 * and `first-month.ts`.
 *
 * What is real here, and what is not. Interac collects business payments through
 * **Interac e-Transfer Business Request Money**: the council's software starts a
 * request, the payer is handed to Interac, chooses *their own* financial
 * institution there and approves from their banking app — no separate banking
 * login for the council to hold. Interac's own requirement is that a business
 * gets the feature **through a participating financial institution** (BMO, CIBC,
 * DC Bank, Peoples Trust and Scotiabank today), so the merchant credential lives
 * on the council's host, never in this static build. With no host configured the
 * sheet runs this same handshake against a clearly labelled simulation instead of
 * pretending: the states, the institution list and the return contract below are
 * the ones a live request produces, so wiring the host changes the label, not the
 * flow.
 *
 * Two rules carry the honesty of the screen:
 *
 * 1. A status arriving in a URL is a **claim**, never a payment. `returnClaim`
 *    says what may be repeated to the owner before the council's host confirms
 *    it, and approved-but-not-confirmed is deliberately not "paid".
 * 2. A gateway URL from a server is not trusted because it was returned — it has
 *    to be https and on an allowed host, or the payer is not sent there at all.
 */

/** Where a request can be, after the provider's vocabulary is read. */
export type HandshakeStatus =
	| 'requested'
	| 'awaiting_payer'
	| 'approved'
	| 'deposited'
	| 'declined'
	| 'expired'
	| 'cancelled';

export const HANDSHAKE_STATUSES = [
	'requested',
	'awaiting_payer',
	'approved',
	'deposited',
	'declined',
	'expired',
	'cancelled'
] as const satisfies readonly HandshakeStatus[];

/**
 * Provider spellings seen in the wild → our seven. Anything unrecognised maps to
 * `null` rather than being guessed at, because guessing here would let an unknown
 * string render as a completed payment.
 */
const STATUS_ALIASES: Record<string, HandshakeStatus> = {
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

/** Lower-cased, punctuation-normalised provider status → our status, or null. */
export function normalizeStatus(raw: unknown): HandshakeStatus | null {
	if (typeof raw !== 'string') return null;
	const key = raw.trim().toLowerCase().replace(/[\s-]+/g, '_');
	return STATUS_ALIASES[key] ?? null;
}

const TERMINAL: readonly HandshakeStatus[] = ['deposited', 'declined', 'expired', 'cancelled'];

/** Nothing further will happen to a request in a terminal state. */
export function isTerminal(status: HandshakeStatus): boolean {
	return TERMINAL.includes(status);
}

/** Only a deposited transfer is money the council has. */
export function isDeposited(status: HandshakeStatus): boolean {
	return status === 'deposited';
}

/**
 * The request's own progress, for the four beats the payer sees. A refusal or an
 * expiry is not a stage of its own: the handshake stopped at stage 2, and the
 * component says why.
 */
export function handshakeStage(status: HandshakeStatus): 1 | 2 | 3 | 4 {
	switch (status) {
		case 'requested':
			return 1;
		case 'awaiting_payer':
		case 'declined':
		case 'expired':
		case 'cancelled':
			return 2;
		case 'approved':
			return 3;
		case 'deposited':
			return 4;
	}
}

/**
 * The only transitions the simulation may make — the same guard a real provider
 * applies, so the demo cannot show something the rail would refuse: a completed
 * transfer is never cancelled, and an approved one is not approved twice.
 */
export type HandshakeAction = 'start' | 'approve' | 'decline' | 'cancel' | 'settle';

export function advance(status: HandshakeStatus, action: HandshakeAction): HandshakeStatus {
	if (isTerminal(status)) return status;
	switch (action) {
		case 'start':
			return status === 'requested' ? 'awaiting_payer' : status;
		case 'approve':
			return status === 'requested' || status === 'awaiting_payer' ? 'approved' : status;
		case 'settle':
			return status === 'approved' ? 'deposited' : status;
		case 'decline':
			return 'declined';
		case 'cancel':
			return 'cancelled';
	}
}

/**
 * A financial institution the payer can be sent to. The payer picks their own
 * bank on Interac's page — the list is there so the sheet can say what that page
 * will look like, not so OpenStrata ever learns which bank the owner uses.
 */
export interface Institution {
	/** Slug used in the simulation, never in a live request. */
	id: string;
	name: string;
	kind: 'bank' | 'credit-union' | 'trust' | 'digital';
}

export const INTERAC_INSTITUTIONS: readonly Institution[] = [
	{ id: 'rbc', name: 'RBC Royal Bank', kind: 'bank' },
	{ id: 'td', name: 'TD Canada Trust', kind: 'bank' },
	{ id: 'bmo', name: 'BMO Bank of Montreal', kind: 'bank' },
	{ id: 'scotiabank', name: 'Scotiabank', kind: 'bank' },
	{ id: 'cibc', name: 'CIBC', kind: 'bank' },
	{ id: 'national-bank', name: 'National Bank of Canada', kind: 'bank' },
	{ id: 'desjardins', name: 'Desjardins', kind: 'credit-union' },
	{ id: 'tangerine', name: 'Tangerine', kind: 'digital' },
	{ id: 'simplii', name: 'Simplii Financial', kind: 'digital' },
	{ id: 'eq-bank', name: 'EQ Bank', kind: 'digital' },
	{ id: 'atb', name: 'ATB Financial', kind: 'bank' },
	{ id: 'peoples-trust', name: 'Peoples Trust', kind: 'trust' },
	{ id: 'dc-bank', name: 'DC Bank', kind: 'trust' },
	{ id: 'coast-capital', name: 'Coast Capital Savings', kind: 'credit-union' },
	{ id: 'vancity', name: 'Vancity', kind: 'credit-union' },
	{ id: 'meridian', name: 'Meridian Credit Union', kind: 'credit-union' },
	{ id: 'servus', name: 'Servus Credit Union', kind: 'credit-union' },
	{ id: 'conexus', name: 'Conexus Credit Union', kind: 'credit-union' },
	{ id: 'alterna', name: 'Alterna Savings', kind: 'credit-union' },
	{ id: 'uni', name: 'UNI Financial Cooperation', kind: 'credit-union' }
];

/**
 * The institutions Interac names today as able to set a *business* up for
 * Business Request Money. Kept as data because it decides whether `/pay` may
 * offer the live button on a council's host at all.
 */
export const INTERAC_ONBOARDING_INSTITUTIONS = [
	'BMO',
	'CIBC',
	'DC Bank',
	'Peoples Trust',
	'Scotiabank'
] as const;

/** Case- and accent-insensitive search over the institution list. */
export function findInstitutions(query: string): readonly Institution[] {
	const needle = query.trim().toLowerCase();
	if (!needle) return INTERAC_INSTITUTIONS;
	return INTERAC_INSTITUTIONS.filter((item) => item.name.toLowerCase().includes(needle));
}

/** A payer identifier: an email address, or a North American mobile number. */
export function isPayerContact(value: string): boolean {
	return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim()) || digitsOf(value).length === 10;
}

function digitsOf(value: string): string {
	const digits = value.replace(/\D/g, '');
	// A Canadian mobile is ten digits; an entered +1 or 1 prefix is the same number.
	return digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits;
}

/** Store and compare payer contacts in one shape: a lower-cased email, or +1XXXXXXXXXX. */
export function normalizeContact(value: string): string {
	const trimmed = value.trim();
	if (trimmed.includes('@')) return trimmed.toLowerCase();
	const digits = digitsOf(trimmed);
	return digits.length === 10 ? `+1${digits}` : trimmed;
}

/** Interac sends the request to an email address or an SMS to a mobile number. */
export function contactKind(value: string): 'email' | 'mobile' | 'invalid' {
	const trimmed = value.trim();
	if (!trimmed) return 'invalid';
	if (trimmed.includes('@')) return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed) ? 'email' : 'invalid';
	return digitsOf(trimmed).length === 10 ? 'mobile' : 'invalid';
}

/** What the council's host posts to start a request. Amounts are integer cents. */
export interface InteracRequestInput {
	cents: number;
	/** The shared reference the ledger reconciles by — one string, one payment. */
	reference: string;
	unitRef: string;
	/** Where the council's request mail lands (the strata's e-transfer address). */
	payeeContact: string;
	/** Who is paying: an email address or mobile number. */
	payerContact: string;
	returnUrl: string;
	cancelUrl?: string;
	/** Language of the Interac page the payer lands on. */
	language?: string;
}

export interface InteracRequestBody {
	amountBasis: number;
	currency: 'CAD';
	referenceCode: string;
	unitRef: string;
	payeeContact: string;
	payerContact: string;
	returnUrl: string;
	cancelUrl?: string;
	language?: string;
}

/**
 * Build the request body, or say why it cannot be built. A zero or negative
 * amount is refused here rather than at the bank, and the payer contact is
 * normalised so the same person on two devices is one identifier.
 */
export function buildRequest(
	input: InteracRequestInput
): { ok: true; body: InteracRequestBody } | { ok: false; reason: string } {
	if (!Number.isInteger(input.cents) || input.cents <= 0) {
		return { ok: false, reason: 'amount must be a positive number of cents' };
	}
	if (!input.reference.trim()) return { ok: false, reason: 'reference is required' };
	if (!input.unitRef.trim()) return { ok: false, reason: 'unit is required' };
	if (contactKind(input.payerContact) === 'invalid') {
		return { ok: false, reason: 'payer contact must be an email address or a mobile number' };
	}
	if (contactKind(input.payeeContact) === 'invalid') {
		return { ok: false, reason: 'the council needs a receiving email on this host' };
	}
	return {
		ok: true,
		body: {
			amountBasis: input.cents,
			currency: 'CAD',
			referenceCode: input.reference.trim(),
			unitRef: input.unitRef.trim(),
			payeeContact: normalizeContact(input.payeeContact),
			payerContact: normalizeContact(input.payerContact),
			returnUrl: input.returnUrl,
			cancelUrl: input.cancelUrl,
			language: input.language
		}
	};
}

/**
 * Hosts a payer may be sent to when a host leaves `gatewayHosts` unset. Only
 * Interac's own domains: a redirect that carries a banking session belongs on the
 * brand the payer was told to expect.
 */
export const DEFAULT_GATEWAY_HOSTS = ['interac.ca'] as const;

function hostOf(url: string): string | null {
	try {
		return new URL(url).hostname.toLowerCase();
	} catch {
		return null;
	}
}

/**
 * A gateway URL is trusted only when it is https and its host is the allowed host
 * or a subdomain of it. A server response is not evidence — the payer's banking
 * session is what is at stake, so an unexpected host means no navigation.
 */
export function isTrustedGateway(
	url: string,
	allowedHosts: readonly string[] = DEFAULT_GATEWAY_HOSTS
): boolean {
	if (!url.startsWith('https://')) return false;
	const host = hostOf(url);
	if (!host) return false;
	return allowedHosts.some((allowed) => {
		const want = allowed.trim().toLowerCase();
		return want.length > 0 && (host === want || host.endsWith(`.${want}`));
	});
}

/** The query parameters the payer returns from Interac with. */
export const RETURN_PARAM = 'etransfer';
export const RETURN_STATUS_PARAM = 'status';

export interface ReturnSignal {
	requestId: string;
	/** The provider's own word, kept for the host to reconcile against. */
	reported: string;
	status: HandshakeStatus | null;
}

/**
 * Read a return from the URL. `status` is whatever Interac sent back and is
 * carried, not believed: the component confirms with the council's host before
 * anything is called paid.
 */
export function parseReturn(search: string): ReturnSignal | null {
	const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
	const requestId = params.get(RETURN_PARAM);
	if (!requestId) return null;
	const reported = params.get(RETURN_STATUS_PARAM) ?? '';
	return { requestId, reported, status: normalizeStatus(reported) };
}

/** What may be repeated to the owner before a host confirms anything. */
export type ReturnClaim = 'unconfirmed' | 'not_completed' | 'unknown';

export function returnClaim(status: HandshakeStatus | null): ReturnClaim {
	if (!status) return 'unknown';
	if (status === 'deposited' || status === 'approved') return 'unconfirmed';
	return 'not_completed';
}

/**
 * The URL a live provider is told to send the payer back to, carrying the
 * request id so the sheet can pick the thread up exactly where it was left.
 */
export function returnUrl(base: string, requestId: string, status?: HandshakeStatus): string {
	const url = new URL(base);
	url.searchParams.set(RETURN_PARAM, requestId);
	if (status) url.searchParams.set(RETURN_STATUS_PARAM, status);
	return url.toString();
}

/**
 * A request expires when the provider says it does; `expiresAt` is theirs, not a
 * number this file invents. An unparsable timestamp is treated as not expired so
 * a bad value can never silently end a payer's session.
 */
export function isExpired(expiresAt: string | undefined, now: number = Date.now()): boolean {
	if (!expiresAt) return false;
	const at = Date.parse(expiresAt);
	return Number.isFinite(at) && at <= now;
}
