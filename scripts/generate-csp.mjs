/**
 * Build-time CSP hardening — pins `connect-src` in static/_headers to a
 * concrete API origin when one is configured, keeping the documented `https:`
 * fallback otherwise.
 *
 * The frontend API base is build-time configurable (PUBLIC_API_BASE_URL), so a
 * static CSP can't enumerate it. Setting CSP_API_ORIGIN (or letting this script
 * derive it from PUBLIC_API_BASE_URL) narrows connect-src to exactly that
 * origin — the tightening step from the 20-item plan (#2).
 *
 *   CSP_API_ORIGIN=https://api.example.com npm run build
 *   PUBLIC_API_BASE_URL=https://api.example.com npm run build   (same effect)
 *
 * Satohash / mempool / analytics / Cloudflare Insights origins are always
 * allowed — they are the page's fixed integrations. The Cloudflare Insights
 * connect-src entry receives the auto-injected beacon's POSTs (the script
 * source itself, static.cloudflareinsights.com, lives in script-src in
 * static/_headers).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseEnv } from 'node:util';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const headersPath = path.join(root, 'static', '_headers');

/**
 * The same `.env` files Vite loads for the bundle, in Vite's precedence order.
 *
 * This script runs in `prebuild`, before Vite, so it sees only the shell's
 * environment: an operator who follows the documented workflow and puts the API
 * base in `.env` (rather than exporting it) would get a bundle pointed at their
 * host and a CSP that still only allowed `https:` — which the browser would then
 * block for a plain-http tailnet host. An explicit shell variable still wins.
 */
const ENV_FILES = ['.env', '.env.local', '.env.production', '.env.production.local'];

function envFromFiles() {
  const out = {};
  for (const name of ENV_FILES) {
    const file = path.join(root, name);
    if (!fs.existsSync(file)) continue;
    Object.assign(out, parseEnv(fs.readFileSync(file, 'utf8')));
  }
  return out;
}

const fileEnv = envFromFiles();
const envValue = (name) => process.env[name] ?? fileEnv[name];

const FIXED_CONNECT = ["'self'", 'https://api.satohash.io', 'https://mempool.space', 'https://analytics.giveabit.io', 'https://cloudflareinsights.com'];

function deriveOrigin(value) {
  if (!value) return null;
  const trimmed = value.trim();
  if (!/^https?:\/\/[^/\s]+/.test(trimmed)) return null;
  return trimmed.replace(/\/+$/, '');
}

const explicit = deriveOrigin(envValue('CSP_API_ORIGIN'));
const fromBase = deriveOrigin(envValue('PUBLIC_API_BASE_URL'));
const apiOrigin = explicit ?? fromBase;

const connectList = apiOrigin ? [...FIXED_CONNECT, apiOrigin] : [...FIXED_CONNECT, 'https:'];

const source = fs.readFileSync(headersPath, 'utf8');
const cspPattern = /^(\s*Content-Security-Policy:\s*)(.*)$/m;
const cspMatch = source.match(cspPattern);
if (!cspMatch) {
  console.error('generate-csp: could not locate the Content-Security-Policy header in static/_headers');
  process.exit(1);
}

const directives = cspMatch[2].split(';').map((d) => d.trim());
const connectIndex = directives.findIndex((d) => d.startsWith('connect-src'));
if (connectIndex === -1) {
  console.error('generate-csp: could not locate the connect-src directive in static/_headers');
  process.exit(1);
}
directives[connectIndex] = `connect-src ${connectList.join(' ')}`;

const next = source.replace(cspPattern, `$1${directives.join('; ')}`);
fs.writeFileSync(headersPath, next);

console.log(
  apiOrigin
    ? `generate-csp: connect-src pinned to ${apiOrigin}`
    : 'generate-csp: no API origin configured — keeping documented https: fallback'
);
