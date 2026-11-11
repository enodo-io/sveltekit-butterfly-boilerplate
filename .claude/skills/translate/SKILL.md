---
name: translate
description: Translate the Butterfly SvelteKit application to another language. Use when the user wants to change the app language (e.g. English to French, Spanish, German, Italian…). Covers env vars, HTML lang attribute, date/time formatting in formatRelativeDate.ts, and all hardcoded UI strings across routes and components.
---

# Translating the Butterfly app

The boilerplate ships in **English** and the consuming site serves **one language at a time** — no i18n library. Translation here means updating env vars + replacing hardcoded strings across the codebase.

Start by asking the user what target language/locale they want if not already specified.

> **When to push back.** If the user actually wants **multi-language support** (multiple locales live in the same deployment), this skill is the wrong tool. That's a scoped boilerplate evolution — Paraglide is the recommended fit with SvelteKit. See the "One language at a time" section in the root `CLAUDE.md` and flag it explicitly rather than silently bolting i18n on.

---

## Step 1 — `.env`

```ini
PUBLIC_LOCALE=fr_FR   # BCP 47 locale for Open Graph, Intl APIs
PUBLIC_LANGUAGE=fr    # ISO 639-1 code → injected into <html lang="">
```

`src/app.html` uses `%sveltekit.env.PUBLIC_LANGUAGE%` — the `lang` attribute updates automatically. No manual edit needed there.

---

## Step 2 — `src/lib/formatRelativeDate.ts`

This file has both hardcoded English strings and locale-specific formatting assumptions. Update all of it.

### Strings to translate

| Current (EN)              | Example FR                    | Example ES                 |
| ------------------------- | ----------------------------- | -------------------------- |
| `'Today'`                 | `'Aujourd\'hui'`              | `'Hoy'`                    |
| `'Yesterday'`             | `'Hier'`                      | `'Ayer'`                   |
| `` `${diffD} days ago` `` | `` `Il y a ${diffD} jours` `` | `` `Hace ${diffD} días` `` |

### Time format adjustments

**English (US)** — 12h clock, EST timezone, AM/PM cleanup:

```ts
const time = new Intl.DateTimeFormat(PUBLIC_LANGUAGE, {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
  timeZoneName: 'short',
  timeZone: 'America/New_York',
})
  .format(date)
  .replace(/\bAM\b/, 'a.m.')
  .replace(/\bPM\b/, 'p.m.');
```

**French / European locales** — 24h clock, remove AM/PM replacement, update timezone:

```ts
const time = new Intl.DateTimeFormat(PUBLIC_LANGUAGE, {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: 'Europe/Paris', // adapt to target country
}).format(date);
// No .replace() needed
```

Timezones by region: `Europe/Paris`, `Europe/Madrid`, `Europe/Berlin`, `Europe/Rome`, `America/Sao_Paulo`, `Asia/Tokyo`, etc.

---

## Step 3 — Hardcoded strings per file

Visible text, visually hidden text (`sr-only`) and `aria-label`s alike: a screen reader user hears them. Keep a visible label and its accessible name identical (the burger button is named « Menu »: translate both together).

