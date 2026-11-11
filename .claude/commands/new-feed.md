---
description: Scaffold a new RSS/Atom feed endpoint under [format=feed] through $lib/server/feed
argument-hint: <path>
---

Create a new feed endpoint at `src/routes/[format=feed]/$1.xml/+server.ts`. The `[format=feed]` matcher serves `rss` and `atom` (no JSON feed) from the same file.

**Before touching files, read:**

1. `.claude/skills/static-route-sitemap/SKILL.md` — feed section (the `$lib/server/feed` helpers)
2. `src/lib/server/feed.ts` — `feedSettings`, `feedPosts`, `feedResponse`, `feedError`
3. `.claude/skills/butterfly-api/SKILL.md` — picking the right filter
4. Existing feed `src/routes/[format=feed]/tags/[id].xml/+server.ts` — reference implementation

**Steps:**

1. Ask the user what the feed should contain (tag-, author-, category-, taxonomy-filtered…) if `$1` doesn't say.
2. Create `src/routes/[format=feed]/$1.xml/+server.ts`:
   - `GET` handler, `Promise.all` of `feedSettings(fetch)`, the scope resource if any, and `feedPosts(fetch, filter)` (20 latest posts, `-publishedAt`, pages excluded)
   - `return feedResponse({ format: params.format as FeedFormat, settings, posts, title, description, path, feedPath })` — `path` is the HTML page of the feed, `feedPath` the path after `/{format}/` without `.xml`
   - `catch (err) { feedError(err); }`
   - Do **not** build a `Feed` by hand, set headers, add `Expires`, a JSON format or author emails: `feedResponse` owns the content type (`application/rss+xml` / `application/atom+xml`) and `CACHE_CONTROL.short`
3. Advertise it: a `<link rel="alternate">` branch for the page's `content.type` in `src/routes/+layout.svelte`, and an entry on `/rss.html` / `/atom.html` (`src/routes/[format=feed].html/`) if it should be listed there.

**After scaffolding**, report: file created, filter applied, where the feed is advertised.
