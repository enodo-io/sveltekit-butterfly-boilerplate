---
name: cache-control
description: Choose the right cache header for a route or endpoint using the presets in `$lib/cacheControl`. Use whenever calling `setHeaders({ 'cache-control': ... })` in a `+page.server.ts` or `+server.ts`. Presets: minute (1m), short (2m), medium (5m), long (15m), longer (1h), day (24h), all with stale-while-revalidate.
---

# Cache-Control — `CACHE_CONTROL` presets

`src/lib/cacheControl.ts` exposes six presets. Always pick one — never inline a raw `public, max-age=...` string.

```ts
export const CACHE_CONTROL = {
  minute: 'public, max-age=60, stale-while-revalidate=60', // 1 minute
  short: 'public, max-age=120, stale-while-revalidate=120', // 2 minutes
  medium: 'public, max-age=300, stale-while-revalidate=300', // 5 minutes
  long: 'public, max-age=900, stale-while-revalidate=900', // 15 minutes
  longer: 'public, max-age=3600, stale-while-revalidate=3600', // 1 hour
  day: 'public, max-age=86400, stale-while-revalidate=3600', // 24 hours, stale for 1 hour
};
```

`max-age` is read by the browser and the shared caches alike (Varnish, a CDN edge). `stale-while-revalidate` lets a cache serve its copy at once past the TTL and refresh in the background, for as long again: a page is at most two TTLs old, and a CDN edge far from the origin never makes the visitor wait for it. Verified in production behind Varnish and Cloudflare.

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
| A live page, a countdown          | `minute`         | May change any minute         |
| Search results                    | `short`          | User-dependent, changes often |
| Home page, article listings       | `short`          | New posts appear frequently   |
| Article detail, author, tag pages | `medium`         | Stable between publishes      |
| Taxonomy index pages              | `long`           | New terms are rare            |
| Static/CMS pages (about, legal)   | `longer`         | Change infrequently           |
| RSS/Atom feeds                    | `short`          | See breakdown below           |
| robots.txt / ads.txt (API)        | `longer`         | Purged on save in the API     |

### Sitemaps / feeds

Sitemaps are relayed from the API by `src/routes/sitemaps/[file]/` (`$lib/server/sitemapCache`): news 300s; index, current period, categories, tags, authors, pages 3600s; closed years 86400s.

Feeds (`[format=feed]/...`) use `short` — RSS readers poll frequently and expect fresh data.

---

## When to diverge from a preset

Only when you have a specific numeric requirement that doesn't match a preset (e.g. 10 minutes for a banner feed). In that case:

1. Add a new preset to `cacheControl.ts` with a descriptive name.
2. Use it.

Don't inline a raw string — it becomes a maintenance hazard when the team wants to tune caching globally.

---

## No hand-written `s-maxage`

Don't add `s-maxage` to a route to split the CDN TTL from the browser TTL. Cloudflare reads it as `proxy-revalidate` and then never serves stale ("s-maxage disables stale-while-revalidate", its Origin Cache Control docs), which defeats the presets. If an untagged route needs a longer shared TTL, give it a longer preset.

The one exception is built in: a page **tagged** for purges (`taggedCacheHeaders` in `$lib/server/cacheTags`) stays 6 hours in the shared cache, because Butterfly purges it on every change. The helper picks the header per `PRIVATE_CACHE_TAGS`: `s-maxage` for Varnish (`xkey`), `Cloudflare-CDN-Cache-Control` / `Surrogate-Control` / `Vercel-CDN-Cache-Control` / `Netlify-CDN-Cache-Control` for the CDNs (never `s-maxage` there). The browser keeps the route's preset.

```ts
setHeaders(taggedCacheHeaders(CACHE_CONTROL.short, `post:${post.data.id}`));
```

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
