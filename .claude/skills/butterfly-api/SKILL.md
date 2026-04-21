---
name: butterfly-api
description: Patterns for querying the Butterfly CMS via the pre-configured `$lib/api` client. Use whenever calling `api.get`, building filters, paginating, using `include`, or reading `syndication/*` endpoints. Covers endpoints, filter syntax (categories, types, terms<slug>), pagination, relationships/include, and deep pagination.
---

# Butterfly API — `$lib/api` usage

The client is pre-configured in `src/lib/api.ts` from `PUBLIC_API_URL` + `PUBLIC_API_KEY`. Always import the default export.

```ts
import api from '$lib/api';
import type * as Butterfly from '@enodo/butterfly-ts';
```

---

## Calling shape

```ts
api.get<ResourceType>({
  fetch,                      // from the SvelteKit handler — always pass it
  endpoint?: 'posts' | 'authors' | 'categories' | 'taxonomies' | ...,
  id?: number | string,
  path?: '/v1/...',           // mutually exclusive with endpoint+id
  query?: { filter, page, sort, include },
  signal?: AbortSignal,
  intercept?: (res) => void,
});
```

Use `path` for pagination (`response.links.next`). Use `endpoint`+`id` for single resources. Use `endpoint` alone for listings.

---

## Common endpoints

| Endpoint                                | Returns                                |
| --------------------------------------- | -------------------------------------- |
| `/v1/` (via `path`)                     | `Property` (site settings)             |
| `posts`                                 | `Post[]`                               |
| `posts` + `id`                          | `Post`                                 |
| `categories`                            | `Category[]`                           |
| `authors`                               | `Author[]`                             |
| `taxonomies`                            | `Taxonomy[]`                           |
| `taxonomies/{slug}/relationships/terms` | `Term[]` / single `Term` with id       |
| `feeds/{key}`                           | Custom feed contents (e.g. `featured`) |
| `syndication/posts`                     | `SyndicatePost[]` (lightweight)        |
| `syndication/terms`                     | `SyndicateTerm[]`                      |

**Syndication endpoints** are lightweight — use them for sitemaps/feeds where you only need `id`, `slug`, `canonical`, `updatedAt`. Don't use them for full article rendering.

---

## Filters

Pass filters inside `query.filter`. Multiple filters combine with AND.

```ts
query: {
  filter: {
    types: '-page',                           // include everything except post type 'page'
    categories: '1,2,3',                      // comma-separated ids
    'terms<tags>': 42,                        // posts tagged with term id 42 from the 'tags' taxonomy
    'terms<themes>': 7,                       // custom taxonomy
    query: 'search text',                     // full-text search
    taxonomies: 'tags',                       // used on syndication/terms
  },
}
```

### `types` filter nuances

- `types: 'page'` → only `page` post type
- `types: '-page'` → everything except `page` (most common for article listings)
- Leave out entirely to get all post types

### Dynamic taxonomy filter

Always use the angle-bracket syntax `terms<{slug}>` — never hardcode field names:

```ts
filter: { [`terms<${taxonomySlug}>`]: termId }
```

---

## Pagination

```ts
query: {
  page: {
    number: 2,   // 1-indexed
    size: 18,
  },
}
```

For walking the full set, follow `response.links.next`:

```ts
const first = await api.get({ fetch, endpoint: 'posts' });
const next = first.links.next ? await api.get({ fetch, path: first.links.next }) : null;
```

For deep pagination (page 100+), use the `deep-pagination` package which handles cursor-based walking.

---

## Sorting

```ts
query: {
  sort: '-publishedAt';
} // descending
query: {
  sort: 'title';
} // ascending
```

Common fields: `publishedAt`, `updatedAt`, `createdAt`, `title`.

---

## Relationships / `include`

Butterfly follows JSON:API conventions. Related resources (authors, thumbnails, terms…) arrive in `response.included`. Use `getRelated` to resolve them.

```ts
import { getRelated } from '@enodo/butterfly-ts';

const post = await api.get<Butterfly.Post>({ fetch, endpoint: 'posts', id: 1 });
const thumbnail = getRelated(
  post.data.relationships.thumbnail.data,
  post.included,
) as Butterfly.Media;
const authors = post.data.relationships.authors.data.map(
  (a) => getRelated(a, post.included) as Butterfly.Author,
);
```

To request additional relationships, use `include`:

```ts
query: {
  include: 'thumbnail,authors,categories';
}
```

---

## Categories — `getCategoryChildrenIds`

Categories are hierarchical. To fetch all posts in a category **and its subtree**:

```ts
import { getCategoryChildrenIds } from '@enodo/butterfly-ts';

query: {
  filter: {
    types: '-page',
    categories: getCategoryChildrenIds(category, allCategories).join(','),
  },
}
```

`getCategoryChildrenIds(cat, allCats)` returns `[cat.id, ...descendantIds]`.

---

## Error handling

`ApiError` carries an HTTP status:

```ts
import { ApiError } from '@enodo/butterfly-ts';
import { error } from '@sveltejs/kit';
import httpErrors from '$lib/httpErrors';

try {
  const data = await api.get({ fetch, endpoint: 'posts', id });
  // ...
} catch (err) {
  if (err instanceof ApiError) error(err.status, httpErrors[err.status]);
  error(500, httpErrors[500]);
}
```

Use this pattern in feed endpoints and route `load` functions — never silently swallow API errors.

---

## `fetch` is non-optional in load/server contexts

Always pass the SvelteKit `fetch` (from `load`, `RequestHandler`, or `+server.ts` event). It handles SSR cookie/header propagation and SvelteKit's internal fetch optimisations. Don't use the global `fetch`.

---

## Streaming vs awaiting

Inside `+page.server.ts`, feeds must follow the `isDataRequest ? promise : await promise` pattern. See the `feed-streaming` skill. Never `await` all feeds unconditionally.

```ts
const posts = api.get<Butterfly.Post[]>({ fetch, endpoint: 'posts', query: { ... } });
return {
  feeds: { posts: isDataRequest ? posts : await posts },
};
```

---

## Quick reference

- Import: `import api from '$lib/api'`
- Full settings: `api.get<Butterfly.Property>({ fetch, path: '/v1/' })`
- Posts: `api.get<Butterfly.Post[]>({ fetch, endpoint: 'posts', query: { filter, page, sort } })`
- Taxonomy terms: `api.get<Butterfly.Term[]>({ fetch, endpoint: 'taxonomies/{slug}/relationships/terms' })`
- Resolve relationships: `getRelated(relation, response.included)`
- Category subtree: `getCategoryChildrenIds(cat, allCats).join(',')`
- Cache headers: use `CACHE_CONTROL` presets from `$lib/cacheControl` (see `cache-control` skill)
