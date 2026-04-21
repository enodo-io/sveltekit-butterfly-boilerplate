---
description: Scaffold a full custom taxonomy (routes + sitemap + feed + robots entry)
argument-hint: <slug> <singular-name>
---

Scaffold a new Butterfly taxonomy for slug `$1` with singular name `$2` (e.g. `/new-taxonomy themes theme`). Use `tags` as the reference implementation — mirror its structure exactly, replacing `tags`/`tag` with `$1`/`$2`.

**Before touching files, read:**

1. `.claude/skills/taxonomies/SKILL.md` — the full Mode 1 checklist
2. `.claude/skills/route-server/SKILL.md` — load function shape
3. `.claude/skills/butterfly-api/SKILL.md` — `terms<slug>` filter syntax
4. `.claude/skills/feed-streaming/SKILL.md` — streaming pattern for lists

**Checklist (produce all of these):**

- [ ] `src/routes/$1/+page.server.ts` — list all terms via `syndication/terms` with filter `taxonomies: '$1'`
- [ ] `src/routes/$1/+page.svelte` — mirrors `src/routes/tags/+page.svelte`
- [ ] `src/routes/$1/[id]/+page.server.ts` — one term + its posts, filter `terms<$1>: term.data.id`
- [ ] `src/routes/$1/[id]/+page.svelte` — mirrors `src/routes/tags/[slug]/+page.svelte`
- [ ] `src/routes/sitemaps/$1.xml/+server.ts` — mirror `sitemaps/tags.xml` with taxonomy filter `$1`
- [ ] Add `${PUBLIC_BASE_URL}/sitemaps/$1.xml` to `src/routes/sitemaps/index.xml/+server.ts`
- [ ] Append `Sitemap:` line for `$1.xml` to `static/robots.txt`
- [ ] Optionally add `/rss/$1/[id].xml` feed — mirror `[format=feed]/tags/[id].xml`

Use `content.type: '$1'` for the index and `content.type: '$2'` for detail pages. Pass the taxonomy slug dynamically — never hardcode field names outside the `terms<$1>` interpolation.

**After scaffolding**, report: files created, sitemap index updated (yes/no), robots.txt updated (yes/no), and what the user needs to do next (translate strings, add to menu, tune cache).
