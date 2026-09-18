import { describe, expect, it } from 'vitest';
import { journeyPercent, nextStep, parseReached, withStep } from './journey';

describe('parseReached', () => {
  it('reads a well-formed progress blob', () => {
    expect(parseReached('[1,2]')).toEqual([1, 2]);
  });

  it('returns nothing for missing, empty or malformed input', () => {
    expect(parseReached(null)).toEqual([]);
    expect(parseReached(undefined)).toEqual([]);
    expect(parseReached('')).toEqual([]);
    expect(parseReached('{not json')).toEqual([]);
    expect(parseReached('"a string"')).toEqual([]);
  });

  it('drops values outside the journey and normalizes order', () => {
    expect(parseReached('[3,"2",9,1,2]')).toEqual([1, 2, 3]);
  });
});

describe('withStep', () => {
  it('adds a new step in canonical order', () => {
    expect(withStep([3], 1)).toEqual([1, 3]);
  });

  it('is idempotent', () => {
    expect(withStep([1, 2], 2)).toEqual([1, 2]);
    expect(withStep(withStep([], 1), 1)).toEqual([1]);
  });

  it('does not mutate the input', () => {
    const reached = [1] as const;
    withStep(reached, 2);
    expect(reached).toEqual([1]);
  });
});

describe('nextStep', () => {
  it('points at the first unreached leg', () => {
    expect(nextStep([])).toBe(1);
    expect(nextStep([1])).toBe(2);
    expect(nextStep([1, 2])).toBe(3);
  });

  it('returns null once the journey is complete', () => {
    expect(nextStep([1, 2, 3])).toBeNull();
  });

  it('still points forward if a later leg was reached first', () => {
    expect(nextStep([3])).toBe(1);
  });
});

describe('journeyPercent', () => {
  it('reports whole-number progress', () => {
    expect(journeyPercent([])).toBe(0);
    expect(journeyPercent([1])).toBe(33);
    expect(journeyPercent([1, 2])).toBe(67);
    expect(journeyPercent([1, 2, 3])).toBe(100);
  });
});
