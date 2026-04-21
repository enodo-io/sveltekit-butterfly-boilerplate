---
description: Wire up a CMS-backed static page via PUBLIC_STATIC_PAGES
argument-hint: <slug>
---

Register a CMS-backed static page (post type `page`) at `/$1.html`, served by `src/routes/[slug=page].html/+page.svelte`.

**Before touching files, read:**

1. README section "Pages → Static Pages"
2. `.claude/skills/static-route-sitemap/SKILL.md`

**Ask the user:**

- The Butterfly **post id** for slug `$1` (they need to create it in Butterfly first if it doesn't exist)
- Whether to set a canonical URL in Butterfly (recommended)

**Steps:**

1. **Update `.env`**:
   - If `PUBLIC_STATIC_PAGES` doesn't exist, add it: `PUBLIC_STATIC_PAGES={"$1":123}`
   - If it exists, merge the entry: read current JSON, add `"$1": 123`, write back
   - Validate the result parses as JSON
2. **No route file to create** — `[slug=page].html` handles all entries in `PUBLIC_STATIC_PAGES` automatically.
3. **Sitemap**: `src/routes/sitemaps/pages.xml/+server.ts` already fetches `syndication/posts` filtered on `types: 'page'` — the page appears automatically once published in Butterfly.
4. **Add to menu/footer** if the user wants it visible — ask and update `src/components/Layout/Header.svelte` or `Footer.svelte` accordingly.

**After wiring**, report: env var updated, Butterfly id used, and remind the user to:

- Publish the post in Butterfly
- Set a canonical URL in Butterfly (strongly recommended for static pages)
- Restart the dev server to pick up the new env var (`npm run dev`)
