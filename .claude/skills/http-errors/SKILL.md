---
name: http-errors
description: Error handling across routes, feeds, and endpoints using `$lib/httpErrors` and SvelteKit's `error()` helper. Use whenever a `+page.server.ts`, `+server.ts`, or `+layout.server.ts` needs to surface an API failure, a missing resource, or a validation problem. Covers the status-code → user message map, `ApiError` catching, and the `+error.svelte` fallback.
---

# HTTP errors — consistent error surfacing

The boilerplate ships `src/lib/httpErrors.ts` with user-friendly messages for the common HTTP status codes. All server-side failures should flow through this lookup + SvelteKit's `error()` helper.

## The lookup

```ts
import httpErrors from '$lib/httpErrors';

// httpErrors[400] = 'Hmm… something seems off with your request 🤔'
// httpErrors[401] = 'You need to log in to see this page 🔒'
// httpErrors[403] = "Sorry, you don't have permission to view this 🚫"
// httpErrors[404] = "Oops! The page you're looking for wandered off 🕵️‍♂️"
// httpErrors[410] = 'This content has been deleted 😢'
// httpErrors[422] = "We couldn't process that – maybe check your input ✏️"
// httpErrors[429] = "Whoa! You're going too fast 🚀 Slow down a bit"
// httpErrors[500] = 'Oh no! Something went wrong on our side ⚡ Try refreshing the page.'
// httpErrors[503] = 'Our service is taking a nap 💤 Please try again later'
```

Covered: 400, 401, 403, 404, 410, 422, 429, 500, 503. Unknown codes return `undefined` — fall back to 500 explicitly.

---

## Pattern 1 — catching Butterfly `ApiError`

Every API call can throw `ApiError` with a `.status`:

```ts
import { ApiError } from '@enodo/butterfly-ts';
import { error } from '@sveltejs/kit';
import httpErrors from '$lib/httpErrors';

try {
  const post = await api.get({ fetch, endpoint: 'posts', id });
  // ...
} catch (err) {
  if (err instanceof ApiError) {
    error(err.status, httpErrors[err.status] ?? httpErrors[500]);
  }
  error(500, httpErrors[500]);
}
```

This is the canonical pattern in feeds (`src/routes/[format=feed]/index.xml/+server.ts`) and article routes.

---

## Pattern 2 — manual error for a business rule

```ts
if (!params.slug) {
  error(400, httpErrors[400]);
}

const post = await api.get({ fetch, endpoint: 'posts', id });
if (post.data.attributes.status === 'deleted') {
  error(410, httpErrors[410]);
}
```

`error(status, message)` throws and short-circuits the load.

---

## Pattern 3 — layout-level guard

`+layout.server.ts` currently guards the env:

```ts
if (!PUBLIC_LANGUAGE) {
  error(500, '`PUBLIC_LANGUAGE` environment variable is undefined');
}
```

Note the **string message**, not `httpErrors[500]` — this is a developer-facing message, not a user-facing one. That's acceptable for config errors; a real user in production shouldn't hit this (the env was misconfigured).

---

## `+error.svelte` — the fallback renderer

`src/routes/+error.svelte` renders the error message. It reads from `page.error` (set by the thrown `error()`). Keep it minimal and on-brand.

Update it if:

- The brand voice changes.
- You want different layouts per status class (404 vs 500 vs 410).
- You add a "go home" CTA, a search box, or a recently-read list.

Don't add logic that can itself fail — an error inside the error page is a bad time.

---

## Conventions

- **Always log first**: `console.error('[Home]', err)` (or `[Layout]`, `[Article]`, etc.) before calling `error()`. The prefix makes grep-ing logs tractable.
- **Never return `null` data** on failure — throw with `error()` so SvelteKit routes to `+error.svelte`.
- **Don't return 200 with an error body.** Always set the correct HTTP status via `error(status, ...)`.
- **Fallback to 500**: `httpErrors[err.status] ?? httpErrors[500]`.

---

## Feed/sitemap endpoints

`+server.ts` endpoints have the same pattern. Return 500 on catch-all failure, set the right `Content-Type` on success:

```ts
export const GET: RequestHandler = async ({ fetch }) => {
  try {
    const data = await api.get(...);
    return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
  } catch (err) {
    if (err instanceof ApiError) error(err.status, httpErrors[err.status]);
    error(500, httpErrors[500]);
  }
};
```

---

## Adding a new error code

1. Add the code + message to `src/lib/httpErrors.ts`.
2. Translate it when translating the app (see `translate` skill checklist).
3. If the message should render with formatting (bold, a link), extend `+error.svelte` — not `httpErrors.ts`. Strings stay plain.

---

## What NOT to do

- Don't `throw new Error(...)` in a load function — use SvelteKit's `error()`.
- Don't silently catch and continue. Route loads fail → pages must show errors.
- Don't leak `err.message` or stack traces to the user — use the friendly `httpErrors[code]` string.
- Don't localise `httpErrors.ts` by branching on language. Keep one file; translate via the `translate` skill.
