import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';

const harness = new URL('../scripts/lib/pg-local.mjs', import.meta.url).href;

/**
 * Exercise the real harness module in a child process.
 *
 * The harness is plain ESM JavaScript, which the backend's TypeScript config does
 * not load, so — as with `migrate.test.ts` — the tests run the file itself rather
 * than a copy of its rules. A snippet's returned value becomes the parsed result.
 * Functions cannot cross that boundary, so cases that need injected fakes
 * (`exists`, `exec`, `pgConfig`) build them inside the snippet.
 */
function inHarness(body: string): string {
  const script = `import * as harness from ${JSON.stringify(harness)};
const __result = await (async () => {
${body}
})();
console.log(JSON.stringify(__result));`;
  // stderr is piped rather than inherited so a case that is *meant* to throw
  // does not print a stack trace over the test report.
  return execFileSync(process.execPath, ['--input-type=module', '-e', script], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe']
  }).trimEnd();
}

function value<T>(body: string): T {
  return JSON.parse(inHarness(body)) as T;
}

/** The stderr of a snippet that is expected to throw. */
function failure(body: string): string {
  try {
    inHarness(body);
  } catch (error) {
    return String((error as { stderr?: string }).stderr ?? error);
  }
  throw new Error('expected the harness snippet to fail');
}

type Found = { dir: string; source: string; pinned?: boolean; version: { major: number; full: string } } | null;
type VectorCheck = { ok: boolean; why?: string; control?: string };

const NO_POSTGRES = `{ env: {}, exists: () => false, exec: () => ({ status: 1, stdout: '', stderr: '' }), pgConfig: () => null }`;

/**
 * A snippet whose fake filesystem answers for one bin directory reporting
 * `version`; `onPath` is what `pg_config` claims, so a case can prove which
 * candidate wins.
 */
function discovery(version: string, options: { dir?: string; onPath?: string | null; env?: string } = {}): string {
  const dirs = [options.dir ?? '/opt/homebrew/opt/postgresql@17/bin', ...(options.onPath ? [options.onPath] : [])];
  return `
    const exists = (path) => ${JSON.stringify(dirs)}.some((dir) => path.startsWith(dir + '/'));
    const exec = () => ({ status: 0, stdout: 'initdb (PostgreSQL) ${version} (Homebrew)', stderr: '' });
    const pgConfig = () => ${options.onPath ? JSON.stringify(options.onPath) : 'null'};
    return harness.findBinaryDir({ env: ${options.env ?? '{}'}, exists, exec, pgConfig });`;
}

