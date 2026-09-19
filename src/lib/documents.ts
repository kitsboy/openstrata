/**
 * Print-ready documents — canonical English source.
 *
 * Councils hand each other paper. A bylaw case, a Form B and a set of minutes
 * all end up signed, filed and mailed, so this is the one part of the product
 * that has to survive leaving the browser. Long-form document copy lives here
 * for the same reason the manual and the legal library keep their own modules:
 * one authoring home, one place to review the wording.
 *
 * Honesty rules for anything added here:
 *  - The document set is a TEMPLATE with sample data, and every surface that
 *    renders it says so. Nothing here pretends to be a filed record.
 *  - Statutory windows are the ones this project already asserts elsewhere
 *    (AGM 14 days, council 7 days — see `noticeHint` in the i18n catalog; Form
 *    B's 7-day delivery window matches `FORM_B_DAYS` in the backend). No new
 *    legal claims are invented here.
 *  - Form F is WITHHELD, not issued, whenever a unit owes money. That is the
 *    backend's rule and the printed certificate must not contradict it.
 */

export type DocBlock =
  | { kind: 'heading'; text: string }
  | { kind: 'para'; text: string }
  | { kind: 'list'; items: string[]; ordered?: boolean }
  | { kind: 'table'; head: string[]; rows: string[][]; note?: string }
  | { kind: 'note'; text: string }
  | { kind: 'signatures'; rows: { role: string; name: string }[] };

export type PrintDocument = {
  slug: string;
  /** Reference prefix, combined with the issue month to form the ref code. */
  prefix: string;
  title: string;
  subtitle: string;
  issued: string;
  /** What the document is for, in one line, printed under the title. */
  purpose: string;
  /** The statutory window or bylaw hook it exists to satisfy. */
  basis: string;
  blocks: DocBlock[];
  /** Printed at the foot of every page. */
  footer: string;
};

export type Organization = {
  name: string;
  address: string;
  contact: string;
  registration: string;
};

/** The letterhead. Sample data, and labelled as such wherever it is rendered. */
export const documentOrganization: Organization = {
  name: 'Seaside Gardens Strata Corporation',
  address: '1234 Maple Street, Vancouver, BC V6B 1A1',
  contact: 'council@seasidegardens.example · BCFSA licence #000000',
  registration: 'SPA registration pending · incorporated 2019'
};

/** Sample data marker, so no screen can present a template as a real record. */
export const DOCUMENT_SAMPLE_LABEL = 'Template preview — sample data, not a filed record';

/**
 * `docReference('OS-NTC', '2026-09-18')` → `OS-NTC-2026-09`.
 *
 * The month is the unit of reference on purpose: a council files by month, and
 * a monthly code stays stable when a document is reissued inside the period.
 */
