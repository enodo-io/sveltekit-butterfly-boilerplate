import { dev } from '$app/environment';
import { env } from '$env/dynamic/public';
import * as Sentry from '@sentry/sveltekit';

/** Error monitoring of the browser (DSN per site in `PUBLIC_SENTRY_DSN`, nothing in dev). */
const dsn = dev ? undefined : env.PUBLIC_SENTRY_DSN;

// no random session recording: a replay (text and inputs masked) only when an error occurs
Sentry.init({
  dsn,
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1.0,
});

// Session Replay weighs more than the rest of the application: its chunk is
// fetched once the page is idle rather than shipped in the entry bundle.
if (dsn) {
  const loadReplay = () =>
    import('@sentry/replay').then(({ replayIntegration }) =>
      Sentry.addIntegration(replayIntegration()),
    );
  if ('requestIdleCallback' in window) requestIdleCallback(() => void loadReplay());
  else setTimeout(() => void loadReplay(), 3000);
}

export const handleError = Sentry.handleErrorWithSentry();