describe('local Postgres harness', () => {
  it('defaults the port and refuses anything that is not a port', () => {
    expect(value<number>('return harness.parsePort(undefined)')).toBe(5455);
    expect(value<number>('return harness.parsePort("")')).toBe(5455);
    expect(value<number>('return harness.parsePort(" 5544 ")')).toBe(5544);
    for (const bad of ['5432x', '0', '70000', '1.5', '-1']) {
      expect(failure(`return harness.parsePort(${JSON.stringify(bad)})`)).toMatch(/must be a port number/);
    }
  });

  it('targets the harness cluster unless a DATABASE_URL says otherwise', () => {
    expect(value('return harness.resolveDatabaseUrl({})')).toEqual({
      url: 'postgres://openstrata@127.0.0.1:5455/openstrata',
      mode: 'local'
    });
    expect(value<{ url: string }>('return harness.resolveDatabaseUrl({ OPENSTRATA_DB_PORT: "5544" })').url).toBe(
      'postgres://openstrata@127.0.0.1:5544/openstrata'
    );
    // An explicit URL is used verbatim: CI and `docker compose` share this gate.
    expect(value('return harness.resolveDatabaseUrl({ DATABASE_URL: " postgres://u:p@db:5432/council " })')).toEqual({
      url: 'postgres://u:p@db:5432/council',
      mode: 'external'
    });
    expect(value<{ mode: string }>('return harness.resolveDatabaseUrl({ DATABASE_URL: "   " })').mode).toBe('local');
    expect(value<{ url: string }>('return harness.resolveDatabaseUrl({ DATABASE_URL: "postgres://u@db/council" })').url).toBe(
      'postgres://u@db/council'
    );
  });

  it('only treats loopback hosts as safe places to create a scratch database', () => {
    // This guard is what stops a pre-push hook from migrating a shared server.
    for (const host of ['localhost', 'LOCALHOST', '127.0.0.1', '::1', 'host.docker.internal']) {
      expect(value<boolean>(`return harness.isLocalHost(${JSON.stringify(host)})`)).toBe(true);
    }
    for (const host of ['db', '10.0.0.5', 'openstrata.example.com', '', null]) {
      expect(value<boolean>(`return harness.isLocalHost(${JSON.stringify(host)})`)).toBe(false);
    }
  });

  it('reads a connection string and can point it at another database', () => {
    expect(value('return harness.describeUrl("postgres://openstrata:secret@127.0.0.1:5455/openstrata")')).toEqual({
      host: '127.0.0.1',
      port: 5455,
      user: 'openstrata',
      database: 'openstrata'
    });
    expect(value('return harness.describeUrl("postgres://openstrata@localhost/x")')).toMatchObject({ port: 5432, database: 'x' });
    expect(value<{ database: string }>('return harness.describeUrl("postgres://openstrata@localhost:5432").database')).toBe('openstrata');
    expect(value<string>('return harness.withDatabase("postgres://u@h:5455/council", "council_gate")')).toBe(
      'postgres://u@h:5455/council_gate'
    );
    expect(value<string>('return harness.scratchDatabaseName("postgres://u@h:5455/council")')).toBe('council_gate');
    expect(failure('return harness.describeUrl("not-a-url")')).toMatch(/not a valid connection string/);
  });

  it('refuses to create or drop a database whose name is not a plain identifier', () => {
    // The check runs before connecting, so a URL pointing nowhere proves the order.
    expect(failure('return await harness.dropDatabase("postgres://openstrata@127.0.0.1:1/none", "x; DROP DATABASE postgres")')).toMatch(
      /suspicious database name/
    );
    expect(failure('return await harness.createDatabase("postgres://openstrata@127.0.0.1:1/none", "Bad Name")')).toMatch(
      /suspicious database name/
    );
  });

  it('runs the version CI pins, and says how to install it when it is missing', () => {
    expect(value<Found>(`return harness.findBinaryDir(${NO_POSTGRES})`)).toBeNull();

    // The Homebrew keg for 17 wins over a different server on PATH.
    expect(value<Found>(discovery('17.11', { onPath: '/other/bin' }))).toMatchObject({
      dir: '/opt/homebrew/opt/postgresql@17/bin',
      version: { major: 17, full: 'initdb (PostgreSQL) 17.11 (Homebrew)' }
    });

    // A different major is not good enough, even when pg_config offers it — the
    // gate has to run the server CI runs.
    expect(value<Found>(discovery('16.4', { onPath: '/other/bin' }))).toBeNull();

    // An explicit override is taken at its word: reported, not second-guessed.
    expect(
      value<Found>(discovery('16.4', { dir: '/keg/bin', env: `{ OPENSTRATA_PG_BIN: '/keg/bin' }` }))
    ).toMatchObject({
      dir: '/keg/bin',
      source: 'OPENSTRATA_PG_BIN',
      version: { major: 16 }
    });

    expect(failure(`return harness.requireBinaryDir(${NO_POSTGRES})`)).toMatch(/brew install postgresql@17 pgvector/);
  });

  it('checks pgvector against the server that will run the schema', () => {
    const present = value<VectorCheck>(`
      const exec = (bin, args) => args[0] === '--sharedir'
        ? ({ status: 0, stdout: '/share/pg17', stderr: '' })
        : ({ status: 0, stdout: '', stderr: '' });
      return harness.checkVectorExtension('/keg/bin', { exec, exists: (path) => path === '/share/pg17/extension/vector.control' });
    `);
    expect(present).toEqual({ ok: true, control: '/share/pg17/extension/vector.control' });

    const missing = value<VectorCheck>(`
      const exec = (bin, args) => args[0] === '--sharedir'
        ? ({ status: 0, stdout: '/share/pg16', stderr: '' })
        : ({ status: 0, stdout: '', stderr: '' });
      return harness.checkVectorExtension('/keg/bin', { exec, exists: () => false });
    `);
    expect(missing.ok).toBe(false);
    expect(missing.why).toMatch(/pgvector is not installed/);
    expect(missing.control).toBe('/share/pg16/extension/vector.control');
  });

  it('initialises a cluster directory once, with trust authentication for local use only', () => {
    const existing = value<{ created: boolean; ran: boolean }>(`
      let ran = false;
      const created = await harness.initCluster('/keg/bin', {
        dir: '/data',
        exists: () => true,
        mkdir: async () => {},
        exec: () => { ran = true; }
      });
      return { created, ran };
    `);
    expect(existing).toEqual({ created: false, ran: false });

    const fresh = value<{ created: boolean; calls: string[][] }>(`
      const calls = [];
      const created = await harness.initCluster('/keg/bin', {
        dir: '/data',
        exists: () => false,
        mkdir: async (path) => { calls.push(['mkdir', path]); },
        exec: (bin, args) => { calls.push([bin, ...args]); return { status: 0, stdout: '', stderr: '' }; }
      });
      return { created, calls };
    `);
    expect(fresh.created).toBe(true);
    expect(fresh.calls).toHaveLength(2);
    expect(fresh.calls[0]).toEqual(['mkdir', '/data']);
    expect(fresh.calls[1][0]).toBe('/keg/bin/initdb');
    expect(fresh.calls[1]).toContain('--auth=trust');
    expect(fresh.calls[1]).toContain('-D');
  });

  it('starts the cluster only when nothing is already listening', () => {
    const alreadyUp = value<{ started: { started: boolean }; calls: string[][] }>(`
      const calls = [];
      const exec = (bin, args) => { calls.push([bin, ...args]); return { status: 0, stdout: '', stderr: '' }; };
      const started = harness.startCluster('/keg/bin', 5455, { dir: '/data', exec, log: '/data/server.log' });
      return { started, calls };
    `);
    expect(alreadyUp.started).toEqual({ started: false });
    expect(alreadyUp.calls).toHaveLength(1); // pg_isready only — pg_ctl never ran
    expect(alreadyUp.calls[0][0]).toBe('/keg/bin/pg_isready');

    const down = value<{ started: { started: boolean }; calls: string[][] }>(`
      const calls = [];
      const exec = (bin, args) => {
        calls.push([bin, ...args]);
        return bin.endsWith('pg_isready') ? { status: 1, stdout: '', stderr: '' } : { status: 0, stdout: '', stderr: '' };
      };
      const started = harness.startCluster('/keg/bin', 5455, { dir: '/data', exec, log: '/data/server.log' });
      return { started, calls };
    `);
    expect(down.started).toEqual({ started: true });
    const pgCtl = down.calls.find((call) => call[0].endsWith('pg_ctl'));
    expect(pgCtl).toBeDefined();
    expect(pgCtl!.join(' ')).toContain('listen_addresses=127.0.0.1');
    expect(pgCtl!.join(' ')).toContain('-k /data');
  });
});
