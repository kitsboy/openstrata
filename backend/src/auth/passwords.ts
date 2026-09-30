/**
 * Password hashing with Node's built-in `scrypt` (no argon2 dependency).
 *
 * Storage format: `scrypt$<salt-hex>$<hash-hex>` with a 16-byte random salt and
 * a 64-byte derived key. Verification is constant-time via `timingSafeEqual`.
 */

import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';

const SALT_BYTES = 16;
const KEY_BYTES = 64;

function derive(password: string, salt: Buffer, keylen: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, keylen, (err, derived) => {
      if (err) reject(err);
      else resolve(derived);
    });
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES);
  const derived = await derive(password, salt, KEY_BYTES);
  return `scrypt$${salt.toString('hex')}$${derived.toString('hex')}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algo, saltHex, hashHex] = stored.split('$');
  if (algo !== 'scrypt' || !saltHex || !hashHex) return false;
  const salt = Buffer.from(saltHex, 'hex');
  const expected = Buffer.from(hashHex, 'hex');
  if (expected.length === 0) return false;
  const derived = await derive(password, salt, expected.length);
  return derived.length === expected.length && timingSafeEqual(derived, expected);
}
