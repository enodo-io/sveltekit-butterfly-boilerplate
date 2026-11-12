---
name: route-server
description: Enforce the standard return structure for SvelteKit route load functions. Use when creating or modifying any +page.server.ts file. Every load function must return layer, meta, and optionally scope and feeds, matching the App.PageData interface defined in src/app.d.ts.
---

# `+page.server.ts` — standard return structure

The canonical type is in `src/app.d.ts`:

```ts
interface PageData {
  layer: {
    'content.type': string; // REQUIRED
    'page.index'?: number;
    'page.query'?: string;
    'page.results'?: number;
    'content.id'?: number | string; // required in practice on post/page/category/tag/author
    'content.taxonomy'?: string; // term pages: taxonomy slug
    'content.group'?: string;
    'content.tags'?: string[];
    'content.flags'?: string[];
  };
  meta: {
    url: string; // REQUIRED — full canonical URL
    title: string; // REQUIRED
    description: string; // REQUIRED
    robots?: string; // optional override
  };
  scope?: Butterfly.ApiResponse<Butterfly.IResource>;
  feeds?: Record<string, MaybePromise<Butterfly.ApiResponse<Butterfly.IResource[]>>>;
}
```

---

## Return skeleton

```ts
export const load: PageServerLoad = async ({ fetch, isDataRequest, setHeaders }) => {
  setHeaders({ 'cache-control': CACHE_CONTROL.medium }); // a preset, never a raw string
  return {
    layer: {
      'content.type': 'home', // see values below
    },
    meta: {
      url: `${PUBLIC_BASE_URL}/your-route`, // absolute canonical, never url.origin
      title: 'Page title',
      description: 'Page description for SEO.', // never null: a fallback sentence
    },
    // scope — omit if no single main entity
    // feeds — omit if no streaming lists
  };
};
```

---

## `content.type` values

| Value        | Route            |
| ------------ | ---------------- |
| `'home'`     | `/`              |
| `'articles'` | `/articles`      |
| `'post'`     | article page     |
| `'page'`     | CMS static page  |
| `'author'`   | author page      |
| `'category'` | section/category |
| `'tag'`      | tag page         |
| `'search'`   | `/search`        |

---

## `scope` — single main entity

Await it before returning. Used when the page is centred on one API entity (post, author, tag…).

```ts
const author = await api.get<Butterfly.Author>({ fetch, endpoint: 'authors', id });
// ...
return {
  scope: author, // always awaited
  // ...
};
```

---

## `feeds` — streaming lists

Never await feeds directly. Use the `isDataRequest` streaming pattern so initial load blocks and subsequent requests (pagination, load-more) stream progressively.

```ts
const posts = api.get<Butterfly.Post[]>({ fetch, endpoint: 'posts', query: { ... } });

return {
  feeds: {
    posts: isDataRequest ? posts : await posts,
  },
};
```

If a feed is conditional (e.g. undefined when no query):

```ts
posts: isDataRequest && posts ? posts : await posts,
```

---

## Pagination pattern

`pageParam` (`$lib/server/pageParam`) reads `?page=`: 1 when absent, `?page=1` 301s to the clean URL (no duplicate), anything but a positive integer is a 404 (never `NaN` sent to the API). An empty page 1 is `noindex` (see `robots-meta`).

```ts
const page = pageParam(url);

return {
  layer: {
    'content.type': 'articles',
    'page.index': page,
  },
  meta: {
    url: `${PUBLIC_BASE_URL}/articles` + (page > 1 ? `?page=${page}` : ''),
    title: 'Articles' + (page > 1 ? ` - Page ${page}` : ''),
    description: '...',
  },
  feeds: {
    posts: isDataRequest ? posts : await posts,
  },
};
```

---

## `meta` — canonical, title, description

- **`meta.url` is the canonical**, absolute, built from `PUBLIC_BASE_URL` (`${PUBLIC_BASE_URL}/path` or `absoluteUrl(path)` from `$lib/seo`), **never `url.origin`**: behind the proxy the request origin is internal. The layout renders it as `<link rel="canonical">` and `og:url`, and the JSON-LD `url` reads it too: the three always agree. A post with a CMS canonical uses it as `meta.url`.
- **One URL per page**: page 2+ carries `?page=N`, page 1 never does (`pageParam` 301s `?page=1`). A query string in `meta.url` (search) is encoded with `encodeURIComponent`, and so are the `rel="prev"`/`rel="next"` links of the page.
- **Ids from the API, not the URL**: a tag/author whose API id differs from the URL (another case…) 301s to `/{tags|authors}/{api id}`; a miscased category path 301s to the real one.
- **`description` is never `null`/empty**: the CMS text (`resume`, category/term `description`) with a generated fallback (`All the articles about ${name}.`). The layout clamps it to 160 characters at a word boundary (`metaDescription`), don't truncate it in the route.
- **`title`** without the site name (the layout appends `| {site}` except on the home); page 2+ appends ` - Page N`.

---

## `meta.robots` — when to override

Only override when the default is wrong for the route, with the constants of `$lib/seo` — never a hand-written string:

```ts
import { ROBOTS_NOINDEX } from '$lib/seo';

// search results: always
meta: { robots: ROBOTS_NOINDEX, ... }

// an empty listing (page 1 without posts; page 2+ past the end is already a 404)
const empty = !isDataRequest && (await posts).data.length === 0;
meta: { robots: empty ? ROBOTS_NOINDEX : undefined, ... }
```

Leave it `undefined` otherwise: the layout falls back to `ROBOTS_INDEX` (`index,follow,max-snippet:-1,max-image-preview:large`). See `robots-meta`.

---

## Cache headers

Always set cache headers before returning, with a preset of `$lib/cacheControl` (see `cache-control`):

```ts
setHeaders({ 'cache-control': CACHE_CONTROL.medium }); // listings
setHeaders({ 'cache-control': CACHE_CONTROL.short }); // home, search

// the page of one post: tagged, purged by Butterfly on change
setHeaders(taggedCacheHeaders(CACHE_CONTROL.short, `post:${post.data.id}`));
```

Never `'public, max-age=300'` inline.
