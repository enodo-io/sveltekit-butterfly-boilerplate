---
name: taxonomies
description: Guide for working with Butterfly CMS taxonomies. Use when the user wants to create pages for a custom taxonomy, use a taxonomy for article display, or use taxonomy terms as API filters. Tags are the default built-in taxonomy — custom taxonomies follow the same patterns. Covers routes, server load functions, sitemaps, sitemap index, and robots.txt.
---

# Taxonomies — Butterfly CMS

Taxonomies are user-defined classification systems for grouping posts (e.g. "tags", "themes", "formats", "regions"). Each taxonomy contains **terms** (the individual labels). `tags` is the built-in taxonomy — all custom taxonomies follow the same API patterns.

## Fetch all available taxonomies

```ts
const taxonomies = await api.get({ fetch, endpoint: 'taxonomies' });
```

Each taxonomy has a `slug` (e.g. `"themes"`) used in all API calls.

---

## Three usage modes

### Mode 1 — Listing pages (like tags)

Full public route: an index page listing all terms, and a detail page listing posts for each term.

**→ See the full checklist below.**

### Mode 2 — Display only

Show taxonomy terms on article pages without dedicated routes. No routes, no sitemap needed. Fetch terms from the post's relationships or filter posts by term in related content widgets.

Filter posts by a term:

```ts
filter: { 'terms<taxonomy-slug>': termId }
```

### Mode 3 — API filtering only

Use taxonomy terms silently as filters for related post algorithms. No display, no routes.

```ts
// Posts in the same "themes" term as current post:
filter: { 'terms<themes>': currentPost.relationships.terms.themes?.data?.id }
```

---

## API patterns

```ts
// All terms of a taxonomy
api.get<Butterfly.Term[]>({ fetch, endpoint: 'taxonomies/{slug}/relationships/terms' });

// One term
api.get<Butterfly.Term>({ fetch, endpoint: 'taxonomies/{slug}/relationships/terms', id });

// Posts filtered by term
api.get<Butterfly.Post[]>({
  fetch,
  endpoint: 'posts',
  query: {
    filter: { types: '-page', 'terms<{slug}>': termId },
  },
});

// Syndication (for sitemaps)
api.get<Butterfly.SyndicateTerm[]>({
  fetch,
  endpoint: 'syndication/terms',
  query: {
    filter: { taxonomies: '{slug}' },
  },
});
```

Replace `{slug}` with the taxonomy slug (e.g. `themes`, `formats`).

---

## Mode 1 checklist — full listing pages

Use `tags` as the reference implementation. Replace `tags` / `tag` with the new taxonomy slug / singular name throughout.

### 1. Routes

```
src/routes/{slug}/
├── +page.svelte          ← index: list all terms
├── +page.server.ts       ← mirrors src/routes/tags/+page.server.ts
├── [id]/
│   ├── +page.svelte      ← detail: list posts for one term
│   └── +page.server.ts   ← mirrors src/routes/tags/[id]/+page.server.ts
```

**Index server** — fetch all terms via `syndication/terms`:

```ts
const terms = api.get<Butterfly.SyndicateTerm[]>({
  fetch,
  endpoint: 'syndication/terms',
  query: { filter: { taxonomies: '{slug}' } },
});
// layer: { 'content.type': '{slug}s' }
// meta: { url: `${PUBLIC_BASE_URL}/{slug}`, ... }
// feeds: { terms: isDataRequest ? terms : await terms }
```

**Detail server** — fetch one term + its posts:

```ts
const term = await api.get<Butterfly.Term>({
  fetch,
  endpoint: 'taxonomies/{slug}/relationships/terms',
  id,
});
const posts = (async () =>
  api.get<Butterfly.Post[]>({
    fetch,
    endpoint: 'posts',
    query: {
      filter: { types: '-page', 'terms<{slug}>': term.data.id },
      page: { size: 18, number: page },
    },
  }))();
// layer: { 'content.type': '{singular}', 'content.id': term.data.id, 'page.index': page }
// scope: term
// feeds: { posts: isDataRequest ? posts : await posts }
```

### 2. Sitemap — `src/routes/sitemaps/{slug}.xml/+server.ts`

Mirror `src/routes/sitemaps/tags.xml/+server.ts`, changing the taxonomy filter:

```ts
const terms = await api.get<Butterfly.SyndicateTerm[]>({
  fetch,
  endpoint: 'syndication/terms',
  query: { filter: { taxonomies: '{slug}' } },
});
const routes = terms.data.map((term) => ({
  url: `/{slug}/${term.id}.html`,
  lastmod: new Date(),
  changefreq: 'daily',
  priority: 0.8,
}));
```

### 3. Sitemap index — `src/routes/sitemaps/index.xml/+server.ts`

Add the new sitemap to the `sitemaps` array:

```ts
{ url: `${PUBLIC_BASE_URL}/sitemaps/{slug}.xml`, lastmod },
```

### 4. `static/robots.txt`

Add a `Sitemap:` line alongside the existing ones:

```
Sitemap: https://your-domain.com/sitemaps/{slug}.xml
```

---

## Checklist summary (Mode 1)

- [ ] `src/routes/{slug}/+page.server.ts` + `+page.svelte`
- [ ] `src/routes/{slug}/[id]/+page.server.ts` + `+page.svelte`
- [ ] `src/routes/sitemaps/{slug}.xml/+server.ts`
- [ ] Entry added in `src/routes/sitemaps/index.xml/+server.ts`
- [ ] `Sitemap:` line added in `static/robots.txt`
- [ ] Follow `route-server` skill for the standard return structure
- [ ] Follow `static-route-sitemap` skill if adding a static index page (e.g. `/{slug}`)
