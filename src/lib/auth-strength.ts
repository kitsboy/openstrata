/**
 * Password strength heuristic used by the sign-up wizard's live meter.
 *
 * Score 0–3, deliberately simple and honest (it is guidance, not a security
 * policy):
 *   +1  length >= 8
 *   +1  length >= 12
 *   +1  mixed case
 *   +1  digits AND symbols present
 * then folded: 0→weak, 1→weak, 2→okay, 3→strong.
 */

export function passwordStrength(password: string): 0 | 1 | 2 | 3 {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password) && /[^a-zA-Z0-9]/.test(password)) score++;
  if (score <= 1) return 1;
  if (score === 2) return 2;
  return 3;
}

/** True when the password meets the minimum (8+ characters). */
export function passwordMeetsMinimum(password: string): boolean {
  return password.length >= 8;
}

/** True when the value looks like an email address (matches the backend's EMAIL_RE). */
export function isEmailLike(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}
