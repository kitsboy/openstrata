import { describe, expect, it } from 'vitest';
import {
  addDays,
  applyNoticeParams,
  daysBetween,
  DOCUMENT_SAMPLE_LABEL,
  docReference,
  findDocument,
  FORM_B_DAYS,
  NOTICE_WINDOWS,
  noticeTypes,
  printDocuments,
  type PrintDocument
} from './documents';

const notice = (): PrintDocument => {
  const doc = findDocument('notice');
  if (!doc) throw new Error('the notice template went missing');
  return doc;
};

describe('docReference', () => {
  it('builds a monthly reference code', () => {
    expect(docReference('OS-NTC', '2026-09-18')).toBe('OS-NTC-2026-09');
  });

  it('pads single-digit months', () => {
    expect(docReference('OS-MIN', '2026-01-04')).toBe('OS-MIN-2026-01');
  });

  it('degrades to the bare prefix rather than printing an Invalid Date', () => {
    expect(docReference('OS-FB', 'not-a-date')).toBe('OS-FB');
  });
});

describe('addDays', () => {
  it('adds the statutory window in UTC', () => {
    expect(addDays('2026-09-18', FORM_B_DAYS)).toBe('2026-09-25');
  });

  it('rolls over a month boundary', () => {
    expect(addDays('2026-09-28', 7)).toBe('2026-10-05');
  });

  it('returns the input unchanged for an unparseable date', () => {
    expect(addDays('', 7)).toBe('');
  });
});

