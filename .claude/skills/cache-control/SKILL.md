---
name: cache-control
description: Choose the right cache header for a route or endpoint using the presets in `$lib/cacheControl`. Use whenever calling `setHeaders({ 'cache-control': ... })` in a `+page.server.ts` or `+server.ts`. Presets: short (2m), medium (5m), long (15m), longer (1h), day (24h).
---

# Cache-Control — `CACHE_CONTROL` presets

`src/lib/cacheControl.ts` exposes five presets. Always pick one — never inline a raw `public, max-age=...` string.

```ts
export const CACHE_CONTROL = {
  short: 'public, max-age=120', // 2 minutes
  medium: 'public, max-age=300', // 5 minutes
  long: 'public, max-age=900', // 15 minutes
  longer: 'public, max-age=3600', // 1 hour
  day: 'public, max-age=86400', // 24 hours
};
```

---

## Usage

```ts
import { CACHE_CONTROL } from '$lib/cacheControl';

// In a load function:
setHeaders({ 'cache-control': CACHE_CONTROL.short });

// In a +server.ts endpoint:
res.headers.set('Cache-Control', CACHE_CONTROL.day);
```

---

## Decision table

| Content                           | Preset           | Rationale                     |
| --------------------------------- | ---------------- | ----------------------------- |
| Search results                    | `short`          | User-dependent, changes often |
| Home page, article listings       | `short`          | New posts appear frequently   |
| Article detail, author, tag pages | `medium`         | Stable between publishes      |
| Taxonomy index pages              | `long`           | New terms are rare            |
| Static/CMS pages (about, legal)   | `longer`         | Change infrequently           |
| Sitemaps, RSS/Atom feeds          | `short` or `day` | See breakdown below           |
| Sitemap index, robots.txt         | `day`            | Mostly immutable              |

### Sitemaps / feeds

The news sitemap (`news.xml`) must refresh fast — use `short` or `medium`. The posts/pages/sections sitemap can use `day` since a stale entry for a few hours isn't critical (Google will re-fetch).

Feeds (`[format=feed]/...`) use `short` — RSS readers poll frequently and expect fresh data.

---

## When to diverge from a preset

Only when you have a specific numeric requirement that doesn't match a preset (e.g. 10 minutes for a banner feed). In that case:

1. Add a new preset to `cacheControl.ts` with a descriptive name.
2. Use it.

Don't inline a raw string — it becomes a maintenance hazard when the team wants to tune caching globally.

---

## `s-maxage` and `stale-while-revalidate`

The current presets are plain `max-age` (shared by CDN and browser). If you need different TTLs for CDN vs browser, or want stale-while-revalidate semantics, extend the module:

```ts
export const CACHE_CONTROL = {
  // existing...
  swrShort: 'public, max-age=60, s-maxage=300, stale-while-revalidate=3600',
};
```

Don't sprinkle `stale-while-revalidate` inline — document the intent in one place.

---

## Private / user-specific

If a route serves personalised content (not typical in this boilerplate):

```ts
setHeaders({ 'cache-control': 'private, no-cache' });
```

Don't use a preset — `public` would leak personalised content through CDN caches.

---

## Testing

Verify with:

```bash
curl -I http://localhost:5173/some-route | grep -i cache-control
```

The header should exactly match one of the presets. If it doesn't, the load function is missing `setHeaders` — fix it.

---

## What NOT to do

- Don't forget `setHeaders` — routes without cache headers default to no caching, which kills CDN hit rates.
- Don't put `cache-control` in `+layout.server.ts`. Layouts are merged with page headers, and page-level caching wins.
- Don't use `no-store` unless the route is truly un-cacheable. `public, max-age=60` is often safer.
- Don't inline a raw `public, max-age=...` — use a preset or add one.
