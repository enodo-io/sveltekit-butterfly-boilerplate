// Disables access to DOM typings like `HTMLElement` which are not available
// inside a service worker and instantiates the correct globals
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

// Ensures that the `$service-worker` import has proper type definitions
/// <reference types="@sveltejs/kit" />

// Only necessary if you have an import from `$env/static/public`
/// <reference types="../.svelte-kit/ambient.d.ts" />

import { build, files, version } from '$service-worker';
import { PUBLIC_BASE_URL, PUBLIC_API_URL, PUBLIC_MEDIA_URL } from '$env/static/public';

// This gives `self` the correct types
const self = globalThis.self as unknown as ServiceWorkerGlobalScope;

// Create a unique cache name for this deployment
const CACHE = `cache-${version}`;

// Create a persistent cache for external media (doesn't change with version)
// This cache is NOT cleaned on activation, as media URLs are immutable
const MEDIA_CACHE = 'cache-media';

const ASSETS = [
  ...build, // the app itself
  ...files, // everything in `static`
];

function isMediaRequest(url: URL): boolean {
  try {
    const mediaUrl = new URL(PUBLIC_MEDIA_URL);
    return url.origin === mediaUrl.origin;
  } catch {
    return false;
  }
}

function parseCacheControl(cacheControl: string | null): Map<string, string | number | boolean> {
  const directives = new Map<string, string | number | boolean>();

  if (!cacheControl) return directives;

  cacheControl.split(',').forEach((directive) => {
    const trimmed = directive.trim().toLowerCase();

    if (trimmed === 'no-store' || trimmed === 'no-cache' || trimmed === 'must-revalidate') {
      directives.set(trimmed, true);
    } else {
      const [key, value] = trimmed.split('=');
      if (key && value) {
        const numValue = parseInt(value, 10);
        directives.set(key.trim(), isNaN(numValue) ? value.trim() : numValue);
      } else if (key) {
        directives.set(key.trim(), true);
      }
    }
  });

  return directives;
}

function shouldCacheResponse(response: Response): boolean {
  const cacheControl = response.headers.get('Cache-Control');
  const directives = parseCacheControl(cacheControl);

  if (directives.has('no-store')) {
    return false;
  }

  return true;
}

function isCacheExpired(response: Response): boolean {
  const cacheControl = response.headers.get('Cache-Control');
  const directives = parseCacheControl(cacheControl);
  const expires = response.headers.get('Expires');

  if (directives.has('no-cache') || directives.has('must-revalidate')) {
    return true;
  }

  // Check max-age
  if (directives.has('max-age')) {
    const maxAge = directives.get('max-age') as number;
    const dateHeader = response.headers.get('Date');

    if (dateHeader) {
      const cacheDate = new Date(dateHeader).getTime();
      const now = Date.now();
      const ageSeconds = Math.floor((now - cacheDate) / 1000);

      return ageSeconds >= maxAge;
    }
  }

  // Check s-maxage (shared max-age)
  if (directives.has('s-maxage')) {
    const sMaxAge = directives.get('s-maxage') as number;
    const dateHeader = response.headers.get('Date');

    if (dateHeader) {
      const cacheDate = new Date(dateHeader).getTime();
      const now = Date.now();
      const ageSeconds = Math.floor((now - cacheDate) / 1000);

      return ageSeconds >= sMaxAge;
    }
  }

  // Check Expires header
  if (expires) {
    const expireDate = new Date(expires).getTime();
    const now = Date.now();

    return now >= expireDate;
  }

  // If no expiration info, consider it valid (for backwards compatibility)
  return false;
}

// Check if a request should be cached based on URL
// Cache resources from our own domain or Butterfly API/media
// Everything else (trackers, ads, scripts, etc.) is not cached
function shouldCacheByUrl(url: URL): boolean {
  try {
    const baseUrl = new URL(PUBLIC_BASE_URL);
    const mediaUrl = new URL(PUBLIC_MEDIA_URL);
    const apiUrl = new URL(PUBLIC_API_URL);

    // Whitelist: always cache if same origin as site, API, or media domain
    if (
      url.origin === baseUrl.origin ||
      url.origin === mediaUrl.origin ||
      url.origin === apiUrl.origin
    ) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

self.addEventListener('install', (event) => {
  async function addFilesToCache() {
    const cache = await caches.open(CACHE);
    await cache.addAll(ASSETS);
  }

  event.waitUntil(addFilesToCache());
});

self.addEventListener('activate', (event) => {
  // Remove previous cached data from disk
  // Note: MEDIA_CACHE is preserved as media URLs are immutable
  async function deleteOldCaches() {
    for (const key of await caches.keys()) {
      // Keep the current cache and the media cache (persistent)
      if (key !== CACHE && key !== MEDIA_CACHE) {
        await caches.delete(key);
      }
    }
  }

  event.waitUntil(deleteOldCaches());
});

self.addEventListener('fetch', (event) => {
  // ignore POST requests etc
  if (event.request.method !== 'GET') return;

  async function respond() {
    const url = new URL(event.request.url);

    // Check if we should cache this request based on URL
    // Allow all requests to pass through, but only cache what we want
    const shouldCacheUrl = shouldCacheByUrl(url);

    // If URL doesn't match our criteria, fetch without caching
    if (!shouldCacheUrl) {
      try {
        return await fetch(event.request);
      } catch {
        // If fetch fails for excluded domains, just throw (don't try to cache)
        throw new Error('[SW] Fetch failed');
      }
    }

    // immutable cache from butterfly medias
    const isMedia = isMediaRequest(url);
    const mediaCache = isMedia ? await caches.open(MEDIA_CACHE) : null;

    if (isMedia && mediaCache) {
      const mediaCachedResponse = await mediaCache.match(event.request);
      if (mediaCachedResponse && !isCacheExpired(mediaCachedResponse)) {
        return mediaCachedResponse;
      }
    }

    const cache = await caches.open(CACHE);

    // `build`/`files` can always be served from the cache
    if (ASSETS.includes(url.pathname)) {
      const response = await cache.match(url.pathname);

      if (response) {
        return response;
      }
    }

    const cachedResponse = await cache.match(event.request);
    if (cachedResponse && !isCacheExpired(cachedResponse)) {
      return cachedResponse;
    }

    try {
      const response = await fetch(event.request);

      if (!(response instanceof Response)) {
        throw new Error('[SW] Invalid response from fetch');
      }

      if (response.status === 200 && shouldCacheResponse(response)) {
        if (isMedia && mediaCache) {
          mediaCache.put(event.request, response.clone());
        } else {
          cache.put(event.request, response.clone());
        }
      }

      return response;
    } catch (err) {
      if (isMedia && mediaCache) {
        const mediaCachedResponse = await mediaCache.match(event.request);
        if (mediaCachedResponse) {
          return mediaCachedResponse;
        }
      }

      const cachedResponse = await cache.match(event.request);
      if (cachedResponse) {
        return cachedResponse;
      }

      throw err;
    }
  }

  event.respondWith(respond());
});
