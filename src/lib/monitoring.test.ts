import { describe, expect, it } from 'vitest';
import { decideMonitoring, readMonitoringConsent, sanitizeUrl, MONITORING_CONSENT_KEY } from './monitoring';

describe('monitoring activation', () => {
  it('stays off without a DSN, whatever the consent says', () => {
    expect(decideMonitoring({ dsn: undefined, consent: 'granted' })).toEqual({ enabled: false, reason: 'no-dsn' });
    expect(decideMonitoring({ dsn: '   ', consent: 'granted' })).toEqual({ enabled: false, reason: 'no-dsn' });
  });

  it('stays off with a DSN but no explicit consent', () => {
    for (const consent of [null, undefined, '', 'denied', 'maybe']) {
      expect(decideMonitoring({ dsn: 'https://key@sentry.example/1', consent })).toEqual({
        enabled: false,
        reason: 'no-consent'
      });
    }
  });

  it('turns on only when both gates are satisfied', () => {
    expect(decideMonitoring({ dsn: 'https://key@sentry.example/1', consent: 'granted' })).toEqual({
      enabled: true,
      reason: 'enabled'
    });
  });
});

describe('monitoring privacy helpers', () => {
  it('drops query strings and fragments that carry lot ids and tokens', () => {
    expect(sanitizeUrl('https://openstrata.giveabit.io/pay?unit=207&rail=etransfer')).toBe(
      'https://openstrata.giveabit.io/pay'
    );
    expect(sanitizeUrl('/pay?t=bill-link-token#top')).toBe('/pay');
    expect(sanitizeUrl('/units/207')).toBe('/units/207');
  });

  it('reads the recorded decision from the documented key', () => {
    const storage = { getItem: (key: string) => (key === MONITORING_CONSENT_KEY ? 'granted' : null) };
    expect(readMonitoringConsent(storage)).toBe('granted');
  });

  it('treats blocked storage as no consent rather than throwing', () => {
    const storage = {
      getItem: () => {
        throw new Error('storage disabled');
      }
    };
    expect(readMonitoringConsent(storage)).toBeNull();
    expect(readMonitoringConsent(null)).toBeNull();
  });
});
