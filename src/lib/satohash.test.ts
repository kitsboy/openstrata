import { describe, expect, it } from 'vitest';
import { sha256Hex, stampGuideUrl, stampHash, verifyUrl } from './satohash';

describe('sha256Hex', () => {
  it('matches the known empty-string digest', async () => {
    expect(await sha256Hex('')).toBe(
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    );
  });

  it('matches the known "abc" digest', async () => {
    expect(await sha256Hex('abc')).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'
    );
  });

  it('accepts Uint8Array input', async () => {
    const bytes = new TextEncoder().encode('abc');
    expect(await sha256Hex(bytes)).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'
    );
  });
});

describe('URL builders', () => {
  it('verifyUrl encodes the id', () => {
    expect(verifyUrl('abc 123')).toMatch(/\/verify\/abc%20123$/);
  });

  it('stampGuideUrl omits hash when none provided', () => {
    expect(stampGuideUrl()).toMatch(/\/stamp$/);
    expect(stampGuideUrl('deadbeef')).toMatch(/\/stamp\?hash=deadbeef$/);
  });
});

describe('stampHash validation', () => {
  it('rejects non-hex or wrong-length hashes without a network call', async () => {
    const short = await stampHash('abc');
    expect(short.ok).toBe(false);
    expect(short.error).toContain('64 hex');

    const nonHex = await stampHash('z'.repeat(64));
    expect(nonHex.ok).toBe(false);
    expect(nonHex.error).toContain('64 hex');
  });

  it('normalizes 0x-prefixed and uppercase hashes', async () => {
    const hash = '0x' + 'AB'.repeat(32);
    // Simulates the fetch path failing offline — validation must pass first.
    const result = await stampHash(hash, { signal: AbortSignal.timeout(1) });
    expect(result.error).not.toContain('64 hex');
  });
});
