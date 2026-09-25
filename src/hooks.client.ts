// Client-side Sentry for openstrata (wired-but-off).
// Stays fully dormant until VITE_PUBLIC_SENTRY_DSN is set — matching the family
// "wired-but-off" standard (satohash/tadbuy/giveabit/motopass/sherpacarta/camtaylor).
import * as Sentry from '@sentry/sveltekit';

const dsn = import.meta.env.VITE_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0.3,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    environment: import.meta.env.MODE,
  });
}
