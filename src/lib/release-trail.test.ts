import { describe, expect, it } from 'vitest';
import {
  changedSinceLabel,
  compareVersions,
  countChanges,
  groupCounts,
  parseVersion,
  placeOnTrail,
  trailStep,
  type TrailRelease
} from './release-trail';

const release = (version: string, items: number[]): TrailRelease => ({
  version,
  groups: items.map((count, index) => ({
    label: ['Added', 'Changed', 'Fixed'][index] ?? 'Verified',
    items: Array.from({ length: count }, (_, item) => `item ${item}`)
  }))
});

const trail: TrailRelease[] = [
  release('0.3.42', [2, 2]), // 4
  release('0.3.41', [2, 1, 0, 2]), // 5, one empty group
  release('0.3.10', [1]), // 1
  release('0.3.9', [3, 1]) // 4
];

describe('release trail', () => {
  it('parses a version into numbers, with or without a v and a tag', () => {
    expect(parseVersion('v0.3.42')).toEqual([0, 3, 42]);
    expect(parseVersion('0.3.42')).toEqual([0, 3, 42]);
    expect(parseVersion('0.3.42-rc.1')).toEqual([0, 3, 42]);
    expect(parseVersion('0.3.42+build.7')).toEqual([0, 3, 42]);
  });

  it('orders 0.3.9 before 0.3.10 — the reason strings are not compared', () => {
    expect(compareVersions('0.3.9', '0.3.10')).toBeLessThan(0);
    expect(compareVersions('0.3.10', '0.3.9')).toBeGreaterThan(0);
    expect(compareVersions('0.3.42', '0.3.42')).toBe(0);
    expect(compareVersions('v0.3.42', '0.3.42')).toBe(0);
    // A shorter version is padded with zeros, so `1.0` and `1.0.0` are the same release.
    expect(compareVersions('1.0', '1.0.0')).toBe(0);
    expect(compareVersions('1.0.1', '1.0')).toBeGreaterThan(0);
  });

  it('counts every bullet, and skips an empty group in the per-group counts', () => {
    expect(countChanges(trail[1])).toBe(5);
    expect(groupCounts(trail[1])).toEqual([
      { label: 'Added', count: 2 },
      { label: 'Changed', count: 1 },
      { label: 'Verified', count: 2 }
    ]);
  });

  it('marks the newest release as the one being run', () => {
    const place = placeOnTrail(trail, '0.3.42');
    expect(place.state).toBe('latest');
    expect(place.index).toBe(0);
    expect(place.newerReleases).toBe(0);
    expect(place.changesSince).toBe(0);
  });

  it('counts the releases and changes a reader is behind', () => {
    const place = placeOnTrail(trail, '0.3.41');
    expect(place.state).toBe('behind');
    expect(place.index).toBe(1);
    expect(place.newerReleases).toBe(1);
    expect(place.changesSince).toBe(4);
  });

  it('places an older build correctly even though 0.3.9 sits below 0.3.10', () => {
    const place = placeOnTrail(trail, '0.3.9');
    expect(place.state).toBe('behind');
    expect(place.index).toBe(3);
    expect(place.newerReleases).toBe(3);
    expect(place.changesSince).toBe(4 + 5 + 1);
  });

  it('reports a build between two notes without inventing a marker', () => {
    // A cached tab on a version the page does not publish: no index, but the
    // distance is still right because it is computed by comparison.
    const place = placeOnTrail(trail, '0.3.20');
    expect(place.index).toBeNull();
    expect(place.state).toBe('behind');
    expect(place.newerReleases).toBe(2);
    expect(place.changesSince).toBe(4 + 5);
  });

  it('reports a build newer than the newest note rather than pointing at the wrong one', () => {
    const place = placeOnTrail(trail, '0.3.43');
    expect(place.state).toBe('ahead');
    expect(place.index).toBeNull();
    expect(place.newerReleases).toBe(0);
    expect(place.changesSince).toBe(0);
  });

  it('names the release each step followed, and null at the bottom of the page', () => {
    expect(trailStep(trail, 0)).toEqual({ version: '0.3.42', previous: '0.3.41', changes: 4 });
    expect(trailStep(trail, 2)).toEqual({ version: '0.3.10', previous: '0.3.9', changes: 1 });
    expect(trailStep(trail, 3)).toEqual({ version: '0.3.9', previous: null, changes: 4 });
  });

  it('picks a plural form once, from both numbers', () => {
    expect(changedSinceLabel({ changes: 0, releases: 0 })).toBe('none');
    expect(changedSinceLabel({ changes: 4, releases: 1 })).toBe('one');
    expect(changedSinceLabel({ changes: 9, releases: 3 })).toBe('many');
  });

  it('holds for the real published notes', async () => {
    const { changelogReleases } = await import('./changelog.generated');
    // The build's own version, not a literal: a release that bumps package.json
    // before writing its section would otherwise fail here for being early.
    const { default: packageJson } = await import('../../package.json');
    const place = placeOnTrail(changelogReleases, packageJson.version);
    expect(place.state).toBe('latest');
    expect(place.index).toBe(0);
    // Newest-first is what every other function here assumes.
    for (let i = 1; i < changelogReleases.length; i++) {
      expect(
        compareVersions(changelogReleases[i - 1].version, changelogReleases[i].version)
      ).toBeGreaterThan(0);
    }
  });
});
