/**
 * Per-site receive labels.
 *
 * Cam's mandate (2026-09-18): every incoming payment must carry a label that
 * names the **site** it belongs to, so money can never be confused between
 * projects. Before this module the label on a rail invoice was the rail's own
 * display name — `'Lightning Network'`, `'Bitcoin (on-chain)'` — which is the
 * same string every Give A Bit project would produce. A treasurer looking at
 * their wallet, or an operator reconciling a node, saw an incoming payment with
 * no way to tell OpenStrata from Satohash from a personal transfer.
 *
 * So the label is now namespaced:
 *
 *     OST  northgate  U302  pay-9142
 *     ^^^  ^^^^^^^^^  ^^^^  ^^^^^^^^^
 *     site  council   unit   request
 *
 * Design rules, each of which is a test:
 *
 *  - **The site code comes first and is never optional.** `assertReceiveLabel`
 *    refuses a label that does not carry the expected site code, so a rail seam
 *    can hard-fail rather than quietly accept cross-project money.
 *  - **The label is derived, never stored.** It is a pure function of keys the
 *    payment request already persists (`communityId`, `unitRef`, `refId`), so
 *    it cannot drift out of step with the row and needs no migration.
 *  - **Plain ASCII, single-spaced, length-capped.** Wallets and node memos
 *    truncate; a label that ends in an ellipsis in the wallet is a label that
 *    failed at its one job. Every segment is sanitized and capped before it is
 *    joined, and the whole label is capped again at the end.
 *  - **The site code table is explicit, not derived.** Deriving a code from a
 *    slug risks two projects colliding on the same three letters; the table is
 *    the one place that can be checked by eye.
 */

import type { Rail } from './rails.js';

/** The site's own slug — the key into the family table. */
export const SITE_SLUG = 'openstrata';

/**
 * Site codes across the Give A Bit family. Explicit so a collision is a visible
 * edit rather than a coincidence of spelling. Unknown sites fall back to the
 * first four letters of their slug, uppercased.
 */
export const FAMILY_SITE_CODES: Record<string, string> = {
  openstrata: 'OST',
  satohash: 'SATO',
  tadbuy: 'TAD',
  motopass: 'MOTO',
  sherpacarta: 'SHER',
  stranded: 'STRA',
  katoa: 'KATO',
  lindala: 'LIND',
  camtaylor: 'CAMD',
  btcminiscript: 'BTCM',
  giveabit: 'GAB'
};

/** Wallets and node memos both start truncating around this length. */
export const MAX_RECEIVE_LABEL_LENGTH = 120;

const MAX_SEGMENT = 34;

export interface ReceiveLabelParts {
  /** Site slug, e.g. `openstrata`. */
  site: string;
  /** Council / community id. */
  communityId: string;
  /** Unit reference in any accepted spelling (`unit-302`, `U-302`, `302`). */
  unitRef: string;
  /** Caller-supplied request id — the thing being paid for. */
  refId: string;
}

export interface ParsedReceiveLabel {
  siteCode: string;
  communityId: string;
  unitRef: string;
  refId: string;
}

/** Uppercase site code for a slug (`openstrata` → `OST`). */
export function siteCodeFor(slug: string): string {
  const key = slug.trim().toLowerCase();
  const known = FAMILY_SITE_CODES[key];
  if (known) return known;
  const letters = key.replace(/[^a-z0-9]/g, '');
  if (!letters) throw new Error('site code needs a slug with letters in it');
  return letters.slice(0, 4).toUpperCase();
}

/**
 * One label segment: ASCII letters, digits, dot, underscore and hyphen only.
 * Anything else becomes a hyphen, runs collapse, and the result is trimmed and
 * capped. A segment that sanitizes away to nothing falls back to `x` rather
 * than silently shortening the label structure.
 */
export function sanitizeSegment(value: string): string {
  const cleaned = value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9._-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^[-.]+|[-.]+$/g, '');
  if (!cleaned) return 'x';
  return cleaned.length > MAX_SEGMENT ? cleaned.slice(0, MAX_SEGMENT).replace(/[-.]+$/, '') : cleaned;
}

/** `unit-302` / `U-302` / `302` → `U302`, so a wallet shows one spelling. */
export function unitToken(unitRef: string): string {
  const bare = sanitizeSegment(unitRef)
    .replace(/^unit[-_]?/i, '')
    .replace(/^u[-_]?/i, '');
  return `U${(bare || 'x').toUpperCase()}`.slice(0, MAX_SEGMENT);
}

/**
 * The label a payment carries everywhere: the node memo, the on-chain receive
 * label, and the line a council sees beside a transfer instruction.
 */
export function receiveLabelFor(parts: ReceiveLabelParts): string {
  const code = siteCodeFor(parts.site);
  const label = [
    code,
    sanitizeSegment(parts.communityId),
    unitToken(parts.unitRef),
    sanitizeSegment(parts.refId)
  ].join(' ');
  return label.length > MAX_RECEIVE_LABEL_LENGTH
    ? label.slice(0, MAX_RECEIVE_LABEL_LENGTH).trim()
    : label;
}

/** Read a label back. Returns null rather than throwing: labels arrive from humans. */
export function parseReceiveLabel(label: string): ParsedReceiveLabel | null {
  const parts = label.trim().split(/\s+/);
  if (parts.length < 4) return null;
  const [siteCode, communityId, unit, ...rest] = parts;
  if (!/^[A-Z0-9]{2,6}$/.test(siteCode)) return null;
  if (!/^U[^\s]*$/.test(unit)) return null;
  return { siteCode, communityId, unitRef: unit.slice(1), refId: rest.join(' ') };
}

/** Does this label belong to `siteCode`? The check a rail seam needs. */
export function isReceiveLabelFor(label: string, siteSlug: string): boolean {
  const expected = siteCodeFor(siteSlug);
  return label.trim().split(/\s+/)[0] === expected;
}

/**
 * Hard guard for the moment money starts moving: a label that does not carry
 * this site's code is refused, never silently rewritten.
 */
export function assertReceiveLabelFor(label: string, siteSlug: string): void {
  if (!isReceiveLabelFor(label, siteSlug)) {
    throw new Error(
      `receive label '${label}' is not tagged for site '${siteSlug}' (expected prefix '${siteCodeFor(
        siteSlug
      )}')`
    );
  }
}

/** Convenience for callers that quote a payment and want the label + rail name together. */
export function labelForQuote(
  parts: ReceiveLabelParts & { rail?: Rail }
): { label: string; siteCode: string } {
  return { label: receiveLabelFor(parts), siteCode: siteCodeFor(parts.site) };
}
