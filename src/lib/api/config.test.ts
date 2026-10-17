import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { API_BASE_KEY, isApiConfigured, resolveApiBase } from './config';

/**
 * The rules that decide which host a static build talks to — and the wiring that
 * makes the build-time half work at all.
 *
 * The second half is the one worth guarding: `PUBLIC_API_BASE_URL` used to be
 * read through `import.meta.env`, which Vite only populates for its own `VITE_`
 * prefix. The value compiled to `undefined`, so a build could only ever reach a
 * host through the runtime `openstrata-api-base` override — a defect that no
 * runtime test could see, because there was nothing to see. The contract test
 * below reads the two files that have to agree.
 */

const ROOT = resolve(process.cwd());

/** The base a build would have inlined here, if any (vitest leaves env mutable). */
function importedEnvBase(): string | undefined {
	return import.meta.env.PUBLIC_API_BASE_URL;
}

describe('which host a build talks to', () => {
	it('prefers the runtime override over the build-time base', () => {
		expect(resolveApiBase('http://tailnet-host:8080', 'https://api.example.com')).toBe(
			'http://tailnet-host:8080'
		);
	});

	it('falls back to the build-time base when nothing is stored', () => {
		expect(resolveApiBase(null, 'https://api.example.com')).toBe('https://api.example.com');
		expect(resolveApiBase('', 'https://api.example.com')).toBe('https://api.example.com');
		expect(resolveApiBase('   ', 'https://api.example.com')).toBe('https://api.example.com');
		expect(resolveApiBase(undefined, 'https://api.example.com')).toBe('https://api.example.com');
	});

	it('trims whitespace and trailing slashes so path joins never double up', () => {
		expect(resolveApiBase(null, '  https://api.example.com/  ')).toBe('https://api.example.com');
		expect(resolveApiBase(null, 'https://api.example.com///')).toBe('https://api.example.com');
		expect(resolveApiBase(' http://127.0.0.1:8791/ ', null)).toBe('http://127.0.0.1:8791');
	});

	it('is demo mode when neither is set — never an empty-string URL', () => {
		expect(resolveApiBase(null, null)).toBeNull();
		expect(resolveApiBase(undefined, undefined)).toBeNull();
		expect(resolveApiBase('', '')).toBeNull();
	});
});

describe('one host serving the site and the API', () => {
	const ORIGIN = 'https://council.example';

	it('resolves a build value of / to the origin the page was served from', () => {
		expect(resolveApiBase(null, '/', ORIGIN)).toBe(ORIGIN);
		expect(resolveApiBase(null, 'same-origin', ORIGIN)).toBe(ORIGIN);
		expect(resolveApiBase(null, ' / ', `  ${ORIGIN}/  `)).toBe(ORIGIN);
	});

	it('is demo mode before it can know the origin (SSR/prerender)', () => {
		expect(resolveApiBase(null, '/', null)).toBeNull();
		expect(resolveApiBase(null, '/', undefined)).toBeNull();
		expect(resolveApiBase(null, '/', '')).toBeNull();
	});

	it('still lets the runtime override win over /', () => {
		expect(resolveApiBase('http://10.0.0.5:8787', '/', ORIGIN)).toBe('http://10.0.0.5:8787');
	});

	it('ignores a value that is not an absolute origin — including a protocol-relative one', () => {
		// `//evil.example` is a redirect to somebody else, not a shorthand for here:
		// appending /api/v1/... to it would send a bearer token to that host. Demo
		// mode is the safe reading of a config we cannot trust.
		expect(resolveApiBase(null, '//evil.example', ORIGIN)).toBeNull();
		expect(resolveApiBase(null, '/api', ORIGIN)).toBeNull();
		expect(resolveApiBase(null, 'javascript:alert(1)', ORIGIN)).toBeNull();
		expect(resolveApiBase(null, 'not a url', ORIGIN)).toBeNull();
	});

	it('keeps an absolute origin, with a path if a proxy sits in front of the API', () => {
		expect(resolveApiBase(null, 'https://api.example.com/', ORIGIN)).toBe('https://api.example.com');
		expect(resolveApiBase(null, 'https://host.example/openstrata', ORIGIN)).toBe(
			'https://host.example/openstrata'
		);
		expect(resolveApiBase(null, 'http://hermes:8787', ORIGIN)).toBe('http://hermes:8787');
	});

	it('falls through to an absolute value when the override is no good', () => {
		expect(resolveApiBase('/ ', 'https://api.example.com', null)).toBe('https://api.example.com');
	});

	it('keeps the storage key the operator override document names', () => {
		expect(API_BASE_KEY).toBe('openstrata-api-base');
	});

	it('agrees with isApiConfigured() about whether anything is configured', () => {
		// Asserted as a relation rather than as a fixed answer: a developer running
		// the suite with PUBLIC_API_BASE_URL exported is not a failing test.
		expect(isApiConfigured()).toBe(resolveApiBase(localStorage.getItem(API_BASE_KEY), importedEnvBase()) !== null);
	});
});

describe('the build-time base is actually plumbed through', () => {
	/** Vite's config, as text: the prefix list is the wiring this guards. */
	function viteConfig(): string {
		return readFileSync(resolve(ROOT, 'vite.config.ts'), 'utf8');
	}

	function configSource(): string {
		return readFileSync(resolve(ROOT, 'src/lib/api/config.ts'), 'utf8');
	}

	it('lets Vite inline PUBLIC_* into the client bundle', () => {
		const source = viteConfig();
		const prefix = source.match(/envPrefix\s*:\s*\[([^\]]*)\]/);
		expect(prefix, 'vite.config.ts must declare an envPrefix').not.toBeNull();
		expect(prefix![1]).toMatch(/'PUBLIC_'|"PUBLIC_"/);
	});

	it('still exposes VITE_* for the Sentry DSN wired in hooks.client.ts', () => {
		const prefix = viteConfig().match(/envPrefix\s*:\s*\[([^\]]*)\]/);
		expect(prefix![1]).toMatch(/'VITE_'|"VITE_"/);
	});

	it('reads the same variable name the docs give an operator', () => {
		expect(configSource()).toContain('import.meta.env?.PUBLIC_API_BASE_URL');
		// A renamed or re-prefixed read would silently fall back to demo mode.
		expect(configSource()).not.toContain('import.meta.env?.VITE_PUBLIC_API_BASE_URL');
	});
});
