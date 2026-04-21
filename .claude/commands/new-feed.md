---
description: Scaffold a new RSS/Atom/JSON feed endpoint under [format=feed]
argument-hint: <path>
---

Create a new feed endpoint at `src/routes/[format=feed]/$1.xml/+server.ts`. The `[format=feed]` matcher serves `rss`, `atom`, and `json` formats from the same file.

**Before touching files, read:**

1. `.claude/skills/static-route-sitemap/SKILL.md` — feed section
2. `.claude/skills/butterfly-api/SKILL.md` — picking the right query
3. `.claude/skills/http-errors/SKILL.md` — ApiError handling
4. `.claude/skills/cache-control/SKILL.md` — use `CACHE_CONTROL.short`
5. Existing feed `src/routes/[format=feed]/index.xml/+server.ts` — reference implementation

**Steps:**

1. Ask the user what the feed should contain (all posts, tag-filtered, author-filtered, category-filtered…) if not obvious from `$1`.
2. Create `src/routes/[format=feed]/$1.xml/+server.ts`:
   - `GET` RequestHandler reading `params.format` (`'rss' | 'atom' | 'json'`)
   - Fetch settings (`api.get({ path: '/v1/' })`) + posts with the right filter
   - Build a `Feed` from the `feed` package with `title`, `description`, `id`, `link`, `language`, `image`, `favicon`, `copyright`, `updated`, `generator: 'Enodo Butterfly'`, `ttl: 120`, `feedLinks` (rss/atom/json)
   - Add items with `title`, `id`, `link`, `description`, `date`, `image` (via `getMediaUrl`), `author`
   - Map `format` → `feed.rss2 / feed.atom1 / feed.json1`
   - Set headers: `Expires` (+120s), `Cache-Control: CACHE_CONTROL.short`, `Content-Type: text/xml`
   - Wrap in `try/catch` — on `ApiError` throw `error(err.status, httpErrors[err.status])`; else `error(500, httpErrors[500])`
3. Add the feed to `src/routes/rss.html/+page.svelte` (RSS directory) if the user wants it discoverable.

**After scaffolding**, report: file created, filter applied, and whether the feed was added to the RSS directory.
