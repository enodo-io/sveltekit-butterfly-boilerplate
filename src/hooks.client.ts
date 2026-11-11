import { dev } from '$app/environment';
import { env } from '$env/dynamic/public';

import type { HandleClientError } from '@sveltejs/kit';

/**
 * Error monitoring of the browser (DSN per site in `PUBLIC_SENTRY_DSN`, nothing in
 * dev). The SDK (~30 kB gz, a third of the JS of the first load) is not in the
 * entry bundle: it is imported once the page is idle, the errors raised before
 * are queued and sent then. Without a DSN nothing is downloaded at all.
 */
const dsn = dev ? undefined : env.PUBLIC_SENTRY_DSN;

type Sentry = typeof import('@sentry/sveltekit');
let sentry: Sentry | undefined;
const pending: unknown[] = [];

const capture = (error: unknown) => {
  if (sentry) sentry.captureException(error);
  else if (dsn) pending.push(error);
};

if (dsn) {
  const early = (e: ErrorEvent | PromiseRejectionEvent) =>
    capture('reason' in e ? e.reason : (e.error ?? e.message));
  addEventListener('error', early);
  addEventListener('unhandledrejection', early);

  const load = async () => {
    const S = await import('@sentry/sveltekit');
    // Replay records in a buffer from the start of the sampled sessions (rrweb
    // observes every DOM mutation): 10% of the sessions, sent only on error
    S.init({ dsn, replaysSessionSampleRate: 0, replaysOnErrorSampleRate: 0.1 });
    removeEventListener('error', early);
    removeEventListener('unhandledrejection', early);
    sentry = S;
    pending.splice(0).forEach((error) => S.captureException(error));

    const { replayIntegration } = await import('@sentry/replay');
    S.addIntegration(replayIntegration());
  };
  const start = () => void load().catch(() => {});
  if ('requestIdleCallback' in window) requestIdleCallback(start, { timeout: 5000 });
  else setTimeout(start, 3000);
}

export const handleError: HandleClientError = ({ error }) => {
  capture(error);
};
