/**
 * The release trail on `/changelog`: where this build sits on the timeline, and
 * what changed between one release and the next.
 *
 * Two decisions are load-bearing.
 *
 * Versions are compared as numbers, not strings. `0.3.9` is older than `0.3.10`,
 * and a published page that ordered them the other way would put a fix above the
 * release that made it necessary. `compareVersions` splits on dots and compares
 * segment by segment, so it needs no dependency and no assumptions about how many
 * segments a version has.
 *
 * A build whose version has no note is a normal state, not an error. The site is
 * published from `package.json` and the notes are written by hand, so a build can
 * be newer than the newest note (a release committed before its notes) or older
 * than every note on this page (a cached tab, a pinned deployment). Neither is
 * allowed to render a marker pointing at the wrong release, so the placement is
 * `null` in those cases and the page says what it knows.
 */

export type TrailGroup = { label: string; items: unknown[] };
export type TrailRelease = { version: string; groups: TrailGroup[] };

export type RunningState = 'latest' | 'behind' | 'ahead';

export interface RunningPlace {
  /** Version being run, as published in `package.json`. */
  version: string;
  state: RunningState;
  /** Index of this build's own release in the list, or null when it has no note. */
  index: number | null;
  /** Releases published after this build. */
  newerReleases: number;
  /** Bullet items across those releases — the number of changes this reader has not seen. */
  changesSince: number;
}

/** `"v0.3.42"` → `[0, 3, 42]`. Anything after `-` or `+` is a pre-release/build tag and is dropped. */
export function parseVersion(version: string): number[] {
  const core = version.trim().replace(/^v/i, '').split(/[-+]/)[0];
  return core.split('.').map((part) => {
    const value = Number.parseInt(part, 10);
    return Number.isFinite(value) ? value : 0;
  });
}

/** Negative when `a` is older than `b`, positive when newer, 0 when equal. */
export function compareVersions(a: string, b: string): number {
  const left = parseVersion(a);
  const right = parseVersion(b);
  const length = Math.max(left.length, right.length);
  for (let i = 0; i < length; i++) {
    const delta = (left[i] ?? 0) - (right[i] ?? 0);
    if (delta !== 0) return delta;
  }
  return 0;
}

/** Every bullet in a release, across its groups. */
export function countChanges(release: TrailRelease): number {
  return release.groups.reduce((total, group) => total + group.items.length, 0);
}

/** How many bullets a release carries, per group, in the order the notes wrote them. */
export function groupCounts(release: TrailRelease): Array<{ label: string; count: number }> {
  return release.groups
    .filter((group) => group.items.length > 0)
    .map((group) => ({ label: group.label, count: group.items.length }));
}

/**
 * Where a build sits on the trail. `releases` must be newest-first — the order
 * `changelog.generated.ts` publishes.
 */
export function placeOnTrail(releases: TrailRelease[], runningVersion: string): RunningPlace {
  const exact = releases.findIndex((release) => compareVersions(release.version, runningVersion) === 0);
  const newer = releases.filter((release) => compareVersions(release.version, runningVersion) > 0);
  const changesSince = newer.reduce((total, release) => total + countChanges(release), 0);

  let state: RunningState = 'behind';
  if (exact === 0) state = 'latest';
  else if (newer.length === 0 && exact === -1) state = 'ahead';
  else if (newer.length === 0) state = 'latest';

  return {
    version: runningVersion,
    state,
    index: exact === -1 ? null : exact,
    newerReleases: newer.length,
    changesSince
  };
}

/**
 * The step into a release: which release it followed, and how much it changed.
 *
 * `previous` is null for the oldest release on the page, which is not a defect —
 * the notes below it are summary-only and this is where the trail begins.
 */
export function trailStep(
  releases: TrailRelease[],
  index: number
): { version: string; previous: string | null; changes: number } {
  const release = releases[index];
  return {
    version: release.version,
    previous: index + 1 < releases.length ? releases[index + 1].version : null,
    changes: countChanges(release)
  };
}

/** Same note for a count of releases and changes, so the page does not pluralize twice. */
export function changedSinceLabel(
  counts: { changes: number; releases: number }
): 'none' | 'one' | 'many' {
  if (counts.changes === 0) return 'none';
  return counts.releases === 1 ? 'one' : 'many';
}
