---
name: service-worker
description: Edit or extend `src/service-worker.ts`. Use when changing the caching strategy, adding new cache buckets, handling offline fallback, or debugging why a resource isn't being cached. Covers the existing versioned app cache, the persistent media cache, and the rules for safely evolving it.
---

# `src/service-worker.ts`

The project ships a production-grade service worker with two cache buckets:

- **`cache-${version}`** — app shell + static files (`build`, `files` from `$service-worker`). Cleaned on activation of a new deployment.
- **`cache-media`** — immutable media from `PUBLIC_MEDIA_URL`. **Not** version-bucketed, **not** cleaned on activation. Butterfly media URLs are content-hashed, so the same URL always returns the same bytes.

SvelteKit registers the service worker automatically when `src/service-worker.ts` exists.

---

## Mental model

```
Request
   │
   ├─ origin === PUBLIC_MEDIA_URL
   │     → cache-first, fallback to network, populate cache-media
   │
   ├─ origin === self (app shell, static, HTML)
   │     → network-first with cache-${version} fallback for offline
   │
   └─ other origins (GTM, analytics, third-party)
         → pass through to network
```

Read the file — it's ~200 lines, well-commented. Don't restate the full logic here; read the source when in doubt.

---

## Safe evolutions

### Add a new cache bucket for a third-party origin

Example: cache Fontsource-served fonts separately (though Fontsource is served from the same origin via Vite, so this is rare).

1. Declare a new constant: `const FONT_CACHE = 'cache-fonts'`.
2. Add an origin check in `fetch` handler similar to `isMediaRequest`.
3. Decide the strategy (cache-first for immutable, stale-while-revalidate for mutable).
4. **Update the activation cleanup** — either add the cache to the exclusion list (keep it) or include it in the cleanup (version it).

### Change app shell cache strategy

The current strategy is network-first with cache fallback for resilience. Don't flip to cache-first without understanding the revalidation story — cached HTML can stick to the user's device across deploys and create stale UIs.

### Add offline fallback page

Create `src/routes/offline.svelte` (or similar), add it to `ASSETS` on install, and serve it from `fetch` when the network fails and no cache matches. Keep the page self-contained — it should render without JS and without layout data.

---

## What NOT to do

- **Don't cache POST/PUT/DELETE** requests — the service worker only intercepts GET in most cases, and mutating caches is a leak surface.
- **Don't cache API responses** from Butterfly unless you have a strong reason. Butterfly serves short TTLs and the server hooks into `api.get` + SvelteKit's `fetch` already handle SSR caching.
- **Don't forget to `clone()` responses** before putting them in the cache — responses are one-shot streams.
- **Don't bump `CACHE` manually** — it's tied to `version` from `$service-worker`, which changes on every build.
- **Don't change `MEDIA_CACHE` naming** — the persistent cache survives across versions on purpose. Renaming it orphans old caches on every deploy.

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

- Resource not cached? → log `request.url` inside the relevant branch, check origin comparisons and `isMediaRequest`.
- Old content sticking after deploy? → verify `CACHE` is tied to `version`, check the activation event's cache cleanup.
- Media cache growing unbounded? → add an LRU eviction based on `Response` timestamps, or a max-entries guard on `cache-media`.
- Service worker not updating? → in DevTools → Application, tick "Update on reload" or "Skip waiting".

---

## Cross-ref

- PWA support (`navigator.standalone`) is already in `app.d.ts`. If you want a full PWA, add a manifest in `static/` and link it from `src/app.html`.
- `cacheControl.ts` presets are unrelated to the service worker — they set HTTP cache headers for the CDN/browser HTTP cache, which is a separate layer.
