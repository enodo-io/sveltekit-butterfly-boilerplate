---
name: service-worker
description: Edit or extend `src/service-worker.ts`. Use when changing the caching strategy, adding new cache buckets, handling offline fallback, or debugging why a resource isn't being cached. Covers the existing versioned app cache, the persistent media cache, and the rules for safely evolving it.
---

# `src/service-worker.ts`

The service worker makes repeat visits fast and gives an offline fallback. It never stands between the browser and the network when it brings nothing: every request it intercepts costs the worker boot time.

- **`cache-${version}`**: the app JS/CSS (`build`), precached on install; the other build/static files (fonts, favicons, images of `static/`) cached on first use. Cache-first: these files are immutable for a deployment.
- **`pages-${version}`**: the last 30 HTML pages, for the offline fallback only.

Both are versioned and dropped on activation of the next deployment.

SvelteKit registers the service worker automatically when `src/service-worker.ts` exists.

---

## Mental model

```
Request (GET)
   │
   ├─ other origin (Butterfly API and media, GTM, embeds…)
   │     → not intercepted (the browser HTTP cache handles media)
   │
   ├─ navigation (HTML)
   │     → network-first via navigation preload (the request starts while
   │       the worker boots), copy kept in pages-${version} for offline
   │
   ├─ same origin, in build/files
   │     → cache-first (precached JS/CSS, the rest cached on first use)
   │
   └─ anything else same origin (__data.json, sitemaps, feeds…)
         → not intercepted
```

Rules that keep it fast:

- **Navigation preload stays enabled** (`activate`). Without it every HTML request waits for the worker to boot.
- **Precache the entry and page modules and the CSS only.** Shared chunks (Sentry, Replay, embeds), fonts and `files` are cached on first use: precaching them downloads what the visit may never need (a site without Sentry would still fetch it).
- **`return` (no `respondWith`) for what is not cached.** `respondWith(fetch())` adds latency and turns network errors into generic failures.
- **No cache without a bound.** Unique URLs (search, `__data.json?x-sveltekit-invalidated`) would grow it forever.
- **Never cache cross-origin `<img>` responses**: they are opaque (`status 0`), unreadable, and the HTTP cache already keeps them.

---

## Safe evolutions

### Add a new cache bucket for a third-party origin

Example: cache Fontsource-served fonts separately (though Fontsource is served from the same origin via Vite, so this is rare).

1. Declare a new constant: `const FONT_CACHE = 'cache-fonts'`.
2. Add an origin check in the `fetch` handler, before the "other origin" `return`.
3. Decide the strategy (cache-first for immutable, stale-while-revalidate for mutable).
4. **Update the activation cleanup** — either add the cache to the exclusion list (keep it) or include it in the cleanup (version it).

### Change the HTML strategy

HTML is network-first with an offline copy. Don't flip it to cache-first: cached HTML sticks to the user's device across deploys and serves stale content.

### Add offline fallback page

Create `src/routes/offline.svelte` (or similar), add it to `ASSETS` on install, and serve it from `fetch` when the network fails and no cache matches. Keep the page self-contained — it should render without JS and without layout data.

---

## What NOT to do

- **Don't cache POST/PUT/DELETE** requests — the service worker only intercepts GET in most cases, and mutating caches is a leak surface.
- **Don't cache API responses** from Butterfly unless you have a strong reason. Butterfly serves short TTLs and the server hooks into `api.get` + SvelteKit's `fetch` already handle SSR caching.
- **Don't forget to `clone()` responses** before putting them in the cache — responses are one-shot streams.
- **Don't bump `CACHE` manually** — it's tied to `version` from `$service-worker`, which changes on every build.
- **Don't add a persistent (unversioned) cache** without an eviction policy: nothing ever cleans it.

---

## Testing changes

The service worker is disabled in dev mode (Vite's HMR conflicts). To test:

```bash
npm run build && npm run preview
# Open http://localhost:4173 in a new Chrome profile
# DevTools → Application → Service Workers → verify registration
# Network tab → check cache hits (from "Service Worker" column)
```

Clear the service worker between tests: DevTools → Application → "Clear site data".

---

## Debugging checklist

- Resource not cached? → only same-origin `build`/`files` are; check the path is in `$service-worker`'s `build` or `files`.
- Old content sticking after deploy? → verify `CACHE` is tied to `version`, check the activation event's cache cleanup.
- Service worker not updating? → in DevTools → Application, tick "Update on reload" or "Skip waiting".

---

## Cross-ref

- PWA support (`navigator.standalone`) is already in `app.d.ts`. If you want a full PWA, add a manifest in `static/` and link it from `src/app.html`.
- `cacheControl.ts` presets are unrelated to the service worker — they set HTTP cache headers for the CDN/browser HTTP cache, which is a separate layer.
