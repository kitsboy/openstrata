import { describe, expect, it } from 'vitest';
import {
  isComplete,
  nextStep,
  parseProgress,
  serializeProgress,
  setupPercent,
  toggleStep
} from './setup';

describe('parseProgress', () => {
  it('reads a well-formed blob', () => {
    expect(parseProgress('{"done":["units","funds"],"hidden":true}')).toEqual({
      done: ['units', 'funds'],
      hidden: true
    });
  });

  it('degrades to empty for missing, empty or malformed input', () => {
    expect(parseProgress(null)).toEqual({ done: [], hidden: false });
    expect(parseProgress(undefined)).toEqual({ done: [], hidden: false });
    expect(parseProgress('')).toEqual({ done: [], hidden: false });
    expect(parseProgress('{not json')).toEqual({ done: [], hidden: false });
    expect(parseProgress('"a string"')).toEqual({ done: [], hidden: false });
    expect(parseProgress('null')).toEqual({ done: [], hidden: false });
  });

  it('drops unknown steps and normalizes order', () => {
    expect(parseProgress('{"done":["month","nope","units",3]}')).toEqual({
      done: ['units', 'month'],
      hidden: false
    });
  });

  it('only treats an explicit true as hidden', () => {
    expect(parseProgress('{"done":[],"hidden":"yes"}').hidden).toBe(false);
    expect(parseProgress('{"done":[],"hidden":1}').hidden).toBe(false);
  });
});

describe('serializeProgress', () => {
  it('round-trips through parseProgress', () => {
    const progress = { done: ['units', 'month'] as const, hidden: true };
    const raw = serializeProgress({ done: [...progress.done], hidden: progress.hidden });
    expect(parseProgress(raw)).toEqual({ done: ['units', 'month'], hidden: true });
  });
});

describe('toggleStep', () => {
  it('ticks a step in canonical order regardless of tick order', () => {
    expect(toggleStep([], 'month')).toEqual(['month']);
    expect(toggleStep(['month'], 'units')).toEqual(['units', 'month']);
  });

  it('unticks a step that is already done', () => {
    expect(toggleStep(['units', 'funds'], 'units')).toEqual(['funds']);
  });

  it('does not mutate the input', () => {
    const done = ['units'] as const;
    toggleStep(done, 'funds');
    expect(done).toEqual(['units']);
  });
});

describe('nextStep', () => {
  it('points at the first unticked step', () => {
    expect(nextStep([])).toBe('units');
    expect(nextStep(['units'])).toBe('funds');
    expect(nextStep(['units', 'funds', 'bylaws'])).toBe('month');
  });

  it('returns null once setup is complete', () => {
    expect(nextStep(['units', 'funds', 'bylaws', 'month'])).toBeNull();
  });

  it('still points forward if a later step was ticked first', () => {
    expect(nextStep(['month'])).toBe('units');
  });
});

describe('setupPercent', () => {
  it('reports whole-number progress', () => {
    expect(setupPercent([])).toBe(0);
    expect(setupPercent(['units'])).toBe(25);
    expect(setupPercent(['units', 'funds'])).toBe(50);
    expect(setupPercent(['units', 'funds', 'bylaws'])).toBe(75);
    expect(setupPercent(['units', 'funds', 'bylaws', 'month'])).toBe(100);
  });
});

describe('isComplete', () => {
  it('is true only when every step is ticked', () => {
    expect(isComplete([])).toBe(false);
    expect(isComplete(['units', 'funds', 'bylaws'])).toBe(false);
    expect(isComplete(['units', 'funds', 'bylaws', 'month'])).toBe(true);
  });
});
