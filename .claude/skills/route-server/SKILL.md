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
    'content.id'?: number | string;
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
  setHeaders({ 'cache-control': 'public, max-age=300' });
  return {
    layer: {
      'content.type': 'home', // see values below
    },
    meta: {
      url: `${PUBLIC_BASE_URL}/your-route`,
      title: 'Page title',
      description: 'Page description for SEO.',
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

```ts
const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));

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

## `meta.robots` — when to override

Only override when the default `index,follow` is wrong for the route:

```ts
// Search results: don't index
meta: { robots: 'noindex,follow', ... }
```

Do not set `robots` otherwise — the layout handles the default.

---

## Cache headers

Always set cache headers before returning:

```ts
setHeaders({ 'cache-control': 'public, max-age=300' }); // 5 min default
// Search results or real-time data:
setHeaders({ 'cache-control': 'public, max-age=120' }); // 2 min
```
