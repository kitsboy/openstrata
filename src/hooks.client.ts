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

// `Sentry.init` on its own captures nothing from a SvelteKit error: the framework
// hands a thrown error to the `handleError` hook, and this file had no hook at
// all, so every client-side error went unrecorded and a configured DSN would
// have reported an empty project forever. Exporting the wrapped handler is what
// connects the two. With no DSN the capture call is a no-op and the default
// handler still runs, so a DSN-less build behaves exactly as it did before.
export const handleError = Sentry.handleErrorWithSentry();
