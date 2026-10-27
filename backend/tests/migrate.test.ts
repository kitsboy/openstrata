import { describe, expect, it } from 'vitest';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';

const runner = fileURLToPath(new URL('../scripts/migrate.mjs', import.meta.url));
const migrationsDir = fileURLToPath(new URL('../src/ledger/migrations', import.meta.url));

/** Run the real exported helper in a child process and return its stdout. */
function inRunner(source: string): string {
  const script = `import { stripTransactionWrappers } from ${JSON.stringify(pathToFileURL(runner).href)};\n${source}`;
  return execFileSync(process.execPath, ['--input-type=module', '-e', script], { encoding: 'utf8' }).trimEnd();
}

function strip(sql: string): string {
  return inRunner(`console.log(stripTransactionWrappers(${JSON.stringify(sql)}));`);
}

describe('migration SQL helpers', () => {
  it('strips standalone transaction wrappers without altering comments or SQL content', () => {
    const sql = [
      '-- BEGIN; in a comment is not a transaction wrapper',
      'BEGIN;',
      'CREATE TABLE example (id integer);',
      'COMMIT;'
    ].join('\n');
    expect(strip(sql)).toBe([
      '-- BEGIN; in a comment is not a transaction wrapper',
      'CREATE TABLE example (id integer);'
    ].join('\n'));
  });

  it('keeps a plpgsql body intact rather than stripping its BEGIN (0009 regression)', () => {
    // 0009 failed on a fresh database with `syntax error at or near "RAISE"`
    // because the function body's BEGIN was filtered out as a wrapper line,
    // leaving the RAISE statement with no block to belong to.
    const sql = [
      'BEGIN;',
      'CREATE OR REPLACE FUNCTION f() RETURNS trigger LANGUAGE plpgsql AS $$',
      'BEGIN',
      "  RAISE EXCEPTION 'refused (% is rejected)', TG_OP;",
      'END;',
      '$$;',
      'COMMIT;'
    ].join('\n');
    expect(strip(sql)).toBe([
      'CREATE OR REPLACE FUNCTION f() RETURNS trigger LANGUAGE plpgsql AS $$',
      'BEGIN',
      "  RAISE EXCEPTION 'refused (% is rejected)', TG_OP;",
      'END;',
      '$$;'
    ].join('\n'));
  });

  it('treats strings, identifiers, tagged bodies and comments as opaque', () => {
    const sql = [
      'BEGIN;',
      '-- BEGIN',
      '/*',
      'COMMIT;',
      '*/',
      "INSERT INTO t (note) SELECT 'COMMIT;';",
      'CREATE FUNCTION g() RETURNS void LANGUAGE sql AS $body$',
      '  SELECT 1;',
      'COMMIT;',
      '$body$;',
      'SELECT "COMMIT";',
      'COMMIT;'
    ].join('\n');
    expect(strip(sql)).toBe([
      '-- BEGIN',
      '/*',
      'COMMIT;',
      '*/',
      "INSERT INTO t (note) SELECT 'COMMIT;';",
      'CREATE FUNCTION g() RETURNS void LANGUAGE sql AS $body$',
      '  SELECT 1;',
      'COMMIT;',
      '$body$;',
      'SELECT "COMMIT";'
    ].join('\n'));
  });

  it('ships every migration with its dollar-quoted bodies byte-identical', async () => {
    const files = (await readdir(migrationsDir)).filter((file) => file.endsWith('.sql')).sort();
    expect(files.length).toBeGreaterThanOrEqual(9);

    for (const file of files) {
      const raw = await readFile(join(migrationsDir, file), 'utf8');
      const stripped = inRunner(
        `import { readFileSync } from 'node:fs';\nconsole.log(stripTransactionWrappers(readFileSync(${JSON.stringify(join(migrationsDir, file))}, 'utf8')));`
      );
      // Whatever quoting a migration uses, no quoted body may be edited by the
      // wrapper stripper — only whole BEGIN/COMMIT statements at statement level.
      for (const segment of raw.matchAll(/\$(\w*)\$[\s\S]*?\$\1\$|'(?:[^']|'')*'|"(?:[^"]|"")*"/g)) {
        expect(stripped).toContain(segment[0]);
      }
      // And the wrapper the migration opened with is gone from the top.
      expect(stripped.trimStart().startsWith('BEGIN')).toBe(false);
      expect(stripped.trimEnd().endsWith('COMMIT;')).toBe(false);
    }
  });
});
