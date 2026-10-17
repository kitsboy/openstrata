import { createHmac } from 'node:crypto';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import {
	PAY_LINK_MAX_TTL_DAYS,
	PAY_LINK_PARAM,
	payLinkPath,
	payLinkTtlSeconds,
	signPayLink,
	toPayLinkBill,
	verifyPayLink,
	type PayLinkInput
} from '../src/rails/pay-link.js';
import {
	DemoInteracProvider,
	type InteracProvider,
	type InteracRequest,
	type InteracRequestInput
} from '../src/rails/interac.js';
import { signJwt, verifyJwt } from '../src/auth/jwt.js';
import { buildServer } from '../src/api/server.js';
import { MemLedgerStore, MemPaymentRequestStore, MemAuthStore } from './memstore.js';
import { LedgerEngine } from '../src/ledger/ledger.js';
import { keywordRetriever, type SourceRecord } from '../src/rosa/rosa.js';
import { reconcile } from '../src/trf/recon.js';
import { DEFAULT_UNITS } from '../src/units/seed.js';

const SECRET = 'pay-link-test-secret-0123456789';
const otherSecret = 'a-different-secret-entirely';

const baseInput: PayLinkInput = {
	councilId: 'council-evergreen',
	councilName: 'Evergreen House',
	unitRef: '305',
	amountBasis: 92_100,
	referenceCode: 'LMS2847-305-202610',
	payeeContact: 'fees@lms2847.invalid'
};

const good = (over: Partial<PayLinkInput> = {}) => signPayLink({ ...baseInput, ...over }, SECRET);