export function docReference(prefix: string, issuedIso: string): string {
  const date = new Date(`${issuedIso}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return prefix;
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${prefix}-${date.getUTCFullYear()}-${month}`;
}

/** Delivery deadline = issue date + the statutory window. Mirrors the backend. */
export function addDays(iso: string, days: number): string {
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return iso;
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** The statutory windows this project already asserts. */
export const NOTICE_WINDOWS = { agm: 14, special: 14, council: 7 } as const;
export const FORM_B_DAYS = 7;

const ISSUED = '2026-09-18';

export const printDocuments: PrintDocument[] = [
  {
    slug: 'notice',
    prefix: 'OS-NTC',
    title: 'Notice of Council Meeting',
    subtitle: 'Seaside Gardens Strata Corporation',
    issued: ISSUED,
    purpose: 'Tells every council member when and where the meeting is, and what will be decided.',
    basis: `Council meetings need ${NOTICE_WINDOWS.council} days of advance notice. AGMs and special general meetings need ${NOTICE_WINDOWS.agm}.`,
    blocks: [
      {
        kind: 'para',
        text: 'Notice is given to all council members that a meeting of the council of Seaside Gardens Strata Corporation will be held as follows.'
      },
      {
        kind: 'table',
        head: ['', ''],
        rows: [
          ['Date', 'Thursday, 15 October 2026'],
          ['Time', '19:00 Pacific'],
          ['Place', 'Clubhouse meeting room, 1234 Maple Street (and on video)'],
          ['Notice given', '18 September 2026 — 27 days ahead of the meeting']
        ]
      },
      { kind: 'heading', text: 'Agenda' },
      {
        kind: 'list',
        ordered: true,
        items: [
          'Call to order and attendance',
          'Approval of the minutes of the previous council meeting',
          'Treasurer’s report and operating fund position',
          'Reserve fund expenditure — roof survey',
          'Bylaw enforcement: file 2026-09-B',
          'New business',
          'Adjournment'
        ]
      },
      {
        kind: 'note',
        text: 'A council member who cannot attend must let the secretary know before the meeting so quorum can be confirmed. Council meetings are not open to owners unless the bylaws say otherwise.'
      },
      {
        kind: 'signatures',
        rows: [
          { role: 'Issued by', name: 'Secretary, Seaside Gardens Strata Corporation' },
          { role: 'Posted', name: 'Clubhouse notice board and strata portal' }
        ]
      }
    ],
    footer: 'Draft notice — review against your bylaws and the Strata Property Act before posting.'
  },
  {
    slug: 'minutes',
    prefix: 'OS-MIN',
    title: 'Minutes of Council Meeting',
    subtitle: 'Seaside Gardens Strata Corporation',
    issued: ISSUED,
    purpose: 'The record of what the council decided, who was present, and what the bylaws required.',
    basis: 'Minutes are the council’s own record. They should be approved at the next meeting, and they are what a CRT or court reads first.',
    blocks: [
      {
        kind: 'table',
        head: ['', ''],
        rows: [
          ['Meeting', 'Regular council meeting'],
          ['Held', '15 October 2026, 19:00 Pacific'],
          ['Place', 'Clubhouse meeting room, 1234 Maple Street'],
          ['Present', '4 of 5 council members'],
          ['Quorum', 'Met — majority of council present']
        ]
      },
      { kind: 'heading', text: '1. Call to order' },
      { kind: 'para', text: 'The president called the meeting to order at 19:02 and confirmed quorum.' },
      { kind: 'heading', text: '2. Previous minutes' },
      {
        kind: 'para',
        text: 'The minutes of 17 September 2026 were read. Motion to approve carried unanimously.'
      },
      { kind: 'heading', text: '3. Treasurer’s report' },
      {
        kind: 'para',
        text: 'The treasurer reported the operating fund position and the year-to-date variance against the approved budget.'
      },
      // Deliberately written as a decision, not as advice: minutes record what
      // happened, and a motion that was not put to a vote cannot be recorded.
      {
        kind: 'note',
        text: 'Each motion below is recorded as it was moved, seconded and decided. An item discussed without a motion is recorded as discussion only — it is not a decision.'
      },
      { kind: 'heading', text: '4. Reserve fund expenditure — roof survey' },
      {
        kind: 'list',
        ordered: true,
        items: [
          'Moved: that the council authorise up to $6,500 from the reserve fund for a roof condition survey. Seconded. Carried 4–0.'
        ]
      },
      { kind: 'heading', text: '5. Bylaw enforcement: file 2026-09-B' },
      {
        kind: 'para',
        text: 'The council reviewed the evidence bundle and the correspondence on file, and confirmed the process to date.'
      },
      { kind: 'heading', text: '6. New business' },
      { kind: 'para', text: 'No new business was raised.' },
      { kind: 'heading', text: '7. Adjournment' },
      { kind: 'para', text: 'The meeting adjourned at 20:31.' },
      {
        kind: 'signatures',
        rows: [
          { role: 'Recorded by', name: 'Secretary, Seaside Gardens Strata Corporation' },
          { role: 'Approved at', name: 'Next regular council meeting' }
        ]
      }
    ],
    footer: 'Draft minutes — not approved until the council approves them at the next meeting.'
  },
  {
    slug: 'form-b',
    prefix: 'OS-FB',
    title: 'Form B — Information Certificate',
    subtitle: 'Seaside Gardens Strata Corporation · unit 101',
    issued: ISSUED,
    purpose:
      'The disclosure package a buyer’s lawyer asks for before completion. It is the seller’s obligation to deliver it.',
    basis: `Must be delivered within ${FORM_B_DAYS} days of the request. Issue date ${ISSUED} — deliver by ${addDays(ISSUED, FORM_B_DAYS)}.`,
    blocks: [
      { kind: 'heading', text: 'Request' },
      {
        kind: 'table',
        head: ['', ''],
        rows: [
          ['Unit', '101'],
          ['Requested by', 'Purchaser’s conveyancer'],
          ['Requested on', '16 September 2026'],
          ['Delivery deadline', `${addDays(ISSUED, FORM_B_DAYS)} (7 days)`]
        ]
      },
      { kind: 'heading', text: 'Disclosure' },
      {
        kind: 'table',
        head: ['Item', 'Detail'],
        rows: [
          ['Monthly strata fee', '$412.00, payable on the 1st'],
          ['Balance owing', '$0.00 — unit is current'],
          ['Arrears', 'None recorded'],
          ['Reserve fund', 'Contributions current; fund statement attached'],
          ['Contingency reserve fund', 'Balance disclosed in the attached statement'],
          ['Pending claims or suits', 'None recorded by the corporation'],
          ['Bylaws', 'Standard bylaws as filed, plus filed amendments (attached)'],
          ['Depreciation report', 'Attached, with the s.94 disclosure if applicable'],
          ['Parking and storage', '1 parking stall, 1 storage locker assigned'],
          ['Insurance', 'Common property per the attached certificate']
        ]
      },
      {
        kind: 'note',
        text: 'Items that do not apply are shown as “None recorded” rather than omitted, so a reader can see the question was asked. Do not remove a line — the form is a disclosure, and a blank line reads as an answer either way.'
      },
      {
        kind: 'signatures',
        rows: [
          { role: 'Issued by', name: 'Authorised council representative' },
          { role: 'Date issued', name: ISSUED }
        ]
      }
    ],
    footer:
      'Draft Form B — verify every figure against the corporation’s records before delivery.'
  },
  {
    slug: 'form-f',
    prefix: 'OS-FF',
    title: 'Form F — Certificate of Payment',
    subtitle: 'Seaside Gardens Strata Corporation · unit 101',
    issued: ISSUED,
    purpose:
      'Certifies that a unit owes nothing, which is what lets a sale complete. If money is owing, the certificate is withheld.',
    basis: 'A certificate may only be issued when the unit balance is nil. A balance above $0 blocks the sale until it is cleared.',
    blocks: [
      { kind: 'heading', text: 'Certificate' },
      {
        kind: 'table',
        head: ['', ''],
        rows: [
          ['Unit', '101'],
          ['Registered owner', 'On title'],
          ['Strata fees', 'Paid in full to 30 September 2026'],
          ['Special levies', 'None outstanding'],
          ['Interest and costs', 'None outstanding'],
          ['Total owing', '$0.00'],
          ['State', 'Issued']
        ]
      },
      {
        kind: 'note',
        text: 'If the total owing were above $0.00 this certificate would read WITHHELD instead of Issued, and would stop a completion. That behaviour is deliberate: the certificate is a statement of fact, not a courtesy.'
      },
      { kind: 'heading', text: 'Withheld example — for reference only' },
      {
        kind: 'table',
        head: ['Item', 'Detail'],
        rows: [
          ['Total owing', '$418.20'],
          ['State', 'WITHHELD'],
          ['Reason', 'Strata fees outstanding for one month plus interest'],
          ['Effect', 'Sale does not complete until the balance is cleared']
        ],
        note: 'This second table is an illustration of the withheld state. It is not part of the certificate above.'
      },
      {
        kind: 'signatures',
        rows: [
          { role: 'Issued by', name: 'Authorised council representative' },
          { role: 'Date issued', name: ISSUED }
        ]
      }
    ],
    footer: 'Draft certificate — confirm the unit balance on the day of issue, not the day of request.'
  }
];

export const findDocument = (slug: string): PrintDocument | undefined =>
  printDocuments.find((doc) => doc.slug === slug);

/* ---------------------------------------------------------------------------
 * The council's own meeting details.
 *
 * The dashboard's notice builder lets a council type its date, place and
 * agenda. Rather than render a second, hand-written print page (which is what
 * it used to do, into a popup with inline styles), it hands those values to
 * this module through the URL and the one printable document does the rest.
 * ------------------------------------------------------------------------- */

export type NoticeInput = {
  type?: string;
  when?: string;
  time?: string;
  where?: string;
  agenda?: string;
};

const NOTICE_TYPES = {
  council: {
    label: 'Council meetings',
    title: 'Notice of Council Meeting',
    days: NOTICE_WINDOWS.council
  },
  agm: {
    label: 'Annual general meetings',
    title: 'Notice of Annual General Meeting',
    days: NOTICE_WINDOWS.agm
  },
  sgm: {
    label: 'Special general meetings',
    title: 'Notice of Special General Meeting',
    days: NOTICE_WINDOWS.special
  }
} as const;

export type NoticeType = keyof typeof NOTICE_TYPES;
export const noticeTypes = Object.keys(NOTICE_TYPES) as NoticeType[];

/** Whole days from `from` to `to`; undefined when either date is unparseable. */
export function daysBetween(from: string, to: string): number | undefined {
  const start = Date.parse(`${from}T00:00:00Z`);
  const end = Date.parse(`${to}T00:00:00Z`);
  if (Number.isNaN(start) || Number.isNaN(end)) return undefined;
  return Math.round((end - start) / 86_400_000);
}

/** Query-string values are plain strings, so trim, collapse and cap them. */
const clip = (value: string | undefined, max: number): string =>
  (value ?? '').replace(/\s+/g, ' ').trim().slice(0, max);

/**
 * Applies a council's own meeting details to the notice template, returning a
 * new document. Anything missing stays as the template value rather than
 * becoming an empty line, and a meeting inside the statutory window is labelled
 * loudly in both the body and the footer instead of being quietly accepted.
 */
export function applyNoticeParams(doc: PrintDocument, input: NoticeInput): PrintDocument {
  if (doc.slug !== 'notice') return doc;

  const requested = (input.type ?? '').toLowerCase() as NoticeType;
  const config = NOTICE_TYPES[requested] ?? NOTICE_TYPES.council;

  const when = clip(input.when, 60);
  const time = clip(input.time, 20);
  const where = clip(input.where, 200);
  const agendaLines = (input.agenda ?? '')
    .split('\n')
    .map((line) => clip(line, 200))
    .filter(Boolean)
    .slice(0, 30);

  const noticeDays = when ? daysBetween(doc.issued, when) : undefined;
  const met = noticeDays !== undefined && noticeDays >= config.days - 1;

  let windowLine = `Not yet checked against the ${config.days}-day window`;
  if (noticeDays !== undefined) {
    windowLine = met
      ? `Notice dated ${doc.issued} — ${noticeDays} days ahead of the meeting`
      : `Notice dated ${doc.issued} — ${noticeDays} days, under the ${config.days}-day window`;
  }

  const rows: string[][] = [
    ['Date', when || 'To be confirmed'],
    ['Time', time ? `${time} Pacific` : 'To be confirmed'],
    ['Place', where || 'To be confirmed'],
    ['Notice given', windowLine]
  ];

  // Walk the blocks by what they are, not by index, so the template can be
  // reordered without silently patching the wrong table.
  let afterAgendaHeading = false;
  const blocks: DocBlock[] = doc.blocks.map((block) => {
    if (block.kind === 'heading' && block.text.toLowerCase() === 'agenda') {
      afterAgendaHeading = true;
      return block;
    }
    if (block.kind === 'table' && block.rows.some((row) => row[0] === 'Date')) {
      return { kind: 'table' as const, head: block.head, rows };
    }
    if (afterAgendaHeading && block.kind === 'list' && agendaLines.length > 0) {
      return { kind: 'list' as const, ordered: true, items: agendaLines };
    }
    return block;
  });

  return {
    ...doc,
    title: config.title,
    basis: `${config.label} need ${config.days} days of advance notice.`,
    footer: met || noticeDays === undefined
      ? doc.footer
      : `${doc.footer} The ${config.days}-day window is not met — this meeting may not be validly called.`,
    blocks
  };
}
