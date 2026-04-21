---
name: params-matchers
description: Add or edit SvelteKit route parameter matchers under `src/params/`. Use when creating a new `[param=matcher]` directory in `src/routes/`, gating a route by format/slug/id shape, or understanding what the existing `feed`, `page`, and `post` matchers do. Covers the `ParamMatcher` type, filesystem conventions, and when a matcher beats an `if`-check inside the load function.
---

# SvelteKit param matchers — `src/params/`

A matcher is a small function that decides whether a URL segment qualifies for a given route. Matchers live in `src/params/{name}.ts` and are referenced from route directory names like `[param=name]`.

## The existing matchers

| File                 | Matches                                                      | Used by                                   |
| -------------------- | ------------------------------------------------------------ | ----------------------------------------- |
| `src/params/feed.ts` | `param === 'rss' \|\| param === 'atom'`                      | `/[format=feed]/...` feed routes          |
| `src/params/page.ts` | `param in JSON.parse(PUBLIC_STATIC_PAGES \|\| '{}')`         | `/[slug=page].html` static pages          |
| `src/params/post.ts` | Ends with `-<digits>` (so `my-article-42` matches, `tags` doesn't) | `/[slug=post].html` article pages   |

Read them before writing a new one — they're each 1–4 lines.

---

## The shape

```ts
// src/params/{name}.ts
import type { ParamMatcher } from '@sveltejs/kit';

export const match: ParamMatcher = (param) => {
  // return true if `param` (a URL segment) qualifies, else false
  return /* boolean */;
};
```

Export a single named `match`. Return a boolean. Keep it pure and fast — SvelteKit calls it on every request.

---

## Referencing from routes

```
src/routes/
├── [format=feed]/         ← uses src/params/feed.ts
├── [slug=page].html/      ← uses src/params/page.ts
└── [slug=post].html/      ← uses src/params/post.ts
```

The bracketed name before `=` is the parameter name inside `params` (e.g. `params.format`, `params.slug`). The name after `=` is the matcher filename (without extension).

---

## When to add a matcher vs an `if`-check

Use a matcher when:

- **Multiple routes share the same URL shape** and need to discriminate (e.g. `/my-article-42` vs `/my-tag` vs `/about`). A matcher routes early, so each `+page.svelte` stays focused.
- **You want a 404 for non-matching URLs**, not a 200 with an error. Matchers produce "no route matched" → native 404.
- **The check is purely syntactic** (regex on the segment, lookup in a static map).

Use an `if`-check inside the load function when:

- The decision depends on **data**, not the URL shape (e.g. "is this post published?").
- You want a **custom error message** (via `error(404, '...')`).

---

## Rules

- **Matchers run on every navigation**. Keep them synchronous and O(1). No `fetch`, no DB access.
- **Use `PUBLIC_*` env vars** if the matcher depends on configuration (see `page.ts` reading `PUBLIC_STATIC_PAGES`).
- **Export `match` only** — no default export, no extra exports.
- **Type with `ParamMatcher`** from `@sveltejs/kit` — it's a one-line import.

---

## Adding a new matcher — checklist

1. Create `src/params/{name}.ts` with the `match` function.
2. Rename the route directory to `[param={name}]/`.
3. If the matcher reads env vars, make sure they're in `.env.example` and documented in the README's "Environment Variables" section.
4. Test both a qualifying URL (expect the page to render) and a non-qualifying URL (expect 404).

---

## Example — matcher for lowercase alphanumeric slugs

```ts
// src/params/slug.ts
import type { ParamMatcher } from '@sveltejs/kit';

export const match: ParamMatcher = (param) => /^[a-z0-9-]+$/.test(param);
```

Used as `src/routes/category/[name=slug]/`.

---

## What NOT to do

- Don't `await` inside a matcher. They must be synchronous.
- Don't throw — return `false` for non-matches.
- Don't duplicate logic between a matcher and a load-function check. Pick one.
- Don't read cookies/session — that's `hooks.server.ts`, not a matcher.
