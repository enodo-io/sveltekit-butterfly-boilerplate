---
name: feed-streaming
description: Stream feed data to the client via Svelte's promise rendering. Use whenever a route returns a list of API resources (posts, terms, authors…) that can load progressively. Covers the `isDataRequest` pattern, the `<Feed>` component, skeleton loaders, pagination with `<Pagination>`, and when to await vs stream.
---

# Feed streaming — SSR + client progressive hydration

SvelteKit allows returning unresolved promises from `load` — they stream to the client and resolve client-side without blocking the HTML response. This is how the boilerplate renders content-heavy pages fast.

## The golden pattern

```ts
// +page.server.ts
export const load: PageServerLoad = async ({ fetch, isDataRequest, setHeaders }) => {
  const posts = api.get<Butterfly.Post[]>({ fetch, endpoint: 'posts', query: { ... } });

  setHeaders({ 'cache-control': CACHE_CONTROL.short });
  return {
    layer: { 'content.type': 'articles' },
    meta: { ... },
    feeds: {
      posts: isDataRequest ? posts : await posts,
    },
  };
};
```

**Read the shape carefully.** `posts` is a **promise** (no `await` on creation). Then:

- `isDataRequest === true` → pagination/load-more / CSR navigation → pass the promise, let the client resolve it progressively
- `isDataRequest === false` → initial SSR → `await` so the HTML has the content baked in for SEO

Never `await` unconditionally. Never skip `await` on the SSR side.

---

## Why this shape matters

- **SEO**: initial SSR must include the list in HTML — crawlers don't wait for promises.
- **TTFB**: subsequent navigations return the promise, stream as it resolves, and don't block the response.
- **GTM data layer**: the `layer` object resolves immediately; feeds can load behind it without delaying analytics.

Breaking the pattern breaks one of the three.

---

## Conditional feeds

When a feed is conditional (e.g. no search query → no results):

```ts
const query = url.searchParams.get('q');
const posts = query ? api.get<Butterfly.Post[]>({ ... }) : undefined;

return {
  feeds: {
    posts: isDataRequest && posts ? posts : await posts,
  },
};
```

The `await` works fine with `undefined`.

---

## Nested feeds (home page)

When you have a map of feeds (e.g. one per category on the home page), keep the promises in a record and resolve all at once on SSR:

```ts
const categoriesFeed: Record<number, Promise<Butterfly.ApiResponse<Butterfly.Post[]>>> = {};
categories.data.forEach((c) => {
  categoriesFeed[c.id] = api.get({ fetch, endpoint: 'posts', query: { ... } });
});

async function promiseAll(obj: Record<string, unknown>) {
  const entries = Object.entries(obj);
  const results = await Promise.all(entries.map(([, p]) => p));
  return Object.fromEntries(entries.map(([k], i) => [k, results[i]]));
}

return {
  feeds: {
    categories: isDataRequest ? categoriesFeed : await promiseAll(categoriesFeed),
  },
};
```

This is exactly what `src/routes/+page.server.ts` does.

---

## Rendering — `<Feed>` component

```svelte
<script>
  import Feed from '$components/Feed.svelte';
  let { data } = $props();
</script>

<Feed feed={data.feeds.posts} length={9} lazyloadAfter={3} />
```

`<Feed>` handles:

- Promise resolution with a skeleton loader (`length` = skeleton count)
- Graceful empty state
- Per-card props (`format`, `width`, `widths`, `sizes`, `heading`, `thumbnail`, `resume`, `author`, `date`)
- Eager-load opt-out for the first N cards via `lazyloadAfter` (see `image-picture` skill)

`length` should match the expected page size so the skeleton matches the real layout and avoids CLS.

---

## Pagination

```svelte
<script>
  import Pagination from '$components/Pagination.svelte';
</script>

<Pagination
  current={page}
  max={totalPages}
  url={(p) => `/articles?page=${p}`}
  pad={2}
  label="Load more articles"
/>
```

For infinite scroll, pass `onload` and `next`:

```svelte
<Pagination
  current={page}
  max={totalPages}
  onload={async () => {
    /* load next */ return hasMore;
  }}
  next={hasMore}
  infiniteScroll
/>
```

---

## Deep pagination

For pages beyond ~100, use the `deep-pagination` package to walk cursors efficiently. Don't just bump `page[number]` — offset pagination is O(n) on the DB.

---

## Common mistakes

- **Awaiting inside the feeds object**: `feeds: { posts: await posts }` on every request — breaks streaming entirely.
- **Forgetting `await` on initial SSR**: the promise never resolves before HTML flushes; empty content ships to crawlers.
- **Creating the promise inside the returned object**: `feeds: { posts: api.get(...) }` — fine, but then the `isDataRequest` branch can't short-circuit; keep the promise in a variable.
- **Using `<Feed>` without matching `length`**: skeleton is off-size → layout shift on resolution.

---

## Quick mental model

```
     load() called on SvelteKit route
              │
     ┌────────┴────────┐
   SSR              isDataRequest
   (first request)   (pagination / nav / CSR)
     │                  │
   await promise     return promise
   → HTML has data   → client streams result
   → SEO ok          → fast TTFB
```

If you're editing a feed route and that picture doesn't hold, the streaming is broken.
