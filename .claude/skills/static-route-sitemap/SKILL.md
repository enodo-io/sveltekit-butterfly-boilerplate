---
name: static-route-sitemap
description: Remind to register a new static route in the sitemap, and to create an RSS feed for content listing routes. Use whenever a new static SvelteKit route is created (a route with no dynamic parameters like [id] or [slug] that is not backed by CMS content). The route must be added to src/routes/sitemaps/pages.xml/+server.ts or it will be invisible to search engines. For routes that list multiple content items (taxonomy listings, author pages, etc.), also create a feed in src/routes/[format=feed]/.
---

# Static route → add to sitemap + RSS feed

## 1. Add to sitemap

After creating a static route (e.g. `src/routes/legal/+page.svelte`), add it to `src/routes/sitemaps/pages.xml/+server.ts`.

### What goes here

Routes that are **not** fetched from the CMS API — i.e. pure SvelteKit pages with no dynamic parameters.

- ✅ `/legal`, `/faq`, `/contact`, `/newsletter` → add manually
- ✅ `/search`, `/articles`, `/tags` → already there (keep as reference)
- ❌ CMS-backed pages (`PUBLIC_STATIC_PAGES`) → already covered by the API fetch at the top of the file

### How to add

Append a `routes.push()` call before the `SitemapStream` block:

```ts
routes.push({
  url: '/your-new-route',
  lastmod: new Date(),
  changefreq: 'monthly', // daily | weekly | monthly | yearly
  priority: 0.5, // 0.1 (low) → 1.0 (homepage)
});
```

### Priority guide

| Priority | Use for                   |
| -------- | ------------------------- |
| `1.0`    | Homepage only             |
| `0.8`    | High-traffic index pages  |
| `0.5`    | Standard static pages     |
| `0.3`    | Low-traffic utility pages |

---

## 2. Create an RSS feed (content listing routes only)

If the route lists multiple content items (taxonomy listings, author pages, section indexes…), also create a feed alongside it.

**Existing examples:**

- `src/routes/[format=feed]/index.xml/+server.ts` — global feed
- `src/routes/[format=feed]/tags/[id].xml/+server.ts` — per-tag feed
- `src/routes/[format=feed]/authors/[id].xml/+server.ts` — per-author feed
- `src/routes/[format=feed]/sections/[...path].xml/+server.ts` — per-section feed

### File location

```
src/routes/[format=feed]/your-route.xml/+server.ts
```

### Minimal structure

```ts
import { Feed } from 'feed';
import api from '$lib/api';
import { PUBLIC_LANGUAGE, PUBLIC_BASE_URL } from '$env/static/public';
import type { RequestHandler } from './$types';
import type * as Butterfly from '@enodo/butterfly-ts';

export const GET: RequestHandler = async ({ fetch, params }) => {
  const format = params.format as 'atom' | 'rss' | 'json';

  const [settings, posts] = await Promise.all([
    api.get<Butterfly.Property>({ fetch, path: '/v1/' }),
    api.get<Butterfly.Post[]>({
      fetch,
      endpoint: 'posts',
      query: {
        /* … */
      },
    }),
  ]);

  const feed = new Feed({
    title: '…',
    description: '…',
    id: `${PUBLIC_BASE_URL}/your-route`,
    link: `${PUBLIC_BASE_URL}/your-route`,
    language: PUBLIC_LANGUAGE,
    image: `${PUBLIC_BASE_URL}/logo-88x31.jpg`,
    favicon: `${PUBLIC_BASE_URL}/favicon.ico`,
    copyright: `All rights reserved ${new Date().getFullYear()}, ${settings.data.attributes.title}`,
    updated: new Date(),
    generator: 'Enodo Butterfly',
    ttl: 120,
    feedLinks: {
      rss: `${PUBLIC_BASE_URL}/rss/your-route.xml`,
      json: `${PUBLIC_BASE_URL}/json/your-route.json`,
      atom: `${PUBLIC_BASE_URL}/atom/your-route.xml`,
    },
  });

  posts.data.forEach((post: Butterfly.Post) => {
    feed.addItem({
      /* … */
    });
  });

  const responses = { atom: feed.atom1, rss: feed.rss2, json: feed.json1 };
  const res = new Response(responses[format]());
  res.headers.set('Expires', new Date(Date.now() + 120).toUTCString());
  res.headers.set('Cache-Control', 'max-age=120');
  res.headers.set('Content-Type', 'text/xml');
  return res;
};
```

The `[format=feed]` matcher handles `rss`, `atom`, and `json` automatically — the same file serves all three formats.
