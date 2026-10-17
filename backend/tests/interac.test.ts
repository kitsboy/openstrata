import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import {
	DemoInteracProvider,
	HttpInteracProvider,
	INTERAC_REQUEST_TTL_MINUTES,
	InteracError,
	applyReportedStatus,
	isPayerContact,
	isTrustedGatewayUrl,
	normalizeContact,
	normalizeInteracStatus,
	type InteracRequest
} from '../src/rails/interac.js';
import { buildServer } from '../src/api/server.js';
import { MemLedgerStore, MemPaymentRequestStore, MemAuthStore } from './memstore.js';
import { LedgerEngine } from '../src/ledger/ledger.js';
import { keywordRetriever, type SourceRecord } from '../src/rosa/rosa.js';
import { reconcile } from '../src/trf/recon.js';
import { DEFAULT_UNITS } from '../src/units/seed.js';

const request = {
	councilId: 'cedar-point',
	unitRef: '305',
	amountBasis: 92_100,
	referenceCode: 'EVG-305-202610',
	payerContact: 'Owner@Example.com',
	payeeContact: 'fees@lms2847.invalid',
	returnUrl: 'https://openstrata.giveabit.ca/pay?unit=305&rail=etransfer'
};

describe('Interac status vocabulary', () => {
	it('reads the provider spellings into the seven states', () => {
		expect(normalizeInteracStatus('REQUESTED')).toBe('requested');
		expect(normalizeInteracStatus(' request-sent ')).toBe('requested');
		expect(normalizeInteracStatus('pending')).toBe('awaiting_payer');
		expect(normalizeInteracStatus('Authorized')).toBe('approved');
		expect(normalizeInteracStatus('settled')).toBe('deposited');
		expect(normalizeInteracStatus('timed_out')).toBe('expired');
	});

	it('refuses to guess at a status it does not know', () => {
		expect(normalizeInteracStatus('bank_said_something')).toBeNull();
		expect(normalizeInteracStatus('')).toBeNull();
		expect(normalizeInteracStatus(undefined)).toBeNull();
	});

	it('never moves a request backwards, and never reopens a stopped one', () => {
		expect(applyReportedStatus('requested', 'DEPOSITED')).toBe('deposited');
		expect(applyReportedStatus('awaiting_payer', 'approved')).toBe('approved');
		// A replayed webhook cannot un-deposit a paid transfer.
		expect(applyReportedStatus('deposited', 'requested')).toBe('deposited');
		expect(applyReportedStatus('deposited', 'declined')).toBe('deposited');
		// Nor resurrect a declined one.
		expect(applyReportedStatus('declined', 'deposited')).toBe('declined');
		expect(applyReportedStatus('cancelled', 'awaiting_payer')).toBe('cancelled');
		// An unreadable report changes nothing at all.
		expect(applyReportedStatus('awaiting_payer', 'nonsense')).toBe('awaiting_payer');
		expect(applyReportedStatus('awaiting_payer', 'awaiting_payer')).toBe('awaiting_payer');
	});
});

describe('gateway url and payer contact', () => {
	it('trusts https on Interac and its subdomains only', () => {
		expect(isTrustedGatewayUrl('https://etransfer.interac.ca/request/1')).toBe(true);
		expect(isTrustedGatewayUrl('http://etransfer.interac.ca/request/1')).toBe(false);
		expect(isTrustedGatewayUrl('https://interac.ca.evil.example/1')).toBe(false);
		expect(isTrustedGatewayUrl('https://notinterac.ca/1')).toBe(false);
		expect(isTrustedGatewayUrl('not a url')).toBe(false);
		expect(isTrustedGatewayUrl('')).toBe(false);
	});

	it('accepts the provider hosts a council host allows', () => {
		expect(isTrustedGatewayUrl('https://pay.bmo.com/emt', ['bmo.com'])).toBe(true);
		expect(isTrustedGatewayUrl('https://interac.ca/x', ['bmo.com'])).toBe(false);
	});

	it('addresses a payer by email or Canadian mobile only', () => {
		expect(isPayerContact('owner@example.com')).toBe(true);
		expect(isPayerContact('604-555-0134')).toBe(true);
		expect(isPayerContact('+1 (604) 555-0134')).toBe(true);
		expect(isPayerContact('604 555 013')).toBe(false);
		expect(isPayerContact('owner@')).toBe(false);
		expect(normalizeContact('Owner@Example.com')).toBe('owner@example.com');
		expect(normalizeContact('(604) 555-0134')).toBe('+16045550134');
	});
});

