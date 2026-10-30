import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * The client error hook, guarded as a wiring contract rather than by importing
 * it.
 *
 * Why not import: `@sentry/sveltekit`'s client entry pulls in `$app/stores`,
 * which vitest cannot resolve in this project's setup, so `import
 * './hooks.client'` fails before any assertion runs. The thing worth asserting
 * is also not the runtime behaviour — it is that the export exists at all.
 *
 * That export is the whole fix. `Sentry.init` alone captures nothing from a
 * SvelteKit error, because the framework hands a thrown error to the
 * `handleError` hook; the file used to have no hook, so a configured DSN would
 * have reported an empty project indefinitely, and no runtime test could have
 * seen it because there was nothing to observe. Same shape as the envPrefix
 * contract in src/lib/api/config.test.ts: read the file that has to agree.
 */
const ROOT = resolve(process.cwd());

function hooksSource(): string {
  return readFileSync(resolve(ROOT, 'src/hooks.client.ts'), 'utf8');
}

describe('the client error hook is wired', () => {
  it('exports handleError wrapped in handleErrorWithSentry', () => {
    expect(hooksSource()).toMatch(
      /export const handleError = Sentry\.handleErrorWithSentry\(\s*\)/
    );
  });

  it('initialises Sentry only when a DSN is present and consent was recorded', () => {
    const source = hooksSource();
    expect(source).toContain('import.meta.env.VITE_PUBLIC_SENTRY_DSN');
    // The gate is the shared rule, not a bare `if (dsn)`: a DSN on its own must
    // leave monitoring off until the visitor has explicitly consented.
    expect(source).toContain('decideMonitoring(');
    expect(source).toMatch(/if \(decision\.enabled && dsn\) \{\s*Sentry\.init\(/);
  });
});
