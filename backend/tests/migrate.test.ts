import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';

const runner = fileURLToPath(new URL('../scripts/migrate.mjs', import.meta.url));

describe('migration SQL helpers', () => {
  it('strips standalone transaction wrappers without altering comments or SQL content', async () => {
    const source = await readFile(runner, 'utf8');
    expect(source).toContain('export function stripTransactionWrappers');
    const sql = [
      '-- BEGIN; in a comment is not a transaction wrapper',
      'BEGIN;',
      'CREATE TABLE example (id integer);',
      'COMMIT;'
    ].join('\n');
    const script = `import { stripTransactionWrappers } from ${JSON.stringify(pathToFileURL(runner).href)}; console.log(stripTransactionWrappers(${JSON.stringify(sql)}));`;
    const output = execFileSync(process.execPath, ['--input-type=module', '-e', script], { encoding: 'utf8' }).trimEnd();
    expect(output).toBe([
      '-- BEGIN; in a comment is not a transaction wrapper',
      'CREATE TABLE example (id integer);'
    ].join('\n'));
  });
});