| File                                              | Strings                                                                                                                                                                                                 |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/routes/+layout.svelte`                       | skip link text « Skip to main content » (real text, not an `aria-label`)                                                                                                                                 |
| `src/components/Layout/Header.svelte`             | `aria-label="Menu"` (burger), `<nav aria-label="Main menu">`, « Search » (menu link)                                                                                                                     |
| `src/components/Layout/Footer.svelte`             | « Powered by », « Copyright © », `<nav aria-label="Footer">`, « Articles », « Tags », « Authors », « Search », « RSS Feeds », « Atom Feeds »; static page labels are derived from the `PUBLIC_STATIC_PAGES` slugs |
| `src/components/Breadcrumb.svelte`                | `aria-label="Breadcrumb"`                                                                                                                                                                               |
| `src/lib/JsonLD/BreadcrumbList.ts`                | « Authors », « Tags », « Search », « Page N » (also the visible breadcrumb)                                                                                                                              |
| `src/components/Pagination.svelte`                | `aria-label="Navigate the pages"`, « Previous page », « Next page », `Go to page ${page}`, default `label = 'Load more'`, status `${n} more items loaded`                                                 |
| Listing pages (`articles`, `[...path]`, `tags/[id]`, `authors/[id]`, `search`) | `label="Load more articles"`, « Page N »                                                                                                                                       |
| `src/components/Dialog.svelte`                    | default `label = 'Media viewer'`, `aria-label="Close modal"`                                                                                                                                            |
| `src/components/Card.svelte`                      | « Partner content »                                                                                                                                                                                     |
| `src/components/Feed.svelte`                      | the two error messages (« Check your network connection and try again. », « An error has occurred while loading data, please try again later. »)                                                         |
| `src/routes/+page.svelte` (home)                  | « All {name} articles » (real link text), CSS `content: 'FEATURED'` (a badge, not link text)                                                                                                             |
| `src/routes/[slug=post].html/+page.svelte`        | « Related articles », « Share », « Link copied », « Published », « Updated », « Sponsored by {sponsor} », « Partner content »                                                                             |
| `src/components/Post/Authorship.svelte`           | « By », « and »                                                                                                                                                                                         |
| `src/components/Post/Elements/Gallery.svelte`     | « Enlarge » (hidden button text), « Media not available »                                                                                                                                               |
| `src/components/Post/Elements/Related.svelte`     | fallback `aria-label` « Related articles »                                                                                                                                                              |
| `src/components/Post/Elements/Table.svelte`       | fallback `aria-label` « Table »                                                                                                                                                                         |
| `src/components/Post/Elements/Iframe.svelte`, `src/lib/embedHtml.ts` | « Embedded content from {host} », « Embedded content » (iframe titles)                                                                                                               |
| `Video.svelte`, `Post/Elements/Video.svelte`      | « Video not available »                                                                                                                                                                                 |
| `src/routes/search/+page.svelte`                  | `<label>` and `placeholder` « Search news, topics and more », submit button « Search », the no-results paragraph                                                                                         |
| `src/routes/+error.svelte`                        | the 404 / 410 / 500 titles and texts, « Error {status} », « Back to the home page »                                                                                                                      |
| `src/routes/[format=feed].html/+page.svelte`      | « Sections », « Authors », « Tags »                                                                                                                                                                     |
| `+page.server.ts` files                           | titles (« All articles », « All authors », « All tags », « RSS Feeds » / « Atom Feeds », `Search results for ${query}`, « Search », ` - Page ${page}`) and every description, fallbacks included (`All the articles about ${name}.`, `Browse all articles about/by ${name}.`…) |
| `src/routes/[format=feed]/*`                      | feed description fallbacks (`All news about "${name}" on ${site}`, `All articles about…`); `copyright` « All rights reserved » in `src/lib/server/feed.ts`                                                |
| `src/lib/httpErrors.ts`                           | every message                                                                                                                                                                                           |

` - Page ${page}` is also stripped by a regex in `BreadcrumbList.ts` (`/ - Page (\d+)/`): change both together.

Then grep for leftovers: `grep -rnE "aria-label=\"[A-Z]|>[A-Z][a-z]+ [a-z]+" src/components src/routes`.

---

## Checklist

- [ ] `.env`: `PUBLIC_LOCALE` and `PUBLIC_LANGUAGE` updated
- [ ] `formatRelativeDate.ts`: strings (Today/Yesterday/days ago) translated
- [ ] `formatRelativeDate.ts`: `hour12`, timezone, and AM/PM logic adjusted
- [ ] Every file of the Step 3 table, visible and hidden text alike
- [ ] Visible labels and their accessible names still match (burger « Menu », search label)
- [ ] `BreadcrumbList.ts` segment names + the ` - Page N` regex
- [ ] Route titles/descriptions and their fallbacks, feed descriptions
- [ ] `httpErrors.ts` and `+error.svelte`
- [ ] `npm run test:quality` still passes (it clicks the button named « Menu »: update the test with the new name)
