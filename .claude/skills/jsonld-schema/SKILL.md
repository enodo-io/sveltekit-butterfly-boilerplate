---
name: jsonld-schema
description: Add or edit typed JSON-LD schemas using `schema-dts`. Use when creating a new Schema.org generator, combining schemas with `generateJsonLd`, or choosing which schema types apply to a route. Covers the `src/lib/JsonLD/` structure, registering a new generator, and the Graph vs WithContext output logic.
---

# JSON-LD — `src/lib/JsonLD/`

The boilerplate ships typed Schema.org generators using `schema-dts`. Every route can emit structured data by calling `generateJsonLd(pageData, [types])`.

## Existing generators

| File                | Schema types            | Where to use                                      |
| ------------------- | ----------------------- | ------------------------------------------------- |
| `WebSite.ts`        | `WebSite`               | Always on root (layout) — includes `SearchAction` |
| `WebPage.ts`        | `WebPage`               | Every page that isn't a more specific type        |
| `Article.ts`        | `Article`/`NewsArticle` | Single article pages (`[slug=post]`)              |
| `BreadcrumbList.ts` | `BreadcrumbList`        | Any deep page with a breadcrumb trail             |
| `Organization.ts`   | `Organization`          | Publisher — referenced by Article, WebSite        |
| `ProfilePage.ts`    | `ProfilePage`           | Author pages                                      |
| `FAQPage.ts`        | `FAQPage`               | Pages with FAQ structured content                 |

All are registered in `src/lib/JsonLD/index.ts` in the `handlers` map.

---

## How `generateJsonLd` works

```ts
import { generateJsonLd } from '$lib/JsonLD';

// Single schema → WithContext<Thing>
const ld = generateJsonLd(pageData, ['WebPage']);
// → { '@context': 'https://schema.org', '@type': 'WebPage', ... }

// Multiple schemas → @graph
const ld = generateJsonLd(pageData, ['WebPage', 'Article', 'BreadcrumbList']);
// → { '@context': 'https://schema.org', '@graph': [...] }
```

The function reads `pageData` (the route's `App.PageData`) and dispatches to handlers registered in `index.ts`. Each handler receives the full `pageData` and returns a single schema-typed object.

---

## Which types per route — reference

| Route                            | Schemas                                     |
| -------------------------------- | ------------------------------------------- |
| Home `/`                         | `WebSite`, `Organization`                   |
| Category `/[...path]`            | `WebPage`, `BreadcrumbList`                 |
| Article `/[slug=post].html`      | `Article`, `BreadcrumbList`, `Organization` |
| Static page `/[slug=page].html`  | `WebPage`, `BreadcrumbList`                 |
| Author listing `/authors`        | `WebPage`, `BreadcrumbList`                 |
| Author profile `/authors/[slug]` | `ProfilePage`, `BreadcrumbList`             |
| Tag listing `/tags`              | `WebPage`, `BreadcrumbList`                 |
| Tag detail `/tags/[slug]`        | `WebPage`, `BreadcrumbList`                 |
| Search `/search`                 | `WebPage`                                   |
| FAQ-style page                   | `WebPage`, `FAQPage`, `BreadcrumbList`      |

Rendering happens in the layout or page (usually by injecting a `<script type="application/ld+json">` in `<svelte:head>`).

---

## Adding a new schema generator

1. **Create the file** in `src/lib/JsonLD/<Type>.ts`. Export a default function that takes `App.PageData` and returns a `schema-dts` typed object.

```ts
// src/lib/JsonLD/Recipe.ts
import type { Recipe as RecipeSchema, Thing } from 'schema-dts';
import { PUBLIC_BASE_URL } from '$env/static/public';

export default function Recipe(data: App.PageData): Thing {
  const recipe = data.scope?.data as unknown as { attributes: { ... } };

  return {
    '@type': 'Recipe',
    '@id': `${data.meta.url}#recipe`,
    name: recipe.attributes.title,
    description: data.meta.description,
    // …all Schema.org Recipe fields
  } as RecipeSchema;
}
```

2. **Register it** in `src/lib/JsonLD/index.ts`:

```ts
import Recipe from './Recipe';

const handlers = {
  WebSite,
  WebPage,
  ProfilePage,
  Organization,
  Article,
  FAQPage,
  BreadcrumbList,
  Recipe, // ← add here
};
```

3. **Use it** from the route where it applies:

```ts
const ld = generateJsonLd(data, ['Recipe', 'WebPage', 'BreadcrumbList']);
```

---

## Conventions

- **Always type the return with `schema-dts`.** Cast only at the boundary if `schema-dts` is stricter than the data shape — comment why.
- **Use `@id` for cross-references.** Organization is referenced by Article (publisher) and WebSite — identify them with stable `@id` URLs like `${PUBLIC_BASE_URL}#organization`.
- **URLs are absolute.** Google validates the shape — relative URLs silently break schemas.
- **No `null`/`undefined` in output.** Strip optional fields that don't have data; don't emit them as `undefined`.
- **Dates are ISO 8601 strings** (`new Date(...).toISOString()`), not `Date` objects.

---

## Testing

Two specs exist already:

- `src/lib/JsonLD/Organization.spec.ts`
- `src/lib/JsonLD/generateJsonLd.spec.ts`

Mirror their pattern when adding a new schema: assert the shape, the `@type`, and required fields for the type you're emitting.

---

## What NOT to do

- Don't write raw `JSON.stringify({ '@type': 'Article', ... })` inline in a `+page.svelte`. Always go through a generator in `src/lib/JsonLD/`.
- Don't mix multiple types in a single handler — one file, one `@type`. Composition happens in `generateJsonLd` via the `@graph` output.
- Don't omit `BreadcrumbList` on deep routes — it's a cheap SEO win and Google expects it on anything below the homepage.
