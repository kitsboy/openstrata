/**
 * Consent-gated performance/error monitoring.
 *
 * The Sentry SDK is wired but stays dormant unless **both** a DSN is configured
 * and the visitor has explicitly granted monitoring consent. That second gate is
 * the one that matters: the published family privacy policy promises a policy
 * change and a real consent banner before third-party tracking is added, so a
 * DSN alone must never switch it on.
 *
 * `readMonitoringConsent` only reads a recorded decision. Nothing here sets it:
 * a consent control (and the policy update) is a deliberate product decision,
 * not a side effect of shipping a DSN.
 */

/** localStorage key holding the explicit `granted` decision. Mirrored nowhere else. */
export const MONITORING_CONSENT_KEY = 'openstrata-monitoring-consent';

export type MonitoringReason = 'enabled' | 'no-dsn' | 'no-consent';

export interface MonitoringDecision {
  enabled: boolean;
  reason: MonitoringReason;
}

/**
 * The whole activation rule, as a value: no DSN or no explicit consent means
 * off. Pure so it can be tested without a browser, a build or a Sentry client.
 */
export function decideMonitoring(input: {
  dsn: string | null | undefined;
  consent: string | null | undefined;
}): MonitoringDecision {
  const { dsn, consent } = input;
  if (typeof dsn !== 'string' || !dsn.trim()) return { enabled: false, reason: 'no-dsn' };
  if (consent !== 'granted') return { enabled: false, reason: 'no-consent' };
  return { enabled: true, reason: 'enabled' };
}

/** Read the recorded decision, tolerating storage being blocked or full. */
export function readMonitoringConsent(
  storage: Pick<Storage, 'getItem'> | null = typeof localStorage !== 'undefined' ? localStorage : null
): string | null {
  try {
    return storage?.getItem(MONITORING_CONSENT_KEY) ?? null;
  } catch {
    return null;
  }
}

/**
 * Keep the path, drop the query and fragment. Council pages carry lot ids,
 * payment references and bill-link tokens in the address bar, and none of that
 * belongs in a monitoring payload.
 */
export function sanitizeUrl(value: string): string {
  return value.split(/[?#]/, 1)[0] ?? '';
}
