# CLAUDE.md

Instructions for Claude Code when working in this repository. Keep this file in sync with the skills under `.claude/skills/` — when they disagree, the skill wins.

## What this repo is

SvelteKit boilerplate for the **Enodo Butterfly CMS**. Ships a production-grade blog/magazine frontend: SEO, a11y, RSS, sitemaps, JSON-LD, GTM, streaming feeds. Intentionally neutral design — consumers fork and customise.

## Stack

- **SvelteKit 2** with **Svelte 5 (Runes)** — no legacy stores/reactive statements
- **TypeScript** everywhere (`tsconfig.json`)
- **Tailwind CSS v4** (JIT, `@theme` tokens) — see `src/assets/styles/tailwind.css`
- **[@enodo/butterfly-ts](https://github.com/enodo-io/butterfly-ts)** API client — wrapped in `src/lib/api.ts`
- **[@enodo/tailwindcss-foundation](https://github.com/enodo-io/tailwindcss-foundation)** — design tokens (typography `fs-*`, spacing SU1–16, z-index `z-*`)
- **Vitest** (browser mode via `vitest-browser-svelte`) + **Playwright** for e2e
- **Adapter**: `@sveltejs/adapter-node` (switchable)

## Commands

```bash
npm run setup            # Interactive env wizard (.env generation)
npm run dev              # Dev server (runs setup:breakpoints first)
npm run check            # svelte-check (tsconfig)
npm run test:unit        # Vitest
npm run test:e2e         # Playwright
npm run test             # Both
npm run build            # Production build
npm run lint             # Prettier check + ESLint
npm run format           # Prettier write
npm run generate:favicons # Regen favicons from static/favicon.svg
```

## Architectural invariants (non-negotiable)

### Route load functions

Every `+page.server.ts` returns the shape defined in `src/app.d.ts` → `App.PageData`:

```ts
{
  layer: { 'content.type': string, ... },  // REQUIRED — GTM data layer
  meta:  { url, title, description, robots? },  // REQUIRED — SEO
  scope?: ApiResponse<Resource>,           // Single entity this page is about
  feeds?: Record<string, ApiResponse|Promise>,  // Streaming lists
}
```

**Always read `.claude/skills/route-server/SKILL.md` before creating/editing a `+page.server.ts`.**

### Feed streaming

`feeds` values must follow the `isDataRequest ? promise : await promise` pattern. Never await feed promises unconditionally — it breaks streaming on initial SSR and kills TTFB. See `.claude/skills/feed-streaming/SKILL.md`.

### New routes need a sitemap entry

Any new static route (no dynamic params, not CMS-backed) **must** be added to `src/routes/sitemaps/pages.xml/+server.ts` or it's invisible to search engines. Content-listing routes also need a feed in `src/routes/[format=feed]/`. See `.claude/skills/static-route-sitemap/SKILL.md`.

### Taxonomies follow the `tags` pattern

`tags` is the reference implementation. New taxonomies replicate its structure (routes, sitemap, robots, feed). See `.claude/skills/taxonomies/SKILL.md`.

### One language at a time

The boilerplate is **written in English**. A consuming site serves one language at a time, configured via `PUBLIC_LOCALE` + `PUBLIC_LANGUAGE`. The `translate` skill localises all hardcoded strings (routes, components, `formatRelativeDate.ts`, `httpErrors.ts`…) to the site's chosen language. See `.claude/skills/translate/SKILL.md`.

True multi-language support (multiple locales live in the same deployment) is **not shipped out of the box**. A consumer who needs it should evolve the boilerplate — [Paraglide](https://inlang.com/m/gerre34r/library-inlang-paraglideJs) is the recommended fit with SvelteKit. Treat that as a scoped migration, not a translation task.

## Design system rules

These are enforced by a `PostToolUse` hook — violations will be flagged. Learn them.

| Rule            | Do                                          | Don't                                    | Skill             |
| --------------- | ------------------------------------------- | ---------------------------------------- | ----------------- |
| Font sizes      | `fs-canon`, `fs-trafalgar`, `fs-body-copy`… | `text-sm`, `text-lg`, raw `font-size`    | `typography`      |
| Spacing         | `p-4`, `gap-7` (BBC GEL scale, SU 1–16)     | `p-[20px]`, `m-[2rem]`, scale stacking   | `spacing`         |
| Z-index         | `z-modal`, `z-nav`, `z-dropdown`…           | `z-10`, `z-50`, raw `z-index`            | `z-index`         |
| Fonts           | Fontsource npm packages                     | Google Fonts `<link>`, `@import` CDN     | `fonts`           |
| Links           | `<h3><a>text</a></h3>`, `::after` trick     | `<a>` wrapping blocks, "click here" text | `seo-links`       |
| Cards           | Title-first DOM, `order` for visual reorder | Whole card inside `<a>`                  | `card`            |
| Tailwind vs CSS | Utilities inline                            | Custom class for a single-use element    | `css-vs-tailwind` |
| Interactive UI  | `<dialog>`, `popover`, `<details>`          | `<div>` + state + JS toggle              | `html-first`      |

**`fs-*` classes must NEVER be inside `@apply`** — keep them as Tailwind classes on the element so typography stays overridable at the template level.

## Environment variables

Required:

- `PUBLIC_BASE_URL` — canonical site URL
- `PUBLIC_API_URL` + `PUBLIC_API_KEY` — Butterfly API (Butterfly → Property → Administration → Settings)
- `PUBLIC_MEDIA_URL` — Butterfly media domain
- `PUBLIC_LOCALE` + `PUBLIC_LANGUAGE`

Optional:

- `PUBLIC_STATIC_PAGES` — JSON map of slug → id for CMS-backed static pages
- `PUBLIC_INDEXABLE` — set to `false` on staging/dev
- `PUBLIC_GTM_ID`

Butterfly CMS prerequisites: taxonomy `tags`, post type `page`, custom feed `featured`. See README for details.

## File layout at a glance

```
src/
├── app.d.ts                 ← PageData contract
├── hooks.server.ts          ← DNS cache (cacheable-lookup)
├── service-worker.ts
├── lib/
│   ├── api.ts               ← Butterfly client (env-driven)
│   ├── cacheControl.ts      ← short/medium/long/longer/day presets
│   ├── getMediaUrl.ts       ← media URL builder
│   ├── httpErrors.ts        ← user-facing messages for 4xx/5xx
│   ├── formatRelativeDate.ts
│   ├── stripScripts.ts
│   ├── breakpoints.ts       ← auto-generated, do not edit
│   └── JsonLD/              ← typed schema-dts generators
├── components/
│   ├── Card, Feed, Pagination, Breadcrumb, Image, Picture, Dialog, GTM…
│   ├── Layout/Header, Footer
│   └── Post/Body + Post/Elements/* + Post/InlineNodes/*
├── routes/
│   ├── +layout.server.ts    ← settings + categories (shared)
│   ├── +page.server.ts      ← home
│   ├── [slug=post].html/    ← article
│   ├── [slug=page].html/    ← CMS static page
│   ├── [...path]/           ← category
│   ├── articles, authors, tags, search
│   ├── sitemaps/*.xml/      ← index, news, sections, tags, authors, pages, posts
│   └── [format=feed]/       ← rss | atom | json (matcher on format)
├── params/                  ← route matchers (feed, page, post)
└── directives/clickoutside.ts
```

## When to reach for a skill

Claude: **load the skill before acting** when any of these apply.

| Touching / creating                              | Skill                  |
| ------------------------------------------------ | ---------------------- |
| `+page.server.ts`                                | `route-server`         |
| `+layout.server.ts`                              | `layout-server`        |
| A new static route                               | `static-route-sitemap` |
| A taxonomy (routes + sitemap + feed)             | `taxonomies`           |
| Translating to another language                  | `translate`            |
| Calling the Butterfly API (`api.get`)            | `butterfly-api`        |
| Adding/editing JSON-LD schemas                   | `jsonld-schema`        |
| Using `<Image>` / `<Picture>`                    | `image-picture`        |
| Feed pagination / streaming                      | `feed-streaming`       |
| Customising article body rendering (`Post/Body`) | `post-body`            |
| Pushing GTM events                               | `gtm-events`           |
| Writing Svelte components                        | `svelte5-runes`        |
| Choosing a cache header                          | `cache-control`        |
| Error pages / `error()` usage                    | `http-errors`          |
| Writing tests                                    | `testing`              |
| Any `<a>` tag                                    | `seo-links`            |
| Any card / article preview                       | `card`                 |
| Font sizes                                       | `typography`           |
| Spacing (margin/padding/gap)                     | `spacing`              |
| Z-index                                          | `z-index`              |
| Adding/removing a font                           | `fonts`                |
| Any interactive UI (modals, menus, accordions)   | `html-first`           |
| Deciding Tailwind utility vs custom class        | `css-vs-tailwind`      |

## Working style

- **Measure twice, cut once.** The design system is strict — breaking a rule silently creates regressions that are hard to spot in review.
- **Read the skill before writing code.** Skills are short and specific; re-reading is cheap.
- **Don't introduce abstractions.** This is a boilerplate — consumers will fork and adapt. Explicit code beats clever indirection.
- **One language at a time by default.** The `translate` skill localises the boilerplate to the site's chosen language. If the user genuinely needs multi-language support (multiple locales in one deployment), that's an **explicit boilerplate evolution** — Paraglide is the recommended path with SvelteKit — not a silent add. Flag it clearly before touching code.
- **Be conservative about dependencies.** The stack is deliberate. Adding a library should be justified.

## Slash commands

Scaffolding and audits live in `.claude/commands/`:

- `/new-route <name>` — scaffold a static route + sitemap entry
- `/new-taxonomy <slug> <singular>` — full taxonomy scaffold (routes + sitemap + feed)
- `/new-jsonld <SchemaName>` — new JSON-LD generator + register in index
- `/new-feed <path>` — new `[format=feed]/<path>.xml` endpoint
- `/translate-to <lang>` — run the `translate` skill end-to-end
- `/change-palette` — rewrite the `@theme` colour tokens
- `/audit-seo` — sweep for SEO/a11y/design-system violations
- `/check-butterfly-env` — validate `.env` + ping the API
- `/add-static-page <slug>` — wire up a CMS-backed static page

## Agents

Specialist subagents under `.claude/agents/`:

- `butterfly-explorer` — navigates `@enodo/butterfly-ts` types and API surface
- `seo-auditor` — finds violations of the SEO skills repo-wide
- `a11y-auditor` — accessibility sweep (aria, focus, semantics)
- `perf-reviewer` — LCP, streaming, lazy-loading, preload
