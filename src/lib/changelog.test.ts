import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import packageJson from '../../package.json';
import { changelogEarlyReleases, changelogReleases } from './changelog.generated';

const changelog = fs.readFileSync(path.join(process.cwd(), 'CHANGELOG.md'), 'utf8');
const headings = [...changelog.matchAll(/^## \[([\d.]+)\]/gm)].map((match) => match[1]);

describe('changelog.generated', () => {
  it('publishes every release that has a section in CHANGELOG.md', () => {
    const published = new Set(changelogReleases.map((release) => release.version));
    const missing = headings.filter((version) => !published.has(version));
    expect(missing).toEqual([]);
  });

  it('is freshly generated — regenerate with scripts/generate-changelog.mjs', () => {
    // Cheap drift check: the generated module must carry the version headings
    // found in the markdown. A stale file fails here before it reaches the site.
    expect(changelogReleases.length).toBe(headings.length);
  });

  it('leads with the shipped version', () => {
    expect(changelogReleases[0].version).toBe(packageJson.version);
  });

  it('is ordered newest first', () => {
    const order = changelogReleases.map((release) => release.version);
    const sorted = [...order].sort((a, b) => {
      const left = a.split('.').map(Number);
      const right = b.split('.').map(Number);
      for (let i = 0; i < Math.max(left.length, right.length); i++) {
        if ((left[i] ?? 0) !== (right[i] ?? 0)) return (right[i] ?? 0) - (left[i] ?? 0);
      }
      return 0;
    });
    expect(order).toEqual(sorted);
  });

  it('gives every published release dated notes with at least one item', () => {
    for (const release of changelogReleases) {
      expect(release.date, `${release.version} needs a date`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(release.groups.length, `${release.version} needs a group`).toBeGreaterThan(0);
      const items = release.groups.flatMap((group) => group.items);
      expect(items.length, `${release.version} needs an item`).toBeGreaterThan(0);
      expect(items.every((item) => item.length > 0)).toBe(true);
    }
  });

  it('keeps summary-only versions out of the dated list, and gives them a summary', () => {
    const dated = new Set(changelogReleases.map((release) => release.version));
    expect(changelogEarlyReleases.length).toBeGreaterThan(0);
    for (const release of changelogEarlyReleases) {
      expect(dated.has(release.version)).toBe(false);
      expect(release.summary, `${release.version} needs a summary`).toBeTruthy();
    }
  });

  it('strips raw markdown from published text', () => {
    const all = [
      ...changelogReleases.flatMap((release) => release.groups.flatMap((group) => group.items)),
      ...changelogEarlyReleases.map((release) => release.summary ?? '')
    ].join(' ');
    expect(all).not.toContain('**');
    expect(all).not.toContain('](');
  });
});