describe('rehearsal provider', () => {
	const now = new Date('2026-10-16T12:00:00Z');

	it('starts a request with the reference, the window, and no address to open', async () => {
		const provider = new DemoInteracProvider();
		const created = await provider.create(request, now);
		expect(created.demo).toBe(true);
		expect(created.status).toBe('awaiting_payer');
		expect(created.gatewayUrl).toBe('');
		expect(created.requestId.startsWith('SIM-EVG-305-202610-')).toBe(true);
		expect(created.amountBasis).toBe(92_100);
		expect(created.referenceCode).toBe('EVG-305-202610');
		expect(created.payerContact).toBe('owner@example.com');
		expect(Date.parse(created.expiresAt) - now.getTime()).toBe(INTERAC_REQUEST_TTL_MINUTES * 60_000);
	});

	it('refuses a request it could not send, before remembering it', async () => {
		const provider = new DemoInteracProvider();
		await expect(provider.create({ ...request, amountBasis: 0 }, now)).rejects.toThrow(InteracError);
		await expect(provider.create({ ...request, amountBasis: 12.5 }, now)).rejects.toThrow(
			/positive number of cents/
		);
		await expect(provider.create({ ...request, referenceCode: ' ' }, now)).rejects.toThrow(
			/reference is required/
		);
		await expect(provider.create({ ...request, payerContact: 'nobody' }, now)).rejects.toThrow(
			/email address or a mobile number/
		);
		await expect(provider.create({ ...request, payeeContact: 'nobody' }, now)).rejects.toThrow(
			/receiving email/
		);
		// A scheme nobody should be sent to, and an unencrypted return.
		await expect(provider.create({ ...request, returnUrl: 'javascript:alert(1)' }, now)).rejects.toThrow(
			/https/
		);
		await expect(provider.create({ ...request, returnUrl: 'http://plain.example/pay' }, now)).rejects.toThrow(
			/https/
		);
		await expect(provider.create({ ...request, returnUrl: 'not a url' }, now)).rejects.toThrow(
			/absolute url/
		);
	});

	it('never lets the clock approve anything', async () => {
		const provider = new DemoInteracProvider();
		const created = await provider.create(request, now);
		const at = (minutes: number) => new Date(now.getTime() + minutes * 60_000);
		// Waiting changes nothing: only the payer can move this on.
		for (const minutes of [0.5, 5, 29]) {
			expect((await provider.status(request.councilId, created.requestId, at(minutes)))?.status).toBe(
				'awaiting_payer'
			);
		}
		// And a request nobody answered expires rather than completing itself.
		expect((await provider.status(request.councilId, created.requestId, at(31)))?.status).toBe('expired');
	});

	it('lets an approval land, and stops there', async () => {
		const provider = new DemoInteracProvider();
		const created = await provider.create(request, now);
		const approved = await provider.report(request.councilId, created.requestId, 'authorized');
		expect(approved?.status).toBe('approved');
		const deposited = await provider.report(request.councilId, created.requestId, 'deposited');
		expect(deposited?.status).toBe('deposited');
		// A later, older report cannot reopen it — not even past the window.
		const late = new Date(now.getTime() + (INTERAC_REQUEST_TTL_MINUTES + 1) * 60_000);
		expect((await provider.status(request.councilId, created.requestId, late))?.status).toBe('deposited');
	});

	it('answers one council only', async () => {
		const provider = new DemoInteracProvider();
		const created = await provider.create(request, now);
		expect(await provider.status('another-council', created.requestId, now)).toBeNull();
		expect(await provider.report('another-council', created.requestId, 'deposited')).toBeNull();
	});
});

