/**
 * How your money is held — the long-form copy.
 *
 * **Why this is English here rather than 9 locales in `i18n.ts`:** the same rule
 * the print-ready documents (`documents.ts`) and the user manual (`manual.ts`)
 * already follow. Page chrome — headings, labels, the call to action — goes
 * through the catalog so a reader is oriented in their own language; body prose
 * stays English until there is a reviewed translation rather than a machine one.
 * Custody wording is the last place to accept a loose translation: "we never
 * hold your money" mistranslated is a materially false statement.
 *
 * The order is deliberate, and it is the order a skeptical treasurer asks in:
 * where the money sits, what we cannot do, what they can check, and what is not
 * live yet.
 */

export interface CustodyStep {
  title: string;
  body: string;
  icon: 'coins' | 'lock' | 'chart';
}

/** Three steps. In none of them does the money pass through us. */
export const custodySteps: CustodyStep[] = [
  {
    title: 'An owner pays',
    body: "The money leaves the owner's account and lands in an account the council controls — the strata corporation's own trust account at a BC bank or credit union, or an address the council's own keys control. We are not in the middle of it.",
    icon: 'coins'
  },
  {
    title: 'The council holds it',
    body: 'A council that uses Bitcoin holds it in a wallet that needs 3 of 5 signatures. Those five keys stay on the council’s own hardware wallets. OpenStrata watches the address and cannot spend from it.',
    icon: 'lock'
  },
  {
    title: 'OpenStrata writes it down',
    body: 'We record what happened — which unit, which fund, what date, how much — as one entry in a hash-chained ledger. Every entry carries a fingerprint of the entry before it, so an old one cannot be quietly changed or removed.',
    icon: 'chart'
  }
];

/**
 * The promise, stated as limits. Each line is something no employee, bug or
 * court order can make the software do.
 */
export const custodyLimits: string[] = [
  'Move money. We hold no keys, have no bank access and cannot sign a transaction.',
  'Change a posted ledger entry. It is a hash chain — editing one entry breaks every entry after it, and the verify button says so.',
  'Act as a custodian, an escrow, or a money transmitter. We never hold a balance of anyone’s money.',
  'See or use a wallet’s private keys. Registration is watch-only: we can see addresses and balances, and cannot spend from them.',
  'Take a cut of the money. We are paid for software — per unit, per month — never a percentage of what a building collects.'
];

/** The promise, made testable. Every line is a button, not a request to us. */
export const custodyChecks: string[] = [
  'Verify the ledger chain and read the fingerprint of every entry, in order.',
  'Export everything you have entered as plain JSON and CSV. Your records, not ours.',
  'Open a Form B or Form F and read the exact certificate the software would issue.',
  'Run the whole thing on your own server, with your own node, holding your own database.'
];

/**
 * Honestly, today. A trust page that only lists strengths is a page worth
 * discounting, so this section does not round in our favour.
 */
export const custodyToday: string[] = [
  'The website is live. The payment rails ship switched off, and a council switching one on does it deliberately, on its own node, with its own keys.',
  'No money has moved through OpenStrata yet. Every payment screen on this site is a preview running on sample data.',
  'The server that would handle live payments has not run on a public host yet. That is the last thing between this being a demo and a product, and it waits on the first council that wants it.'
];
