import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import {
	CORS_ALLOW_HEADERS,
	CORS_MAX_AGE,
	CORS_METHODS,
	allowedOrigin,
	corsHeaders,
	mergeVary,
	normaliseOrigin,
	parseCorsOrigins
} from '../src/api/cors.js';
import { buildServer } from '../src/api/server.js';
import { MemLedgerStore, MemPaymentRequestStore, MemAuthStore } from './memstore.js';
import { LedgerEngine } from '../src/ledger/ledger.js';
import { keywordRetriever, type SourceRecord } from '../src/rosa/rosa.js';
import { reconcile } from '../src/trf/recon.js';
import { DEFAULT_UNITS } from '../src/units/seed.js';

const SITE = 'https://openstrata.giveabit.io';
const TAILNET = 'http://vmi3446772.tailb672ac.ts.net:8080';

const corpus: SourceRecord[] = [
	{ citation: 'SPA s.92', title: 'Funds', url: 'https://x/92', text: 'Reserve contributions.' }
];

describe('the origin list a host configures', () => {
	it('reads a comma-separated list, trimmed and deduped', () => {
		const parsed = parseCorsOrigins([` ${SITE} , ${TAILNET} `, SITE]);
		expect(parsed.origins).toEqual([SITE, TAILNET]);
		expect(parsed.refusedWildcard).toBe(false);
	});

	it('normalises what a browser treats as one origin', () => {
		expect(normaliseOrigin('https://Host.Example/')).toBe('https://host.example');
		expect(normaliseOrigin('https://host.example:443')).toBe('https://host.example');
		expect(normaliseOrigin('  http://127.0.0.1:4173  ')).toBe('http://127.0.0.1:4173');
	});

	it('drops anything that is not an absolute http(s) origin', () => {
		const parsed = parseCorsOrigins(['host.example', '/relative', 'javascript:alert(1)', '', '   ']);
		expect(parsed.origins).toEqual([]);
	});

	it('refuses a wildcard rather than honouring it', () => {
		const parsed = parseCorsOrigins(['*']);
		expect(parsed.origins).toEqual([]);
		expect(parsed.refusedWildcard).toBe(true);
		// A wildcard among real origins is dropped, and the real ones survive.
		const mixed = parseCorsOrigins([`${SITE},*`]);
		expect(mixed.origins).toEqual([SITE]);
		expect(mixed.refusedWildcard).toBe(true);
	});

	it('is empty when nothing is configured — cross-origin access is opt-in', () => {
		expect(parseCorsOrigins(undefined).origins).toEqual([]);
		expect(parseCorsOrigins([]).origins).toEqual([]);
		expect(parseCorsOrigins(['']).origins).toEqual([]);
	});
});

describe('the headers a response carries', () => {
	const origins = [SITE, TAILNET];

	it('echoes the origin that asked, with the methods and headers it may use', () => {
		const headers = corsHeaders(SITE, origins);
		expect(headers['access-control-allow-origin']).toBe(SITE);
		expect(headers['access-control-allow-methods']).toBe(CORS_METHODS.join(', '));
		expect(headers['access-control-allow-headers']).toBe(CORS_ALLOW_HEADERS.join(', '));
		expect(headers['access-control-max-age']).toBe(String(CORS_MAX_AGE));
		// A bearer token cannot be sent cross-origin unless it is allowed by name.
		expect(headers['access-control-allow-headers']).toContain('authorization');
	});

	it('answers a case- or slash-different origin with the spelling the browser sent', () => {
		expect(allowedOrigin('https://OpenStrata.GiveABit.io/', origins)).toBe(
			'https://OpenStrata.GiveABit.io/'
		);
		expect(allowedOrigin('https://openstrata.giveabit.io:443', origins)).toBe(
			'https://openstrata.giveabit.io:443'
		);
	});

	it('never allows a lookalike origin', () => {
		expect(allowedOrigin('https://openstrata.giveabit.io.evil.example', origins)).toBeNull();
		expect(allowedOrigin('https://evil.example', origins)).toBeNull();
		expect(allowedOrigin('http://openstrata.giveabit.io', origins)).toBeNull(); // scheme differs
		expect(allowedOrigin('https://openstrata.giveabit.io:8443', origins)).toBeNull(); // port differs
		expect(allowedOrigin('null', origins)).toBeNull();
	});

	it('gives a disallowed origin no permission at all — and no 403 to learn from', () => {
		const headers = corsHeaders('https://evil.example', origins);
		expect(headers['access-control-allow-origin']).toBeUndefined();
		expect(headers['access-control-allow-methods']).toBeUndefined();
		expect(headers['access-control-allow-headers']).toBeUndefined();
	});

	it('varies on Origin whenever an Origin was sent, allowed or not', () => {
		expect(corsHeaders(SITE, origins).vary).toBe('Origin');
		expect(corsHeaders('https://evil.example', origins).vary).toBe('Origin');
	});

	it('adds nothing when there was no Origin header', () => {
		expect(corsHeaders(undefined, origins)).toEqual({});
		expect(corsHeaders('', origins)).toEqual({});
	});

	it('merges Vary instead of replacing what the route set', () => {
		expect(mergeVary('Accept-Encoding', 'Origin')).toBe('Accept-Encoding, Origin');
		expect(mergeVary('accept-encoding, origin', 'Origin')).toBe('accept-encoding, origin');
		expect(mergeVary(undefined, 'Origin')).toBe('Origin');
	});
});