describe('live provider seam', () => {
	const payload = (body: unknown, status = 200) =>
		new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

	it('posts the request with the merchant credential and keeps the gateway host', async () => {
		const calls: { url: string; init?: RequestInit }[] = [];
		const provider = new HttpInteracProvider({
			apiUrl: 'https://api.interac.example/v1/',
			merchantId: 'merchant-2847',
			apiKey: 'secret-key',
			fetchImpl: (async (url: string, init?: RequestInit) => {
				calls.push({ url, init });
				return payload({
					requestId: 'IAR-9',
					gatewayUrl: 'https://etransfer.interac.ca/request/IAR-9',
					status: 'AUTHORIZED',
					expiresAt: '2026-10-16T13:00:00Z'
				});
			}) as unknown as typeof fetch
		});

		const created = await provider.create(request, new Date('2026-10-16T12:00:00Z'));
		expect(provider.demo).toBe(false);
		expect(calls[0].url).toBe('https://api.interac.example/v1/requests');
		const headers = calls[0].init?.headers as Record<string, string>;
		expect(headers.authorization).toBe('Bearer secret-key');
		expect(headers['x-merchant-id']).toBe('merchant-2847');
		const sent = JSON.parse(String(calls[0].init?.body));
		expect(sent.amountBasis).toBe(92_100);
		expect(sent.currency).toBe('CAD');
		expect(sent.payerContact).toBe('owner@example.com');
		expect(sent.referenceCode).toBe('EVG-305-202610');
		expect(created.status).toBe('approved');
		expect(created.gatewayUrl).toBe('https://etransfer.interac.ca/request/IAR-9');
		expect(created.demo).toBe(false);
	});

	it('refuses a gateway url outside the allowed hosts, and a missing id', async () => {
		const withPayload = (body: unknown) =>
			new HttpInteracProvider({
				apiUrl: 'https://api.interac.example',
				merchantId: 'm',
				apiKey: 'k',
				fetchImpl: (async () => payload(body)) as unknown as typeof fetch
			});
		await expect(
			withPayload({ requestId: 'IAR-9', gatewayUrl: 'https://phish.example/emt' }).create(request)
		).rejects.toThrow(/outside the allowed hosts/);
		await expect(withPayload({ gatewayUrl: 'https://interac.ca/x' }).create(request)).rejects.toThrow(
			/request id/
		);
		await expect(withPayload({ requestId: 'IAR-9' }).create(request)).rejects.toThrow(/gateway url/);
	});

	it('reads a status back, and refuses a refusal', async () => {
		const notFound = new HttpInteracProvider({
			apiUrl: 'https://api.interac.example',
			merchantId: 'm',
			apiKey: 'k',
			fetchImpl: (async () => payload({ reason: 'no' }, 404)) as unknown as typeof fetch
		});
		expect(await notFound.status('cedar-point', 'IAR-missing')).toBeNull();

		const broken = new HttpInteracProvider({
			apiUrl: 'https://api.interac.example',
			merchantId: 'm',
			apiKey: 'k',
			fetchImpl: (async () => payload({ status: 'something_new' })) as unknown as typeof fetch
		});
		await expect(broken.status('cedar-point', 'IAR-9')).rejects.toThrow(/do not recognise/);

		const offline = new HttpInteracProvider({
			apiUrl: 'https://api.interac.example',
			merchantId: 'm',
			apiKey: 'k',
			fetchImpl: (async () => {
				throw new Error('ECONNREFUSED');
			}) as unknown as typeof fetch
		});
		await expect(offline.create(request)).rejects.toThrow(/could not be reached/);
		await expect(offline.status('cedar-point', 'IAR-9')).rejects.toThrow(/could not be reached/);
	});
});

describe('interac API routes', () => {
	let app: FastifyInstance;
	let token: string;

	const auth = (value: string) => ({ authorization: `Bearer ${value}` });

	beforeAll(async () => {
		const corpus: SourceRecord[] = [
			{
				citation: 'SPA s.92-96',
				title: 'Funds',
				url: 'https://x/92',
				text: 'Funds must not be co-mingled and the CRF receives at least 10% of the annual operating contribution.'
			}
		];
		app = await buildServer(
			{
				ledger: new LedgerEngine(new MemLedgerStore()),
				rosa: keywordRetriever(corpus),
				reconcile,
				payments: new MemPaymentRequestStore(),
				auth: new MemAuthStore(),
				units: DEFAULT_UNITS,
				interac: new DemoInteracProvider(),
				config: {
					crfMandatoryPct: 10,
					vectorCollection: 'bc_spa_rta_crt',
					rails: { fiat: { enabled: true } },
					cadPerBtc: 50_000,
					authSecret: 'test-secret-0123456789',
					authTokenTtl: 3600,
					authRateLimitMax: 1000,
					authRateLimitWindowMs: 60_000
				}
			},
			{ logger: false }
		);
		await app.ready();
		const reg = await app.inject({
			method: 'POST',
			url: '/api/v1/auth/register',
			payload: { councilName: 'Interac Test', email: 'admin@interac.test', password: 'password123' }
		});
		expect(reg.statusCode).toBe(200);
		token = reg.json().token as string;
	});

	afterAll(async () => {
		await app.close();
	});

	const body = {
		unitRef: 'U-305',
		amountBasis: 92_100,
		referenceCode: 'EVG-305-202610',
		payerContact: 'owner@example.com',
		payeeContact: 'fees@lms2847.invalid',
		returnUrl: 'https://openstrata.giveabit.ca/pay?unit=305&rail=etransfer'
	};

	it('requires a token, like every council route', async () => {
		const res = await app.inject({ method: 'POST', url: '/api/v1/payments/interac/request', payload: body });
		expect(res.statusCode).toBe(401);
	});

	it('starts a request and reads it back', async () => {
		const created = await app.inject({
			method: 'POST',
			url: '/api/v1/payments/interac/request',
			headers: auth(token),
			payload: body
		});
		expect(created.statusCode).toBe(200);
		const wire = created.json();
		expect(wire.ok).toBe(true);
		expect(wire.demo).toBe(true);
		expect(wire.status).toBe('awaiting_payer');
		expect(wire.unitRef).toBe('305'); // canonicalized, like every other unit key
		expect(wire.amountBasis).toBe(92_100);
		expect(wire.referenceCode).toBe('EVG-305-202610');
		expect(wire.gatewayUrl).toBe('');

		const read = await app.inject({
			method: 'GET',
			url: `/api/v1/payments/interac/request/${wire.requestId}`,
			headers: auth(token)
		});
		expect(read.statusCode).toBe(200);
		expect(read.json().status).toBe('awaiting_payer');

		const missing = await app.inject({
			method: 'GET',
			url: '/api/v1/payments/interac/request/SIM-nope-0001',
			headers: auth(token)
		});
		expect(missing.statusCode).toBe(404);
	});

	it('refuses a request it could not send, with a reason', async () => {
		const bad = await app.inject({
			method: 'POST',
			url: '/api/v1/payments/interac/request',
			headers: auth(token),
			payload: { ...body, payerContact: 'nobody' }
		});
		expect(bad.statusCode).toBe(200);
		expect(bad.json().ok).toBe(false);
		expect(String(bad.json().reason)).toMatch(/email address or a mobile number/);

		const zero = await app.inject({
			method: 'POST',
			url: '/api/v1/payments/interac/request',
			headers: auth(token),
			payload: { ...body, amountBasis: 0 }
		});
		expect(zero.statusCode).toBe(400); // schema floor: cents are a positive integer
	});

	it('takes what the provider reported, for a treasurer', async () => {
		const created = await app.inject({
			method: 'POST',
			url: '/api/v1/payments/interac/request',
			headers: auth(token),
			payload: body
		});
		const id = created.json().requestId as string;
		const reported = await app.inject({
			method: 'POST',
			url: `/api/v1/payments/interac/request/${id}/reported`,
			headers: auth(token),
			payload: { status: 'deposited' }
		});
		expect(reported.statusCode).toBe(200);
		expect(reported.json().status).toBe('deposited');
	});

	it('publishes whether the host is live or rehearsing', async () => {
		const res = await app.inject({ method: 'GET', url: '/api/v1/rails/status', headers: auth(token) });
		expect(res.statusCode).toBe(200);
		expect(res.json().interac).toEqual({ configured: true, live: false });
	});
});

