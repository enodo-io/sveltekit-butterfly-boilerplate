---
name: env-vars
description: Comprehensive guide to the `PUBLIC_*` environment variables consumed by the boilerplate. Use when adding a new env var, debugging missing values, explaining what each var controls, or updating the `.env.example` / setup wizard. Covers required vs optional, format constraints, and how each var flows through the code.
---

# Environment variables — the `PUBLIC_*` surface

Every env var this project uses starts with `PUBLIC_` so it's exposed to the client bundle via `$env/static/public`. There are no private server-only vars in the stock boilerplate (the Butterfly API key is intentionally public — scoped per-property at the CMS level).

## Required

| Var                 | Format                        | Used by                                            |
| ------------------- | ----------------------------- | -------------------------------------------------- |
| `PUBLIC_BASE_URL`   | `https://site.com` (no trailing slash) | `meta.url`, sitemaps, feeds, JSON-LD      |
| `PUBLIC_API_URL`    | `https://api.butterfly.enodo.app` | `src/lib/api.ts` client domain                |
| `PUBLIC_API_KEY`    | Butterfly property key        | `src/lib/api.ts` auth                              |
| `PUBLIC_MEDIA_URL`  | `https://media.butterfly.enodo.app` | `src/lib/getMediaUrl.ts`, service worker     |
| `PUBLIC_LOCALE`     | BCP 47: `fr_FR`, `en_US`, `es_ES`… | Open Graph `og:locale`, `Intl.DateTimeFormat` |
| `PUBLIC_LANGUAGE`   | ISO 639-1: `fr`, `en`, `es`   | `<html lang="">` via `app.html`, feed `language`   |

Missing any of these causes SSR errors (`+layout.server.ts` throws 500 when `PUBLIC_LANGUAGE` is absent; `api.get` fails if `PUBLIC_API_*` aren't set).

---

## Optional

| Var                   | Format                              | Effect                                                              |
| --------------------- | ----------------------------------- | ------------------------------------------------------------------- |
| `PUBLIC_STATIC_PAGES` | JSON: `{"about":1,"legal":2}`       | Maps slugs → Butterfly post ids for `/[slug=page].html` routes      |
| `PUBLIC_INDEXABLE`    | `true` \| `false` (default `true`)  | If `false`, layout emits `<meta name="robots" content="noindex,nofollow">` by default |
| `PUBLIC_GTM_ID`       | `GTM-XXXXXXX`                       | Enables `GTM.svelte` (auto-skipped if absent)                       |

---

## Where they flow

```
.env
 └──► Vite / SvelteKit loads
        ├──► $env/static/public  (bundled into client + SSR)
        │       └──► src/lib/api.ts, getMediaUrl.ts, routes, components
        └──► app.html via %sveltekit.env.PUBLIC_LANGUAGE%
                └──► <html lang="..."> (build-time substitution)
```

`$env/static/public` is **statically replaced at build time** — changes to `.env` require a dev-server restart to take effect.

---

## Reading an env var in the codebase

```ts
import { PUBLIC_BASE_URL, PUBLIC_API_URL } from '$env/static/public';
```

- **Static imports only.** Don't use `$env/dynamic/public` — dynamic env vars aren't statically replaced and add runtime overhead.
- **Named imports.** No wildcard or default imports from `$env/static/public`.
- **Always import from `$env/static/public`**, never `process.env` (that's Node, not SvelteKit — and wouldn't be bundled for client code).

---

## Format constraints

- **`PUBLIC_BASE_URL`**: must not end with a slash (concatenations in the code assume no trailing slash: `${PUBLIC_BASE_URL}/articles`).
- **`PUBLIC_API_URL`** and **`PUBLIC_MEDIA_URL`**: start with `https://`, no trailing slash.
- **`PUBLIC_LOCALE`**: BCP 47 (`xx_YY`) — not the web-style `xx-YY`. The setup wizard generates it correctly.
- **`PUBLIC_LANGUAGE`**: lowercase two-letter code. Often auto-derived from `PUBLIC_LOCALE` by the setup wizard.
- **`PUBLIC_STATIC_PAGES`**: valid JSON string. Malformed JSON silently degrades: `JSON.parse(... || '{}')` means a syntax error becomes `{}` and no static pages resolve. Validate via a parse round-trip.

---

## Adding a new env var

1. **Add it to `.env.example`** with a comment describing its purpose and format.
2. **Update `scripts/setup-env.js`** to prompt for it during `npm run setup` (or mark it optional with a sensible default).
3. **Document it** in the README's "Environment Variables" section (follow the table format).
4. **Import statically**: `import { PUBLIC_FOO } from '$env/static/public'`.
5. **Provide a fallback** in code if the var is optional, or throw clearly if required (see `+layout.server.ts` for the `PUBLIC_LANGUAGE` check pattern).
6. **Update deployment docs** — CI/CD, staging, and prod all need the new var.

---

## Debugging missing / wrong values

- Run the `/check-butterfly-env` slash command to validate everything at once.
- `console.log` inside `+layout.server.ts` to confirm what SSR sees.
- Restart the dev server after editing `.env` — static env vars are bundle-time.
- In production, check the deployment platform's env-var panel. A common mistake: setting vars on the build env but not the runtime env (or vice versa).

---

## What NOT to do

- Don't use `$env/dynamic/public` for something that could be `$env/static/public`. Dynamic env adds a runtime lookup cost on every request.
- Don't put private secrets in `PUBLIC_*`. They end up in the client bundle. (The Butterfly API key is public **by design** — don't extrapolate that to other keys.)
- Don't read env vars inside a matcher without importing from `$env/static/public` (`src/params/page.ts` does this correctly).
- Don't default to empty string silently (`PUBLIC_FOO || ''`) — that hides misconfigurations. Throw or warn.
- Don't branch logic on `process.env.NODE_ENV` — use `import.meta.env.DEV` / `import.meta.env.PROD` (Vite).