describe('bill link signing', () => {
	it('signs the bill the council printed, and nothing else', () => {
		const token = good();
		const verified = verifyPayLink(token, SECRET);
		expect(verified.ok).toBe(true);
		if (!verified.ok) return;
		expect(verified.claims).toMatchObject({
			v: 1,
			c: 'council-evergreen',
			u: '305',
			a: 92_100,
			r: 'LMS2847-305-202610',
			p: 'fees@lms2847.invalid',
			n: 'Evergreen House'
		});
		expect(verified.claims.exp - verified.claims.iat).toBe(30 * 24 * 60 * 60);
	});

	it('normalises the payee and refuses to sign an unpayable bill', () => {
		const token = signPayLink({ ...baseInput, payeeContact: 'Fees@LMS2847.INVALID' }, SECRET);
		const verified = verifyPayLink(token, SECRET);
		expect(verified.ok && verified.claims.p).toBe('fees@lms2847.invalid');

		expect(() => signPayLink({ ...baseInput, amountBasis: 0 }, SECRET)).toThrow(/positive number of cents/);
		expect(() => signPayLink({ ...baseInput, amountBasis: -1 }, SECRET)).toThrow(/positive number of cents/);
		expect(() => signPayLink({ ...baseInput, amountBasis: 12.5 }, SECRET)).toThrow(/positive number of cents/);
		expect(() => signPayLink({ ...baseInput, unitRef: '  ' }, SECRET)).toThrow(/unit is required/);
		expect(() => signPayLink({ ...baseInput, referenceCode: '' }, SECRET)).toThrow(/reference is required/);
		expect(() => signPayLink({ ...baseInput, councilId: '' }, SECRET)).toThrow(/council is required/);
		expect(() => signPayLink({ ...baseInput, payeeContact: 'nobody' }, SECRET)).toThrow(/receiving email/);
	});

	it('clamps the window: a link is never forever', () => {
		expect(payLinkTtlSeconds(undefined)).toBe(30 * 86400);
		expect(payLinkTtlSeconds(0)).toBe(86400);
		expect(payLinkTtlSeconds(3)).toBe(3 * 86400);
		expect(payLinkTtlSeconds(10_000)).toBe(PAY_LINK_MAX_TTL_DAYS * 86400);
	});

	it('refuses a payload or a signature that was touched', () => {
		const token = good();
		const [prefix, payload, sig] = token.split('.') as [string, string, string];
		const flippedPayload = `${payload.slice(0, -2)}${payload.endsWith('A') ? 'B' : 'A'}`;
		expect(verifyPayLink(`${prefix}.${flippedPayload}.${sig}`, SECRET)).toEqual({
			ok: false,
			reason: 'bad signature'
		});
		const flippedSig = `${sig.slice(0, -2)}${sig.endsWith('A') ? 'B' : 'A'}`;
		expect(verifyPayLink(`${prefix}.${payload}.${flippedSig}`, SECRET)).toEqual({
			ok: false,
			reason: 'bad signature'
		});
		expect(verifyPayLink(token, otherSecret)).toEqual({ ok: false, reason: 'bad signature' });
		expect(verifyPayLink('', SECRET)).toEqual({ ok: false, reason: 'malformed' });
		expect(verifyPayLink('not.a.link', SECRET)).toEqual({ ok: false, reason: 'malformed' });
		expect(verifyPayLink(undefined, SECRET)).toEqual({ ok: false, reason: 'malformed' });
	});

	it('expires, and refuses a link minted backwards', () => {
		const old = signPayLink({ ...baseInput, now: new Date(Date.now() - 31 * 86400_000) }, SECRET);
		expect(verifyPayLink(old, SECRET)).toEqual({ ok: false, reason: 'expired' });

		const soon = signPayLink({ ...baseInput, ttlDays: 1 }, SECRET);
		const later = new Date(Date.now() + 2 * 86400_000);
		expect(verifyPayLink(soon, SECRET, later)).toEqual({ ok: false, reason: 'expired' });
		expect(verifyPayLink(good(), SECRET, new Date(Date.now() + 29 * 86400_000)).ok).toBe(true);
	});

	it('refuses a signed payload whose meaning is wrong', () => {
		// Signed by us, but claiming a shape or values we do not accept. The point is
		// that the signature is not the only check.
		const hand = (claims: Record<string, unknown>) => {
			const payload = Buffer.from(JSON.stringify(claims)).toString('base64url');
			const key = createHmac('sha256', SECRET).update('openstrata/pay-link/v1').digest();
			const sig = createHmac('sha256', key).update(payload).digest('base64url');
			return `ospl1.${payload}.${sig}`;
		};
		const now = Math.floor(Date.now() / 1000);
		const valid = {
			v: 1,
			c: 'c',
			u: '305',
			a: 100,
			r: 'r-1',
			p: 'fees@lms2847.invalid',
			n: 'Evergreen',
			iat: now,
			exp: now + 3600
		};
		expect(verifyPayLink(hand(valid), SECRET).ok).toBe(true);
		expect(verifyPayLink(hand({ ...valid, v: 2 }), SECRET)).toEqual({
			ok: false,
			reason: 'unknown version'
		});
		expect(verifyPayLink(hand({ ...valid, n: '' }), SECRET)).toEqual({
			ok: false,
			reason: 'incomplete claims'
		});
		expect(verifyPayLink(hand({ ...valid, a: 0 }), SECRET)).toEqual({
			ok: false,
			reason: 'amount must be a positive number of cents'
		});
		expect(verifyPayLink(hand({ ...valid, p: 'nobody' }), SECRET)).toEqual({
			ok: false,
			reason: 'the council needs a receiving email for this rail'
		});
		expect(verifyPayLink(hand({ ...valid, iat: now + 7200, exp: now + 3600 }), SECRET)).toEqual({
			ok: false,
			reason: 'not yet valid'
		});
	});

	it('cannot be mistaken for a session token, in either direction', () => {
		const token = good();
		// A link is not a JWT.
		expect(verifyJwt(token, SECRET)).toBeNull();
		// And a session JWT is not a link.
		const jwt = signJwt({ sub: 'u1', cid: 'c', role: 'admin' }, SECRET, 3600);
		expect(verifyPayLink(jwt, SECRET)).toEqual({ ok: false, reason: 'malformed' });
	});
});

describe('link paths and the bill a payer sees', () => {
	it('composes the sheet address the page already understands', () => {
		const path = payLinkPath('305', 'ospl1.payload.sig');
		const url = new URL(`https://openstrata.giveabit.io${path}`);
		expect(url.pathname).toBe('/pay');
		expect(url.searchParams.get('unit')).toBe('305');
		expect(url.searchParams.get('rail')).toBe('etransfer');
		expect(url.searchParams.get(PAY_LINK_PARAM)).toBe('ospl1.payload.sig');
	});

	it('hands the payer the bill and nothing else', () => {
		const verified = verifyPayLink(good(), SECRET);
		expect(verified.ok).toBe(true);
		if (!verified.ok) return;
		const bill = toPayLinkBill(verified.claims);
		expect(Object.keys(bill).sort()).toEqual([
			'amountBasis',
			'councilName',
			'expiresAt',
			'payeeContact',
			'referenceCode',
			'unitRef'
		]);
		expect(bill.amountBasis).toBe(92_100);
		expect(bill.unitRef).toBe('305');
	});
});

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

class SpyingProvider implements InteracProvider {
	readonly demo = true;
	readonly calls: InteracRequestInput[] = [];
	private readonly inner = new DemoInteracProvider();

	async create(input: InteracRequestInput): Promise<InteracRequest> {
		this.calls.push(input);
		return this.inner.create(input);
	}

