---
description: Scaffold a new static SvelteKit route with +page.server.ts, +page.svelte, and a sitemap entry
argument-hint: <route-path> [content-type]
---

Scaffold a new static route at the path the user provides (argument: `$1`), with optional `content.type` override (`$2`, default: the route's last segment).

**Before touching files, read:**

1. `.claude/skills/route-server/SKILL.md` — mandatory `PageData` shape
2. `.claude/skills/static-route-sitemap/SKILL.md` — sitemap registration
3. `.claude/skills/cache-control/SKILL.md` — pick a preset

**Steps:**

1. Create the directory `src/routes/$1/`.
2. Create `+page.server.ts`:
   - Typed `PageServerLoad`
   - Returns `{ layer, meta }` — populate `content.type`, `meta.url = ${PUBLIC_BASE_URL}/$1`, `meta.title`, `meta.description`
   - `setHeaders({ 'cache-control': CACHE_CONTROL.medium })`
   - No `scope` / `feeds` unless the user asks for them (and then follow `feed-streaming` skill)
3. Create `+page.svelte`:
   - Type `data` via `$props()` + `PageData`
   - Render `<svelte:head>` with `data.meta.title` + description
   - Minimal `<main id="page">` body
4. Add the route to `src/routes/sitemaps/pages.xml/+server.ts` via `routes.push({ url: '/$1', lastmod: new Date(), changefreq: 'monthly', priority: 0.5 })`.
5. If the route lists content (author-style, tag-style), also create an RSS feed per `static-route-sitemap` — ask the user first.

After writing, **report what you scaffolded** and the follow-up work the user should do (fill copy, wire up content, add to menu).
