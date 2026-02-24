---
name: translate
description: Translate the Butterfly SvelteKit application to another language. Use when the user wants to change the app language (e.g. English to French, Spanish, German, Italian…). Covers env vars, HTML lang attribute, date/time formatting in formatRelativeDate.ts, and all hardcoded UI strings across routes and components.
---

# Translating the Butterfly app

The app targets a **single language at a time** — no i18n library. Translation means updating env vars + replacing hardcoded strings across the codebase.

Start by asking the user what target language/locale they want if not already specified.

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

### `src/routes/+layout.svelte`

```svelte
<a href="#page" class="skip-link" aria-label="Skip to main content"></a>
```

→ `aria-label="Aller au contenu principal"` (FR), `"Ir al contenido principal"` (ES), etc.

---

### `src/components/Layout/Header.svelte`

| Location                                                     | String                                            |
| ------------------------------------------------------------ | ------------------------------------------------- |
| `<nav aria-label="Home">`                                    | `"Accueil"` / `"Inicio"`                          |
| `aria-label={menu ? 'Close navigation' : 'Open navigation'}` | `'Fermer la navigation' : 'Ouvrir la navigation'` |
| `aria-label="Main navigation"`                               | `"Navigation principale"`                         |
| `<li ... aria-label="Search">`                               | `"Recherche"`                                     |
| `<span class="md:hidden">Search</span>`                      | `"Recherche"`                                     |

---

### `src/components/Layout/Footer.svelte`

Translate visible link texts and static phrases: "Articles", "Tags", "Authors", "Search", "About", "RSS Feeds", "Atom Feeds", "Powered by", "Copyright ©".

---

### `src/routes/search/+page.svelte`

```svelte
aria-label="Search news, topics and more" placeholder="Search news, topics and more" value="Search" <!-- submit button -->
"We couldn't find any results for your search. Try adjusting your keywords or explore other articles on
our website."
```

---

### `src/routes/search/+page.server.ts`

Dynamic strings for SEO titles and meta descriptions:

- `"Search results for ${query}"`
- `"Search"` (default page title)
- `"- Page ${page}"`
- The two meta description strings

---

### `src/components/Pagination.svelte`

```svelte
aria-label="Navigate the pages" aria-label="Go to previous page" aria-label="Go to next page"
aria-label="Go to page ${page}" label = 'Load more' <!-- default prop value -->
```

Also check call sites — e.g. `search/+page.svelte` passes `label="Load more articles"`.

---

### `src/components/Dialog.svelte`

```svelte
aria-label="Close modal"
```

---

### `src/components/Breadcrumb.svelte`

```svelte
aria-label="Breadcrumb"
```

---

### `src/lib/JsonLD/BreadcrumbList.ts`

Hardcoded breadcrumb segment names: `"Authors"`, `"Tags"`, `"Search"`, `"Page ${page}"`.

---

### `src/routes/+page.svelte` (home page)

CSS `content:` values with English text (e.g. `"See all articles"`, `"FEATURED"`). These are set via CSS — search for `content:` in the `<style>` block or as Tailwind `content-[...]` utilities.

---

## Checklist

- [ ] `.env`: `PUBLIC_LOCALE` and `PUBLIC_LANGUAGE` updated
- [ ] `formatRelativeDate.ts`: strings (Today/Yesterday/days ago) translated
- [ ] `formatRelativeDate.ts`: `hour12`, timezone, and AM/PM logic adjusted
- [ ] `+layout.svelte`: skip link aria-label
- [ ] `Header.svelte`: all aria-labels and "Search" visible text
- [ ] `Footer.svelte`: all link texts and static copy
- [ ] `search/+page.svelte`: form strings and no-results message
- [ ] `search/+page.server.ts`: SEO titles and meta descriptions
- [ ] `Pagination.svelte`: aria-labels and default label prop
- [ ] `Dialog.svelte`: close aria-label
- [ ] `Breadcrumb.svelte`: nav aria-label
- [ ] `BreadcrumbList.ts`: segment names
- [ ] `+page.svelte`: CSS content strings