// ---------------------------------------------------------------------------
// The hook on a real server
// ---------------------------------------------------------------------------

async function build(configured: string | undefined): Promise<FastifyInstance> {
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
				vectorCollection: 'x',
				rails: { fiat: { enabled: true } },
				cadPerBtc: 50_000,
				authSecret: 'test-secret-0123456789',
				authTokenTtl: 3600,
				authRateLimitMax: 1000,
				authRateLimitWindowMs: 60_000,
				corsOrigins: configured === undefined ? undefined : [configured]
			}
		},
		{ logger: false }
	);
	await app.ready();
	return app;
}

describe('cross-origin access on the built server', () => {
	let open: FastifyInstance;
	let configured: FastifyInstance;

	beforeAll(async () => {
		open = await build(undefined);
		configured = await build(`${SITE},${TAILNET}`);
	});
	afterAll(async () => {
		await open.close();
		await configured.close();
	});

	it('adds no CORS header at all when nothing is configured', async () => {
		const res = await open.inject({ method: 'GET', url: '/health', headers: { origin: SITE } });
		expect(res.statusCode).toBe(200);
		expect(res.headers['access-control-allow-origin']).toBeUndefined();
		expect(res.headers.vary).toBeUndefined();

		const preflight = await open.inject({
			method: 'OPTIONS',
			url: '/api/v1/units',
			headers: { origin: SITE, 'access-control-request-method': 'GET' }
		});
		expect(preflight.headers['access-control-allow-origin']).toBeUndefined();
	});

	it('answers a preflight for an allowed origin without running a route', async () => {
		const res = await configured.inject({
			method: 'OPTIONS',
			url: '/api/v1/units',
			headers: { origin: SITE, 'access-control-request-method': 'GET' }
		});
		expect(res.statusCode).toBe(204);
		expect(res.body).toBe('');
		expect(res.headers['access-control-allow-origin']).toBe(SITE);
		expect(res.headers['access-control-allow-methods']).toContain('POST');
		expect(res.headers['access-control-allow-headers']).toContain('authorization');
		// The same preflight from an origin the council did not name gets no
		// permission — the handler still runs (a 404 here), which is intentional:
		// an invented 403 would tell an attacker which origins are allowed.
		const stranger = await configured.inject({
			method: 'OPTIONS',
			url: '/api/v1/units',
			headers: { origin: 'https://evil.example', 'access-control-request-method': 'GET' }
		});
		expect(stranger.headers['access-control-allow-origin']).toBeUndefined();
		expect(stranger.headers.vary).toBe('Origin');
	});

	it('lets the real flow run cross-origin: register, then an authed call', async () => {
		const reg = await configured.inject({
			method: 'POST',
			url: '/api/v1/auth/register',
			headers: { origin: SITE },
			payload: { councilName: 'Cross Origin', email: 'admin@cors.test', password: 'password123' }
		});
		expect(reg.statusCode).toBe(200);
		expect(reg.headers['access-control-allow-origin']).toBe(SITE);
		const token = reg.json().token as string;

		const units = await configured.inject({
			method: 'GET',
			url: '/api/v1/units',
			headers: { origin: TAILNET, authorization: `Bearer ${token}` }
		});
		expect(units.statusCode).toBe(200);
		expect(units.headers['access-control-allow-origin']).toBe(TAILNET);
	});

	it('keeps a refusal a refusal, still with the permission headers the browser needs', async () => {
		// An unauthenticated call from an allowed origin: 401, and the header is
		// still present so the browser can show the reason rather than a CORS
		// error the developer cannot read.
		const res = await configured.inject({
			method: 'GET',
			url: '/api/v1/units',
			headers: { origin: SITE }
		});
		expect(res.statusCode).toBe(401);
		expect(res.headers['access-control-allow-origin']).toBe(SITE);
	});

	it('refuses to open up to the world when a host lists a wildcard', async () => {
		const wildcard = await build('*');
		const res = await wildcard.inject({ method: 'GET', url: '/health', headers: { origin: SITE } });
		expect(res.headers['access-control-allow-origin']).toBeUndefined();
		expect(res.headers['access-control-allow-origin']).not.toBe('*');
		await wildcard.close();
	});
});
