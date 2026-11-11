// Disables access to DOM typings like `HTMLElement` which are not available
// inside a service worker and instantiates the correct globals
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

// Ensures that the `$service-worker` import has proper type definitions
/// <reference types="@sveltejs/kit" />

/**
 * Service worker: fast repeat visits and an offline fallback, without ever
 * standing between the browser and the network when it brings nothing.
 *
 * - App entry/page modules and CSS: precached on install, served cache-first
 *   (immutable, versioned by the deployment).
 * - Other build/static files (fonts, favicons, images of `static/`): cache-first,
 *   cached on first use only (no megabytes of unused fonts on the first visit).
 * - Navigations (HTML): network-first through navigation preload (the request
 *   starts while the worker boots), the last pages kept for offline only.
 * - Everything else (`__data.json`, sitemaps, feeds, Butterfly API and media, GTM,
 *   embeds…): not intercepted, the browser and the HTTP caches handle it.
 */

import { build, files, version } from '$service-worker';

const self = globalThis.self as unknown as ServiceWorkerGlobalScope;

const CACHE = `cache-${version}`;
const PAGES = `pages-${version}`;
/** HTML pages kept for the offline fallback */
const MAX_PAGES = 30;

// app shell: the entry and page modules and the CSS. Shared chunks (Sentry,
// Replay, embeds…), fonts and favicons are cached when actually used: a site
// without Sentry never downloads it.
const PRECACHE = build.filter((file) => /\/(entry|nodes)\/.+\.js$|\.css$/.test(file));
const STATIC = new Set([...build, ...files]);

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // previous deployments, and the former unbounded caches (cache-media…)
      for (const key of await caches.keys()) {
        if (key !== CACHE && key !== PAGES) await caches.delete(key);
      }
      // the HTML request starts in parallel with the worker boot
      await self.registration.navigationPreload?.enable();
    })(),
  );
});

async function fromCache(request: Request): Promise<Response> {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) await cache.put(request, response.clone());
  return response;
}

async function keepPage(request: Request, response: Response): Promise<void> {
  const cache = await caches.open(PAGES);
  await cache.put(request, response);
  const keys = await cache.keys();
  for (const old of keys.slice(0, Math.max(0, keys.length - MAX_PAGES))) {
    await cache.delete(old);
  }
}

async function navigate(event: FetchEvent): Promise<Response> {
  try {
    const response =
      ((await event.preloadResponse) as Response | undefined) ?? (await fetch(event.request));
    if (response.ok && !response.headers.get('cache-control')?.includes('no-store')) {
      event.waitUntil(keepPage(event.request, response.clone()));
    }
    return response;
  } catch (err) {
    const cached = await caches.match(event.request, { cacheName: PAGES });
    if (cached) return cached;
    throw err;
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  // other origins (API, media, GTM, embeds): not intercepted
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(navigate(event));
    return;
  }

  if (STATIC.has(url.pathname)) {
    event.respondWith(fromCache(request));
  }
  // anything else (__data.json, sitemaps, feeds…): not intercepted
});
