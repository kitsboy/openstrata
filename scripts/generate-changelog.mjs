#!/usr/bin/env node
/**
 * Generate `src/lib/changelog.generated.ts` from the repo's CHANGELOG.md, so the
 * public /changelog page publishes the changelog we already write instead of a
 * second, hand-maintained copy that drifts.
 *
 * Source of truth is the markdown BODY (`## [x.y.z] — date` sections with
 * `### Added / Changed / Fixed / Verified / Known issues` groups). Versions that
 * only exist in the front-matter `version_history` list (0.3.6–0.3.8, 0.3.11,
 * 0.3.12 — releases that never got a body section) are carried through as
 * summary-only entries rather than invented or dropped.
 *
 * Run with `node scripts/generate-changelog.mjs`; CI can assert freshness with
 * the sync test in src/lib/changelog.test.ts.
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const source = fs.readFileSync(path.join(root, 'CHANGELOG.md'), 'utf8');
const lines = source.split('\n');

const VERSION_HEADING = /^## \[([\d.]+)\]\s*[—-]\s*(\d{4}-\d{2}-\d{2})/;
const GROUP_HEADING = /^### (.+?)\s*$/;
const BULLET = /^[-*]\s+(.*)$/;

/** Strip the inline markdown that a plain-text page would otherwise show raw. */
function plain(text) {
  return text
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // [label](url) -> label
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

// ---------------------------------------------------------------------------
// 1. Body sections
// ---------------------------------------------------------------------------
const releases = [];
let current = null;
let group = null;

for (const line of lines) {
  const heading = VERSION_HEADING.exec(line);
  if (heading) {
    current = { version: heading[1], date: heading[2], groups: [] };
    releases.push(current);
    group = null;
    continue;
  }
  if (!current) continue;

  if (line.startsWith('## ')) {
    // A version marker we do not recognise — stop attributing bullets to it.
    current = null;
    group = null;
    continue;
  }

  const groupHeading = GROUP_HEADING.exec(line);
  if (groupHeading) {
    group = { label: plain(groupHeading[1]), items: [] };
    current.groups.push(group);
    continue;
  }

  const bullet = BULLET.exec(line);
  if (bullet && group) {
    group.items.push(plain(bullet[1]));
    continue;
  }

  // A wrapped continuation line belongs to the bullet above it.
  if (group && group.items.length > 0 && line.trim() && /^\s{2,}\S/.test(line)) {
    const last = group.items.length - 1;
    group.items[last] = plain(`${group.items[last]} ${line.trim()}`);
  }
}

for (const release of releases) {
  release.groups = release.groups
    .map((g) => ({ label: g.label, items: g.items.filter(Boolean) }))
    .filter((g) => g.items.length > 0);
}

// ---------------------------------------------------------------------------
// 2. Front-matter `version_history` entries with no body section
// ---------------------------------------------------------------------------
// The file opens with a `---` front-matter delimiter, so the closing one is the
// next line that is exactly `---`.
const closingDelimiter = lines.findIndex((line, index) => index > 0 && line.trim() === '---');
const frontLines = closingDelimiter === -1 ? [] : lines.slice(1, closingDelimiter);

/** Collect a `summary:` value, either inline-quoted or a `>-` block scalar. */
function readSummary(startIndex) {
  // Entries may carry a `- ` list marker before the key, so allow it.
  const inline = /^\s*-?\s*summary:\s*"(.*)"\s*$/.exec(frontLines[startIndex]);
  if (inline) return plain(inline[1]);
  if (!/^\s*-?\s*summary:\s*[>|]/.test(frontLines[startIndex])) return null;

  // Block-scalar content is everything indented deeper than the `summary:` key
  // itself. Comparing against the key's own indent (not the enclosing list
  // item's) is what keeps a shallower sibling entry from being swallowed: some
  // entries sit at column 0 with a `- ` marker, others are indented two spaces.
  const keyIndent = frontLines[startIndex].length - frontLines[startIndex].trimStart().length;
  const parts = [];
  for (let i = startIndex + 1; i < frontLines.length; i++) {
    const line = frontLines[i];
    if (!line.trim()) break;
    const leading = line.length - line.trimStart().length;
    if (leading < keyIndent) break;
    if (/^\s*-?\s*version:/.test(line)) break;
    parts.push(line.trim());
  }
  return plain(parts.join(' '));
}

const inBody = new Set(releases.map((release) => release.version));
const summaryOnly = [];
for (let i = 0; i < frontLines.length; i++) {
  const match = /^(\s*)-?\s*version:\s*([\d.]+)\s*$/.exec(frontLines[i]);
  if (!match) continue;
  const version = match[2];
  if (inBody.has(version)) continue;
  let summary = null;
  for (let j = i + 1; j < Math.min(i + 6, frontLines.length); j++) {
    if (/^\s*-?\s*version:/.test(frontLines[j])) break;
    if (/^\s*-?\s*summary:/.test(frontLines[j])) {
      summary = readSummary(j);
      break;
    }
  }
  summaryOnly.push({ version, summary });
}

// ---------------------------------------------------------------------------
// 3. Order + emit
// ---------------------------------------------------------------------------
const semver = (version) => version.split('.').map((part) => Number.parseInt(part, 10) || 0);
const compare = (a, b) => {
  const left = semver(a);
  const right = semver(b);
  for (let i = 0; i < Math.max(left.length, right.length); i++) {
    if ((left[i] ?? 0) !== (right[i] ?? 0)) return (right[i] ?? 0) - (left[i] ?? 0);
  }
  return 0;
};

releases.sort((a, b) => compare(a.version, b.version));
summaryOnly.sort((a, b) => compare(a.version, b.version));

const body = `// AUTO-GENERATED from CHANGELOG.md — do not edit by hand.
// Regenerate with: node scripts/generate-changelog.mjs
// src/lib/changelog.test.ts fails if this file drifts from the changelog.

export type ChangelogGroup = { label: string; items: string[] };

export type ChangelogRelease = {
  version: string;
  /** ISO date, or null for a release whose notes never got a body section. */
  date: string | null;
  groups: ChangelogGroup[];
};

/** Releases with full notes, newest first. */
export const changelogReleases: ChangelogRelease[] = ${JSON.stringify(releases, null, 2)};

/** Earlier releases recorded only in the changelog's version history. */
export const changelogEarlyReleases: Array<{ version: string; summary: string | null }> = ${JSON.stringify(summaryOnly, null, 2)};
`;

const target = path.join(root, 'src', 'lib', 'changelog.generated.ts');
fs.writeFileSync(target, body);
console.log(
  `Generated ${path.relative(root, target)}: ${releases.length} releases with notes, ` +
    `${summaryOnly.length} summary-only, ${releases.reduce((n, r) => n + r.groups.reduce((m, g) => m + g.items.length, 0), 0)} bullet items.`
);
