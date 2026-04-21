---
name: layout-server
description: Rules for `src/routes/+layout.server.ts` — the single place where site-wide settings and categories are fetched. Use when editing the root layout load function, propagating shared data to page loads via `await parent()`, or adding new cross-route server data.
---

# `+layout.server.ts` — shared server data

There is exactly one `+layout.server.ts` at `src/routes/+layout.server.ts`. It fetches the data that every page needs: the site's Butterfly `Property` (settings) and the flat list of `Category` resources.

## Current shape

```ts
export const load: ServerLoad = async ({ fetch }) => {
  if (!PUBLIC_LANGUAGE) {
    error(500, '`PUBLIC_LANGUAGE` environment variable is undefined');
  }

  const [settings, categories] = await Promise.all([
    api.get<Butterfly.Property>({ fetch, path: '/v1/' }),
    api.get<Butterfly.Category[]>({
      fetch,
      endpoint: 'categories',
      query: { page: { size: 100 } },
    }),
  ]);

  return {
    settings: settings.data.attributes, // note: unwrapped to attributes
    categories, // note: full ApiResponse (data + included)
  };
};
```

Both are typed on `App.PageData`:

- `settings: Butterfly.Property['attributes']` — the raw settings attributes (no JSON:API wrapping).
- `categories: Butterfly.ApiResponse<Butterfly.Category[]>` — the full response.

This asymmetry is intentional: `settings` is consumed widely as a flat object; `categories` often needs `included` data for relationships, so the whole response stays.

---

## Consuming in a child `+page.server.ts`

Use `parent()` to read the layout's data:

```ts
export const load: PageServerLoad = async ({ parent, fetch, isDataRequest, setHeaders }) => {
  const { settings, categories } = await parent();

  // Now you have settings.title, settings.description, categories.data, etc.
  // Build meta / feeds using them.
};
```

**Always `await parent()` before using its data** — it's a promise.

**Don't call `parent()` if you don't need it.** The await adds a microtask; skip it when the page loads independent data.

---

## When to add something to the layout

Add to `+layout.server.ts` only if **all** of the following hold:

- [ ] Every page needs it (or >80%).
- [ ] It's cheap to fetch once per SSR request.
- [ ] It doesn't change per-route (or the layout knows when to refetch).

Otherwise, fetch it in the route that needs it.

**Good candidates**: global menu, site-wide banners, feature flags.
**Bad candidates**: per-article data, pagination state, search results.

---

## Error handling

The current load throws a 500 when `PUBLIC_LANGUAGE` is missing, and catches API errors with `httpErrors[500]`. Keep this pattern:

```ts
try {
  // ... fetches
} catch (err) {
  console.error('[Layout]', err);
  error(500, httpErrors[500]);
}
```

A layout failure cascades to every route — never silently swallow it.

---

## Caching

The layout itself doesn't set cache headers — page loads do. This is correct: layout data is cheap and revalidates often. Page-level `setHeaders` controls the final HTTP cache.

If you add expensive layout data, consider memoising via a module-level cache with a TTL — but document it clearly. Don't add caching "just in case".

---

## Rendering

The layout's `+layout.svelte` receives `data.settings`, `data.categories`, plus the child's `data`. Use them for:

- `<html lang>` — already driven by `PUBLIC_LANGUAGE` via `app.html`.
- Header title/logo — `data.settings.title`, `data.settings.logo`.
- Footer — site copyright, publisher info.
- Navigation — `data.categories.data`.
- JSON-LD — `WebSite` and `Organization` schemas read from `settings`.

---

## What NOT to do

- Don't `await api.get(...)` twice for the same resource in the layout. Use `Promise.all`.
- Don't fetch per-route data here — it bloats every page's SSR.
- Don't return anything route-specific (e.g. article id, search query) — that belongs in `+page.server.ts`.
- Don't forget `fetch` — always pass the SvelteKit `fetch`, never the global one.
- Don't extend `PageData` without also updating `App.PageData` in `src/app.d.ts`.
