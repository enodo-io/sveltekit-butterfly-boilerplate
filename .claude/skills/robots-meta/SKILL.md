---
name: robots-meta
description: Control per-page indexing via `meta.robots` returned from `+page.server.ts`. Use when deciding whether a route should be indexed, followed, or excluded from search engines. Covers the default, common overrides (search → noindex,follow; filtered listings → noindex), and how it interacts with `PUBLIC_INDEXABLE`.
---

# `meta.robots` — per-page indexing control

The layout emits a `<meta name="robots">` tag based on `data.meta.robots` (from `App.PageData`). If omitted, the layout falls back to the default policy derived from `PUBLIC_INDEXABLE`.

## Default policy

- `PUBLIC_INDEXABLE === 'true'` (or undefined) → default to `index,follow` for every route that doesn't override `meta.robots`.
- `PUBLIC_INDEXABLE === 'false'` → force `noindex,nofollow` on every page (staging/dev). Route-level overrides still apply.

**Most routes should not set `meta.robots`.** Leave it unset so the default flows through.

---

## When to override

### `noindex,follow` — search results

The canonical case. `/search?q=...` pages must not be indexed (duplicate content risk + low-quality pages) but links out should still pass authority.

```ts
// src/routes/search/+page.server.ts
return {
  layer: { 'content.type': 'search', 'page.query': query },
  meta: {
    url: `${PUBLIC_BASE_URL}/search`,
    title: query ? `Search results for ${query}` : 'Search',
    description: '...',
    robots: 'noindex,follow',
  },
};
```

### `noindex,follow` — heavily filtered listings

Any URL with `?filter=...`, `?sort=...`, `?tag=...&author=...` that produces a variant of an existing canonical page. Google calls these "thin variations". Indexing them dilutes the canonical page's authority.

Rule of thumb: if the URL could produce hundreds of permutations, `noindex,follow`.

### `noindex,nofollow` — internal/preview pages

Admin previews, draft pages, internal tools. These should rarely be in a public SvelteKit route — but if they are, mark them hard.

### Default `index,follow` — don't set explicitly

Resist the urge to set `robots: 'index,follow'` "for clarity". It's the default. Setting it adds noise and becomes a maintenance trap when the default changes.

---

## Pagination — keep indexed, use canonical

Do **not** `noindex` page 2+ of a listing. Modern Google indexes paginated series natively — `noindex` would prune the deep content. Instead:

- Keep `index,follow` on every page.
- Make sure `meta.url` includes the `?page=N` query (so the canonical is correct for each page).
- Add `rel="next"` / `rel="prev"` if you want belt-and-braces (optional; not critical).

---

## Faceted URLs — matrix of rules

| URL pattern                               | Default robots         | Rationale                               |
| ----------------------------------------- | ---------------------- | --------------------------------------- |
| `/category` (index)                       | `index,follow`         | Canonical listing                       |
| `/category?page=2`                        | `index,follow`         | Pagination is indexable                 |
| `/category?sort=date`                     | `noindex,follow`       | Thin variation of `/category`           |
| `/category?filter=free`                   | `noindex,follow`       | Same                                    |
| `/category?tag=cooking`                   | `noindex,follow` or redirect to `/tags/cooking` | Duplicate of tag page |
| `/search` (no query)                      | `noindex,follow`       | Empty search                            |
| `/search?q=...`                           | `noindex,follow`       | Infinite variations                     |
| `/admin/*`                                | `noindex,nofollow`     | Internal                                |

---

## Interaction with `PUBLIC_INDEXABLE=false`

When staging sets `PUBLIC_INDEXABLE=false`, the layout emits `noindex,nofollow` for every page. Route overrides still take effect, so a route setting `robots: 'index,follow'` **would override** the staging block — which is almost always a mistake. Don't force-index from a route.

---

## How to read the current layout logic

The layout's `+layout.svelte` contains the `<svelte:head>` with:

```svelte
<meta name="robots" content={data.meta.robots ?? (PUBLIC_INDEXABLE === 'false' ? 'noindex,nofollow' : 'index,follow')} />
```

If you change this logic, mirror the change in this skill.

---

## Also tell crawlers via `robots.txt`

Some paths should be blocked at the robots.txt level too (admin URLs, API endpoints that serve HTML). `static/robots.txt` is the source of truth for crawl-level blocks. `meta.robots` is for index-level decisions after crawling. Use both when a URL is truly off-limits.

---

## Checklist

- [ ] Is the default (`index,follow`) what this route needs? → don't set `robots`.
- [ ] Is this a search / thin / faceted URL? → `noindex,follow`.
- [ ] Is this an internal / preview / admin URL? → `noindex,nofollow`.
- [ ] Is this pagination (page 2+)? → **do not** `noindex`; just make sure `meta.url` includes the page query.
- [ ] Is staging blocked via `PUBLIC_INDEXABLE=false`? → verify by inspecting the page HTML, not just the env var.
- [ ] Should this URL also be in `robots.txt` `Disallow`? → if truly off-limits, yes.