	async status(councilId: string, requestId: string): Promise<InteracRequest | null> {
		return this.inner.status(councilId, requestId);
	}
}

const corpus: SourceRecord[] = [
	{
		citation: 'SPA s.92-96',
		title: 'Funds',
		url: 'https://x/92',
		text: 'Funds must not be co-mingled and the CRF receives at least 10% of the annual operating contribution.'
	}
];

describe('bill link routes', () => {
	let app: FastifyInstance;
	let provider: SpyingProvider;
	let adminToken: string;
	let memberToken: string;

	const auth = (token: string) => ({ authorization: `Bearer ${token}` });

	beforeAll(async () => {
		provider = new SpyingProvider();
		app = await buildServer(
			{
				ledger: new LedgerEngine(new MemLedgerStore()),
				rosa: keywordRetriever(corpus),
				reconcile,
				payments: new MemPaymentRequestStore(),
				auth: new MemAuthStore(),
				units: DEFAULT_UNITS,
				interac: provider,
				config: {
					crfMandatoryPct: 10,
					vectorCollection: 'bc_spa_rta_crt',
					rails: { fiat: { enabled: true } },
					cadPerBtc: 50_000,
					authSecret: 'test-secret-0123456789',
					authTokenTtl: 3600,
					authRateLimitMax: 1000,
					authRateLimitWindowMs: 60_000,
					payLinkSecret: SECRET,
					payLinkTtlDays: 30
				}
			},
			{ logger: false }
		);
		await app.ready();
		const reg = await app.inject({
			method: 'POST',
			url: '/api/v1/auth/register',
			payload: { councilName: 'Evergreen House', email: 'admin@link.test', password: 'password123' }
		});
		expect(reg.statusCode).toBe(200);
		adminToken = reg.json().token as string;
		const member = await app.inject({
			method: 'POST',
			url: '/api/v1/auth/users',
			headers: auth(adminToken),
			payload: { email: 'owner@link.test', role: 'member' }
		});
		expect(member.statusCode).toBe(200);
		const temporaryPassword = member.json().temporaryPassword as string;
		const login = await app.inject({
			method: 'POST',
			url: '/api/v1/auth/login',
			payload: { email: 'owner@link.test', password: temporaryPassword }
		});
		expect(login.statusCode).toBe(200);
		memberToken = login.json().token as string;
	});

	afterAll(async () => {
		await app.close();
	});

	const issue = async (over: Record<string, unknown> = {}) =>
		app.inject({
			method: 'POST',
			url: '/api/v1/payments/link',
			headers: auth(adminToken),
			payload: {
				unitRef: 'U-305',
				amountBasis: 92_100,
				referenceCode: 'LMS2847-305-202610',
				payeeContact: 'fees@lms2847.invalid',
				...over
			}
		});

	it('issuing needs a treasurer, not just a session', async () => {
		const anonymous = await app.inject({
			method: 'POST',
			url: '/api/v1/payments/link',
			payload: { unitRef: '305', amountBasis: 100, referenceCode: 'r', payeeContact: 'a@b.co' }
		});
		expect(anonymous.statusCode).toBe(401);
		const asMember = await app.inject({
			method: 'POST',
			url: '/api/v1/payments/link',
			headers: auth(memberToken),
			payload: { unitRef: '305', amountBasis: 100, referenceCode: 'r', payeeContact: 'a@b.co' }
		});
		expect(asMember.statusCode).toBe(403);
	});

	it('issues a link that verifies and carries the canonical lot', async () => {
		const res = await issue();
		expect(res.statusCode).toBe(200);
		const wire = res.json();
		expect(wire.ok).toBe(true);
		expect(wire.unitRef).toBe('305'); // 'U-305' canonicalised, like every unit key
		expect(wire.amountBasis).toBe(92_100);
		expect(wire.councilName).toBe('Evergreen House');
		expect(wire.path.startsWith('/pay?')).toBe(true);
		expect(Date.parse(wire.expiresAt)).toBeGreaterThan(Date.now());

		const verified = verifyPayLink(wire.token, SECRET);
		expect(verified.ok).toBe(true);
		if (verified.ok) {
			expect(verified.claims.a).toBe(92_100);
			expect(verified.claims.u).toBe('305');
			expect(verified.claims.c).toBeTruthy();
		}
	});

	it('shows a payer the bill, and only the bill', async () => {
		const wire = (await issue()).json();
		const res = await app.inject({
			method: 'POST',
			url: '/api/v1/payments/link/verify',
			payload: { token: wire.token }
		});
		expect(res.statusCode).toBe(200);
		const bill = res.json();
		expect(Object.keys(bill).sort()).toEqual([
			'amountBasis',
			'councilName',
			'expiresAt',
			'ok',
			'payeeContact',
			'referenceCode',
			'unitRef'
		]);
		expect(bill.amountBasis).toBe(92_100);

		const tampered = await app.inject({
			method: 'POST',
			url: '/api/v1/payments/link/verify',
			payload: { token: `${wire.token.slice(0, -3)}AAA` }
		});
		expect(tampered.statusCode).toBe(400);
		expect(tampered.json()).toEqual({ ok: false, reason: 'bad signature' });
	});

	it('starts a live Interac request with no session, on the link own terms', async () => {
		const wire = (await issue()).json();
		provider.calls.length = 0;
		const res = await app.inject({
			method: 'POST',
			url: '/api/v1/payments/interac/request',
			payload: {
				payLink: wire.token,
				// Everything below is a lie the server must ignore: a payer's page
				// cannot change the amount, the lot, the reference or the payee.
				unitRef: 'U-999',
				amountBasis: 1,
				referenceCode: 'attacker-chosen',
				payeeContact: 'attacker@example.com',
				payerContact: 'owner@example.com',
				returnUrl: 'https://openstrata.giveabit.io/pay?unit=305'
			}
		});
		expect(res.statusCode).toBe(200);
		const body = res.json();
		expect(body.ok).toBe(true);
		expect(body.viaLink).toBe(true);
		expect(body.unitRef).toBe('305');
		expect(body.amountBasis).toBe(92_100);
		expect(body.referenceCode).toBe('LMS2847-305-202610');
		expect(provider.calls).toHaveLength(1);
		expect(provider.calls[0].payeeContact).toBe('fees@lms2847.invalid');
		expect(provider.calls[0].payerContact).toBe('owner@example.com');
	});

	it('refuses the request when there is neither a session nor a link', async () => {
		const res = await app.inject({
			method: 'POST',
			url: '/api/v1/payments/interac/request',
			payload: { payerContact: 'owner@example.com', returnUrl: 'https://openstrata.giveabit.io/pay' }
		});
		expect(res.statusCode).toBe(401);
		expect(res.json()).toEqual({ ok: false, reason: 'authentication required' });
	});

	it('refuses an expired or tampered link at the request', async () => {
		const expired = signPayLink(
			{
				...baseInput,
				councilId: 'ignored',
				now: new Date(Date.now() - 40 * 86400_000)
			},
			SECRET
		);
		const res = await app.inject({
			method: 'POST',
			url: '/api/v1/payments/interac/request',
			payload: {
				payLink: expired,
				payerContact: 'owner@example.com',
				returnUrl: 'https://openstrata.giveabit.io/pay'
			}
		});
		expect(res.statusCode).toBe(400);
		expect(res.json().reason).toBe('expired');
	});

	it('lets the payer read their own request back, and no other bill', async () => {
		const one = (await issue()).json();
		const other = (
			await issue({ unitRef: '101', referenceCode: 'LMS2847-101-202610', amountBasis: 42_000 })
		).json();

		const created = await app.inject({
			method: 'POST',
			url: '/api/v1/payments/interac/request',
			payload: {
				payLink: one.token,
				payerContact: 'owner@example.com',
				returnUrl: 'https://openstrata.giveabit.io/pay'
			}
		});
		const id = created.json().requestId as string;

		const own = await app.inject({
			method: 'GET',
			url: `/api/v1/payments/interac/request/${id}?t=${encodeURIComponent(one.token)}`
		});
		expect(own.statusCode).toBe(200);
		expect(own.json().viaLink).toBe(true);
		expect(own.json().status).toBe('awaiting_payer');

		const wrongBill = await app.inject({
			method: 'GET',
			url: `/api/v1/payments/interac/request/${id}?t=${encodeURIComponent(other.token)}`
		});
		expect(wrongBill.statusCode).toBe(404);

		const noCredential = await app.inject({
			method: 'GET',
			url: `/api/v1/payments/interac/request/${id}`
		});
		expect(noCredential.statusCode).toBe(401);
	});

	it('never accepts a bill link as a session token', async () => {
		const wire = (await issue()).json();
		const me = await app.inject({
			method: 'GET',
			url: '/api/v1/auth/me',
			headers: auth(wire.token)
		});
		expect(me.statusCode).toBe(401);
		const anotherLink = await app.inject({
			method: 'POST',
			url: '/api/v1/payments/link',
			headers: auth(wire.token),
			payload: { unitRef: '305', amountBasis: 100, referenceCode: 'r', payeeContact: 'a@b.co' }
		});
		expect(anotherLink.statusCode).toBe(401);
	});
});
