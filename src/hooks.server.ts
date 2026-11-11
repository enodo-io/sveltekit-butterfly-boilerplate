import type { Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { dev } from '$app/environment';
import { env } from '$env/dynamic/public';
import * as Sentry from '@sentry/sveltekit';
import http from 'node:http';
import https from 'node:https';
import CacheableLookup from 'cacheable-lookup';
import type { lookup as dnsLookup } from 'node:dns';
import { Agent, setGlobalDispatcher } from 'undici';

// Aggressive DNS cache to reduce dns.lookup() calls in SSR
// and improve performance when making multiple requests to the same API
const cacheable = new CacheableLookup({
  maxTtl: 3600,
  errorTtl: 0.15,
  fallbackDuration: 3600,
});

// The Butterfly client calls the global fetch, i.e. undici, which ignores
// http(s).globalAgent: the DNS cache must be its dispatcher's lookup. Keep-alive
// reuses the connections to the API between requests.
setGlobalDispatcher(
  new Agent({
    // same (hostname, options, callback) contract as dns.lookup, typed with overloads
    connect: { lookup: cacheable.lookup as unknown as typeof dnsLookup },
    keepAliveTimeout: 30_000,
  }),
);

// node:http(s) clients (other libraries)
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