describe('the print-ready document set', () => {
  it('has unique slugs', () => {
    const slugs = printDocuments.map((doc) => doc.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('covers notice, minutes and both conveyancing forms', () => {
    expect(printDocuments.map((doc) => doc.slug)).toEqual(['notice', 'minutes', 'form-b', 'form-f']);
  });

  it('gives every document the furniture a printed page needs', () => {
    for (const doc of printDocuments) {
      expect(doc.title.trim().length, `${doc.slug} title`).toBeGreaterThan(0);
      expect(doc.subtitle.trim().length, `${doc.slug} subtitle`).toBeGreaterThan(0);
      expect(doc.purpose.trim().length, `${doc.slug} purpose`).toBeGreaterThan(0);
      expect(doc.basis.trim().length, `${doc.slug} basis`).toBeGreaterThan(0);
      expect(doc.footer.trim().length, `${doc.slug} footer`).toBeGreaterThan(0);
      expect(docReference(doc.prefix, doc.issued)).toMatch(/^OS-[A-Z]+-\d{4}-\d{2}$/);
      expect(doc.blocks.length, `${doc.slug} blocks`).toBeGreaterThan(0);
    }
  });

  it('never leaves a table row the wrong shape', () => {
    for (const doc of printDocuments) {
      for (const block of doc.blocks) {
        if (block.kind !== 'table') continue;
        if (block.head.length > 1) {
          for (const row of block.rows) {
            expect(row.length, `${doc.slug}: "${row[0] ?? ''}"`).toBe(block.head.length);
          }
        }
        expect(block.rows.length, `${doc.slug} empty table`).toBeGreaterThan(0);
      }
    }
  });

  it('carries no unreviewed placeholder text', () => {
    const rendered = JSON.stringify(printDocuments);
    for (const marker of ['TODO', 'FIXME', 'lorem', 'Lorem', 'XXX', 'TBD']) {
      expect(rendered, `placeholder "${marker}"`).not.toContain(marker);
    }
  });

  it('states the notice windows this project already asserts', () => {
    const notice = findDocument('notice');
    expect(NOTICE_WINDOWS.council).toBe(7);
    expect(NOTICE_WINDOWS.agm).toBe(14);
    expect(notice?.basis).toContain('7 days');
    expect(notice?.basis).toContain('14');
  });

  it('keeps Form B inside the 7-day delivery window the backend enforces', () => {
    const formB = findDocument('form-b');
    expect(FORM_B_DAYS).toBe(7);
    expect(formB?.basis).toContain('within 7 days');
    expect(formB?.basis).toContain(addDays(formB?.issued ?? '', FORM_B_DAYS));
  });

  it('withholds Form F rather than issuing it when money is owing', () => {
    // The backend's rule: a balance above zero blocks the sale. The printed
    // certificate has to say so, or the paper contradicts the software.
    const formF = findDocument('form-f');
    const text = JSON.stringify(formF);
    expect(text).toContain('WITHHELD');
    expect(text).toContain('blocks the sale');
  });

  it('labels the set as a sample everywhere it is described', () => {
    expect(DOCUMENT_SAMPLE_LABEL).toMatch(/sample data/);
    expect(DOCUMENT_SAMPLE_LABEL).toMatch(/not a filed record/);
  });
});

describe('daysBetween', () => {
  it('counts whole days in UTC', () => {
    expect(daysBetween('2026-09-18', '2026-10-15')).toBe(27);
  });

  it('returns undefined rather than NaN for an unparseable date', () => {
    expect(daysBetween('2026-09-18', 'nope')).toBeUndefined();
  });
});

describe('applyNoticeParams', () => {
  it('leaves other documents completely alone', () => {
    const minutes = findDocument('minutes')!;
    expect(applyNoticeParams(minutes, { type: 'council' })).toBe(minutes);
  });

  it('uses the council’s own date, time, place and agenda', () => {
    const doc = applyNoticeParams(notice(), {
      type: 'council',
      when: '2026-10-15',
      time: '19:00',
      where: 'Clubhouse',
      agenda: 'Call to order\nRoof survey\nAdjournment'
    });
    const rendered = JSON.stringify(doc);
    expect(rendered).toContain('2026-10-15');
    expect(rendered).toContain('19:00 Pacific');
    expect(rendered).toContain('Clubhouse');
    expect(rendered).toContain('Roof survey');
    expect(doc.title).toBe('Notice of Council Meeting');
  });

  it('switches the title and the window with the meeting type', () => {
    const agm = applyNoticeParams(notice(), { type: 'agm', when: '2026-10-15' });
    expect(agm.title).toBe('Notice of Annual General Meeting');
    expect(agm.basis).toContain('14 days');
  });

  it('falls back to the council window for an unknown type', () => {
    const doc = applyNoticeParams(notice(), { type: 'annual-picnic', when: '2026-10-15' });
    expect(doc.title).toBe('Notice of Council Meeting');
  });

  it('flags a meeting called inside the statutory window, in the body and the footer', () => {
    // 3 days after the notice date, against a 7-day council window.
    const doc = applyNoticeParams(notice(), { type: 'council', when: '2026-09-21' });
    const rendered = JSON.stringify(doc);
    expect(rendered).toContain('under the 7-day window');
    expect(doc.footer).toContain('not met');
  });

  it('does not cry wolf when the window is met', () => {
    const doc = applyNoticeParams(notice(), { type: 'council', when: '2026-10-15' });
    expect(JSON.stringify(doc)).toContain('27 days ahead');
    expect(doc.footer).not.toContain('not met');
  });

  it('keeps the template values instead of printing empty lines', () => {
    const doc = applyNoticeParams(notice(), {});
    const table = doc.blocks.find((b) => b.kind === 'table' && b.rows.some((r) => r[0] === 'Date'));
    expect(JSON.stringify(table)).toContain('To be confirmed');
    expect(JSON.stringify(doc)).not.toContain('undefined');
  });

  it('collapses whitespace and caps hostile input', () => {
    const doc = applyNoticeParams(notice(), {
      when: '  2026-10-15  ',
      where: `  ${'x'.repeat(900)}  `,
      agenda: '\n\n  Call to order  \n\n'
    });
    const rendered = JSON.stringify(doc);
    expect(rendered).toContain('2026-10-15');
    expect(rendered).not.toContain('x'.repeat(300));
    // Blank agenda lines never become list items.
    const list = doc.blocks.find((b) => b.kind === 'list') as { items: string[] };
    expect(list.items).toEqual(['Call to order']);
  });

  it('exposes exactly the three meeting types it knows how to window', () => {
    expect(noticeTypes).toEqual(['council', 'agm', 'sgm']);
  });
});

describe('findDocument', () => {
  it('finds a document by slug', () => {
    expect(findDocument('minutes')?.title).toBe('Minutes of Council Meeting');
  });

  it('returns undefined for an unknown slug instead of throwing', () => {
    expect(findDocument('nonexistent')).toBeUndefined();
  });
});
