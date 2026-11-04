import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { dev } from '$app/environment';
import { env } from '$env/dynamic/public';
import * as Sentry from '@sentry/sveltekit';
import http from 'node:http';
import https from 'node:https';
import CacheableLookup from 'cacheable-lookup';

// Aggressive DNS cache to reduce dns.lookup() calls in SSR
// and improve performance when making multiple requests to the same API
const cacheable = new CacheableLookup({
  maxTtl: 3600,
  errorTtl: 0.15,
  fallbackDuration: 3600,
});

try {
  cacheable.install(http.globalAgent);
  cacheable.install(https.globalAgent);
} catch {
  // Already installed, ignore
}

/** Error monitoring of the server (`PUBLIC_SENTRY_DSN`; nothing without it, nothing in dev). */
Sentry.init({ dsn: dev ? undefined : env.PUBLIC_SENTRY_DSN });

export const handle: Handle = sequence(Sentry.sentryHandle());
export const handleError = Sentry.handleErrorWithSentry();