describe('interac provider absent', () => {
	it('says so instead of pretending', async () => {
		const corpus: SourceRecord[] = [
			{ citation: 'x', title: 'x', url: 'https://x', text: 'y' }
		];
		const app = await buildServer(
			{
				ledger: new LedgerEngine(new MemLedgerStore()),
				rosa: keywordRetriever(corpus),
				reconcile,
				payments: new MemPaymentRequestStore(),
				auth: new MemAuthStore(),
				units: DEFAULT_UNITS,
				config: {
					crfMandatoryPct: 10,
					vectorCollection: 'bc_spa_rta_crt',
					rails: { fiat: { enabled: true } },
					cadPerBtc: 50_000,
					authSecret: 'test-secret-0123456789',
					authTokenTtl: 3600,
					authRateLimitMax: 1000,
					authRateLimitWindowMs: 60_000
				}
			},
			{ logger: false }
		);
		await app.ready();
		const reg = await app.inject({
			method: 'POST',
			url: '/api/v1/auth/register',
			payload: { councilName: 'No Interac', email: 'admin@none.test', password: 'password123' }
		});
		const token = reg.json().token as string;
		const created = await app.inject({
			method: 'POST',
			url: '/api/v1/payments/interac/request',
			headers: { authorization: `Bearer ${token}` },
			payload: {
				unitRef: '305',
				amountBasis: 1_000,
				referenceCode: 'r-1',
				payerContact: 'owner@example.com',
				payeeContact: 'fees@lms2847.invalid',
				returnUrl: 'https://openstrata.giveabit.ca/pay'
			}
		});
		expect(created.json()).toEqual({ ok: false, reason: 'Interac rail is not configured on this host' });
		const status = await app.inject({ method: 'GET', url: '/api/v1/rails/status', headers: { authorization: `Bearer ${token}` } });
		expect(status.json().interac).toEqual({ configured: false, live: false });
		await app.close();
	});
});

describe('the demo provider answers the same shapes as the live one', () => {
	it('uses the same field names, so the screen does not care which is behind it', async () => {
		const provider = new DemoInteracProvider();
		const created: InteracRequest = await provider.create(request, new Date('2026-10-16T12:00:00Z'));
		expect(Object.keys(created).sort()).toEqual(
			[
				'amountBasis',
				'councilId',
				'createdAt',
				'demo',
				'expiresAt',
				'gatewayHosts',
				'gatewayUrl',
				'payerContact',
				'referenceCode',
				'requestId',
				'status',
				'unitRef'
			].sort()
		);
	});
});
