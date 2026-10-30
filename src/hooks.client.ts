// Client-side Sentry for openstrata (wired-but-off).
//
// Dormant until **both** `VITE_PUBLIC_SENTRY_DSN` is set and the visitor has
// explicitly recorded monitoring consent. The consent gate is deliberate: the
// published family privacy policy promises a policy change and a real consent
// banner before third-party tracking, so a DSN on its own must not switch it on.
// See `src/lib/monitoring.ts` for the rule and its tests.
import * as Sentry from '@sentry/sveltekit';
import { decideMonitoring, readMonitoringConsent, sanitizeUrl } from '$lib/monitoring';

const dsn = import.meta.env.VITE_PUBLIC_SENTRY_DSN;
const decision = decideMonitoring({ dsn, consent: readMonitoringConsent() });

if (decision.enabled && dsn) {
  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    tracesSampleRate: 0.1,
    // Session Replay is intentionally not enabled: it records the interface,
    // and council screens can show owner names, balances and payment references.
    beforeSend(event) {
      if (event.request?.url) event.request.url = sanitizeUrl(event.request.url);
      // No account identity is attached to monitoring events.
      event.user = undefined;
      return event;
    },
  });
}

// `Sentry.init` on its own captures nothing from a SvelteKit error: the framework
// hands a thrown error to the `handleError` hook, and this file had no hook at
// all, so every client-side error went unrecorded and a configured DSN would
// have reported an empty project forever. Exporting the wrapped handler is what
// connects the two. With no DSN (or no consent) the capture call is a no-op and
// the default handler still runs.
export const handleError = Sentry.handleErrorWithSentry();
