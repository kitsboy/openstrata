import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';

/**
 * The secret-hygiene gate has to do two jobs that pull against each other:
 * fail on a committed credential, and stay quiet on the fixtures and prose a
 * repo legitimately ships. It was red at HEAD on 17 hand-read false positives,
 * which is the state in which a gate gets switched off.
 *
 * These tests run the real script (never a re-implementation of its patterns)
 * over temp files, so the classifier is exercised the way a commit is.
 */
const gate = path.join(process.cwd(), 'scripts/check-secret-hygiene.mjs');
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'secret-hygiene-'));
afterAll(() => fs.rmSync(dir, { recursive: true, force: true }));

/**
 * The gate scans every tracked file, this one included, so a literal like the
 * ones below would (correctly) fail the build. Each adversarial value is built
 * from pieces shorter than the 16-character floor, assembled at runtime, and
 * written to a temp file — the gate sees the finished line exactly as it would
 * in a commit, and the tree carries no credential-shaped literal to exempt.
 */
const value = (...pieces: string[]) => pieces.join('');

let counter = 0;

type Run = { code: number; stdout: string; stderr: string };

const runGate = (lines: string[], ...args: string[]): Run => {
  const file = path.join(dir, `case-${counter++}.txt`);
  fs.writeFileSync(file, `${lines.join('\n')}\n`);
  // stderr stays piped: the failing cases are expected, so their reports belong
  // in the assertion, not in the test runner's output.
  const stdio: ['ignore', 'pipe', 'pipe'] = ['ignore', 'pipe', 'pipe'];
  try {
    return {
      code: 0,
      stdout: execFileSync(process.execPath, [gate, file, ...args], { encoding: 'utf8', stdio }),
      stderr: ''
    };
  } catch (error) {
    const e = error as { status?: number; stdout?: string; stderr?: string };
    return { code: e.status ?? 1, stdout: e.stdout ?? '', stderr: e.stderr ?? '' };
  }
};

describe('secret-hygiene gate', () => {
  it('passes on the tracked tree — the gate is a signal, not a known-red check', () => {
    // No path arguments: the script enumerates `git ls-files`, which is exactly
    // what CI runs.
    const run = execFileSync(process.execPath, [gate], { encoding: 'utf8' });
    expect(run).toContain('Secret-hygiene gate passed');
    expect(run).not.toContain('FAILED');
  });

  it('reads a fixture value as a fixture, whatever file it lives in', () => {
    const run = runGate([
      // A test constant, the shape all 13 backend test files use.
      "const AUTH_SECRET = 'auth-test-secret-xyz';",
      // The docker-compose dev password from .env.example.
      'POSTGRES_PASSWORD=openstrata-dev-only',
      // A quoted test fixture with no marker word at all.
      "  password: 'correct-horse-battery',",
      // Hyphenated word values with a numeric tail.
      "const SECRET = 'member-store-secret-0123456789';"
    ]);
    expect(run.code).toBe(0);
    expect(run.stdout).toContain('Fixture-shaped literals classified');
  });

  it('reads prose quoting a token format and a CSS class as prose', () => {
    // The two shapes that made this gate red: a sentence calling the link token
    // "the credential", and a contrast-audit table naming a Tailwind class.
    const run = runGate([
      'The link is the credential: `ospl1.<payload>.<sig>`, HMAC-SHA256 under a key.',
      "      token: 'text-white/<opacity>',"
    ]);
    expect(run.code).toBe(0);
  });

  it('still fails on a real-looking value', () => {
    const cases: Array<[string, string]> = [
      // Mixed-case, no separators: what a generated key looks like.
      [`const AUTH_SECRET = '${value('Zx9Qm2Lp7Rt4Vb8', 'Nc3Kd6Wf1Qz8')}';`, 'quoted-credential-literal'],
      // An unquoted env value with a letter+digit run inside a segment.
      [`DB_PASSWORD=${value('a1b2c3d4e5f6', 'g7h8i9j0k1l2')}`, 'env-credential-literal'],
      // A quoted passphrase a human might actually use.
      [`  password: '${value('Summer2024', '!Secure')}',`, 'quoted-credential-literal'],
      // A provider token is caught by its own shape even in a test helper.
      [`const TOKEN = '${value('ghp_', '0123456789abcdefgh', 'ijklmnopqrstuv')}';`, 'github-token'],
      // Base64 does not hide it: the blob decodes to a provider token.
      [
        `const blob = '${value('Z2hwXzAxMjM0', 'NTY3ODlhYmNk', 'ZWZnaGlqa2xt', 'bm9wcXJzdHV2')}';`,
        'base64-wrapped-credential'
      ]
    ];
    for (const [line, rule] of cases) {
      const run = runGate([line]);
      expect(run.code, `expected a finding for: ${line}`).toBe(1);
      expect(run.stderr).toContain(`[${rule}]`);
    }
  });

  it('does not let fixture markers hide a production credential', () => {
    // Every one of these reads like a fixture and names a real environment, so
    // the danger veto has to win. A friendly name is not evidence.
    const cases = [
      `const AUTH_SECRET = '${value('prod', '-db-password-2026')}';`,
      `const AUTH_SECRET = '${value('staging', '-db-password-2026')}';`,
      `const PAY_LINK_SECRET = '${value('live', '-pay-link-secret-2026')}';`,
      `const API_KEY = '${value('real', '-deployment-key-2026')}';`
    ];
    for (const line of cases) {
      const run = runGate([line]);
      expect(run.code, `expected a finding for: ${line}`).toBe(1);
      expect(run.stderr).toContain('[quoted-credential-literal]');
    }
  });

  it('counts the fixtures it classified, so a jump is visible in the log', () => {
    const run = runGate([
      "const AUTH_SECRET = 'audit-test-secret-xyz';",
      "const AUTH_SECRET = 'session-test-secret-xyz';"
    ]);
    expect(run.code).toBe(0);
    expect(run.stdout).toContain('Fixture-shaped literals classified as test/dev values: 2 in 1 files');
  });
});
