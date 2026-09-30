import { describe, it, expect } from 'vitest';
import { passwordStrength, passwordMeetsMinimum, isEmailLike } from './auth-strength';

describe('passwordStrength', () => {
  it('scores empty/short passwords as weak', () => {
    expect(passwordStrength('')).toBe(0);
    expect(passwordStrength('abc')).toBe(1);
    expect(passwordStrength('abcdefg')).toBe(1);
  });

  it('scores a mixed 8-char password as okay', () => {
    expect(passwordStrength('Abcd1234')).toBe(2); // length + mixed case
  });

  it('scores long mixed-case digit+symbol passwords as strong', () => {
    expect(passwordStrength('Strata2026!Strong')).toBe(3);
  });

  it('does not inflate a long but uniform password', () => {
    expect(passwordStrength('aaaaaaaaaaaa')).toBe(2); // long but no variety
  });
});

describe('passwordMeetsMinimum', () => {
  it('requires 8 characters', () => {
    expect(passwordMeetsMinimum('1234567')).toBe(false);
    expect(passwordMeetsMinimum('12345678')).toBe(true);
  });
});

describe('isEmailLike', () => {
  it('accepts normal addresses', () => {
    expect(isEmailLike('cam@example.com')).toBe(true);
    expect(isEmailLike('a.b+c@sub.example.co')).toBe(true);
  });

  it('rejects non-emails', () => {
    expect(isEmailLike('not-an-email')).toBe(false);
    expect(isEmailLike('')).toBe(false);
    expect(isEmailLike('a@b')).toBe(false);
    expect(isEmailLike('@example.com')).toBe(false);
  });
});
