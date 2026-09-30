import { describe, it, expect } from 'vitest';
import { keywordRetriever, composeAnswer, type SourceRecord } from '../src/rosa/rosa.js';

const corpus: SourceRecord[] = [
  {
    citation: 'SPA s.146',
    title: 'Form K',
    url: 'https://x/146',
    text: 'Every strata corporation must request occupant information using Form K; a 14-day reminder loop triggers while forms are outstanding.'
  },
  {
    citation: 'SPA s.92-96',
    title: 'Funds',
    url: 'https://x/92',
    text: 'At least 10% of the annual contribution to the operating fund must be paid into the contingency reserve fund. Funds must not be co-mingled.'
  },
  {
    citation: 'SPA s.256',
    title: 'Form B',
    url: 'https://x/256',
    text: 'Form B must be delivered no later than 7 days after a request is received and must disclose arrears and pending cases.'
  }
];

describe('rosa keyword retrieval', () => {
  it('retrieves the most relevant citation first', async () => {
    const r = keywordRetriever(corpus);
    const hits = await r.retrieve('When must a Form B be delivered?', 3);
    expect(hits[0].source.citation).toBe('SPA s.256');
  });

  it('returns nothing for an unrelated question (fails closed)', async () => {
    const r = keywordRetriever(corpus);
    const hits = await r.retrieve('What is the weather in Vancouver?', 3);
    expect(hits).toHaveLength(0);
  });
});

describe('rosa strict composition', () => {
  it('refuses to answer when nothing is retrieved (no fabricated citation)', () => {
    const a = composeAnswer('looking for something unsearchable', [], {});
    expect(a.cited).toHaveLength(0);
    expect(a.answer).toMatch(/won't guess|no controlling source/i);
    expect(a.uncertain).toBe(true);
  });

  it('cites only retrieved sources', async () => {
    const r = keywordRetriever(corpus);
    const hits = await r.retrieve('contingency reserve fund percentage', 2);
    const a = composeAnswer('contingency reserve fund percentage', hits, {});
    expect(a.cited).toContain('SPA s.92-96');
    expect(a.uncertain).toBe(false);
  });

  it('flags uncertainty when the answer depends on unprovided facts', async () => {
    const r = keywordRetriever(corpus);
    const hits = await r.retrieve('Form B delivery deadline', 1);
    const a = composeAnswer('Form B deadline', hits, {});
    // 'days'/'deadline' present, but no triggerDate -> flagged uncertain.
    expect(a.uncertain).toBe(true);
    expect(a.answer).toMatch(/depends on dates\/facts/);
  });
});