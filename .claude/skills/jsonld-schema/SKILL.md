---
name: jsonld-schema
description: Add or edit typed JSON-LD schemas using `schema-dts`. Use when creating a new Schema.org generator, combining schemas with `generateJsonLd`, or choosing which schema types apply to a route. Covers the `src/lib/JsonLD/` structure, the shared `@id`s, registering a new generator, and the Graph vs WithContext output logic.
---

# JSON-LD — `src/lib/JsonLD/`

The boilerplate ships typed Schema.org generators using `schema-dts`. A route emits its structured data by calling `generateJsonLd(pageData, [types])` in its `+page.svelte`.

## Existing generators

| File / handler                      | Output                                                       | Notes                                                                                                                                                                                                                                                                               |
| ----------------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `WebSite.ts`                        | `WebSite`                                                    | `@id` `#website`, `inLanguage`, `publisher` → `#organization`. `SearchAction` (`/search?query=`): Google retired the sitelinks search box (Nov. 2024), kept on purpose for the other engines                                                                                                                                         |
| `Organization.ts`                   | `Organization`                                               | `@id` `#organization`, `url`, square logo `/favicon-512.png` (512×512, replace the file with the site's square logo), `sameAs` from the property custom field `sameAs` (list or comma-separated string, http(s) URLs only)                                                    |
| `Person.ts` (helper, not a handler) | `Person` / `Organization`                                    | One author node shared by the article `author` and the profile `mainEntity`: `@id` `/authors/{id}#author`, profile page as `url`, the author's own site as `sameAs`, `jobTitle`; `{ full: true }` adds `description` and `image`. **Never email or telephone** (personal data) |
| `Article.ts`                        | `Article` / `NewsArticle` (flag `news`) / `AdvertiserContentArticle` (flag `sponso`) | `image`: the thumbnail in 1:1 and 16:9 at 1200px (capped to the source width), the default image (`thumb.jpg`, absolute) without a thumbnail; `datePublished`, `dateModified` (= `updatedAt` when later, else `publishedAt`), `articleSection` (category), `keywords` (tag names), `publisher` = the Organization, `author` = Person nodes, `mainEntityOfPage` = the WebPage, `sponsor` |
| `WebPage.ts`                        | `WebPage`                                                    | `@id` `{url}#page`, `isPartOf` → `#website`, `breadcrumb` when more than one item                                                                                                                                                                                                   |
| `WebPage.ts` → `CollectionPage`     | `CollectionPage`                                             | The WebPage plus `mainEntity`: an `ItemList` of the post URLs when the feed is resolved (SSR only, a promise on client navigations is skipped)                                                                                                                                     |
| `ProfilePage.ts`                    | `ProfilePage`                                                | `mainEntity` = the full author node (same `@id` as the article authors)                                                                                                                                                                                                             |
| `FAQPage.ts`                        | `FAQPage`                                                    | The `faq` blocks of a post, `@id` `{url}#faq`. Emitted **with** the Article: FAQ rich results are restricted to government and health sites since 2023, the Article carries the post                                                                                               |
| `VideoObject.ts`                    | `VideoObject[]` (one per video)                              | Native Butterfly videos (`contentUrl`, `duration`, size) and YouTube / Vimeo / Dailymotion embeds (`embedUrl` from the oEmbed iframe). A video without a thumbnail is skipped (`name`, `thumbnailUrl`, `uploadDate` are required)                                                |
| `BreadcrumbList.ts`                 | `BreadcrumbList`                                             | Home → category path (a post: its category path only, never a tag) → Authors/Tags/Search → page N. Also rendered by `Breadcrumb.svelte`                                                                                                                                            |

All handlers are registered in `src/lib/JsonLD/index.ts`.

### Shared `@id`s — `src/lib/JsonLD/ids.ts`

```ts
ORGANIZATION_ID = `${PUBLIC_BASE_URL}/#organization`;
WEBSITE_ID = `${PUBLIC_BASE_URL}/#website`;
authorUrl(id) = `${PUBLIC_BASE_URL}/authors/${id}`;
authorId(id) = `${authorUrl(id)}#author`;
```

Google merges the nodes with the same `@id` across pages: reference them (`{ '@id': WEBSITE_ID }`), don't redefine them. A new author-like node goes through `Person.ts`, never a second shape.

---

## How `generateJsonLd` works

```ts
import { generateJsonLd } from '$lib/JsonLD';

// One node → WithContext<Thing>
generateJsonLd(data, ['WebPage']);
// → { '@context': 'https://schema.org', '@type': 'WebPage', ... }

// Several nodes → @graph
generateJsonLd(data, ['Article', 'VideoObject']);
// → { '@context': 'https://schema.org', '@graph': [Article, VideoObject, VideoObject] }
```

A handler returns one node, an array of nodes, or an empty array (`types.flatMap(...)`): `VideoObject` returns one node per video, none when the post has no video. No node at all → `null` (nothing rendered).

---

## Which types per route (as wired today)

| Route                               | Types passed to `generateJsonLd`                               |
| ----------------------------------- | -------------------------------------------------------------- |
| Home `/`                            | `WebSite`, `Organization`                                      |
| Category `/[...path]`               | `CollectionPage`                                               |
| Articles `/articles`                | `CollectionPage`                                               |
| Tags `/tags`, tag `/tags/[id]`      | `CollectionPage`                                               |
| Authors `/authors`                  | `CollectionPage`                                               |
| Author `/authors/[id]`              | `ProfilePage`                                                  |
| Article `/[slug=post].html`         | `Article`, `VideoObject`, + `FAQPage` when the body has a FAQ  |
| Static page `/[slug=page].html`     | `WebPage`                                                      |
| Search `/search`, `/rss.html`…      | `WebPage`                                                      |

The breadcrumb travels inside the page node (`WebPage.breadcrumb`, `ProfilePage.breadcrumb`, `Article.mainEntityOfPage.breadcrumb`): don't add `BreadcrumbList` as a separate type on these routes.

### Rendering (unchanged pattern)

```svelte
<script lang="ts">
  let jsonLd = $derived(generateJsonLd(data, ['CollectionPage']));
</script>

<svelte:head>
  {#if jsonLd}
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html '<scr' + 'ipt type="application/ld+json">' + JSON.stringify(jsonLd) + '</scr' + 'ipt>'}
  {/if}
</svelte:head>
```

The split `<scr' + 'ipt>` keeps Svelte from parsing it as a component script. `<` is not escaped in the JSON: accepted by the owner (CMS content only).

---

## Adding a new schema generator

1. **Create** `src/lib/JsonLD/<Type>.ts`, default export `(data: App.PageData) => Thing | Thing[]`, typed with `schema-dts`:

```ts
// src/lib/JsonLD/Recipe.ts
import type { Recipe } from 'schema-dts';
import type * as Butterfly from '@enodo/butterfly-ts';
import { WEBSITE_ID } from './ids';

export default function getRecipe(data: App.PageData): Recipe {
  const post = data.scope?.data as Butterfly.Post;
  return {
    '@type': 'Recipe',
    '@id': `${data.meta.url}#recipe`,
    url: data.meta.url,
    name: post.attributes.title,
    description: data.meta.description || undefined,
    isPartOf: { '@id': WEBSITE_ID },
  };
}
```

2. **Register** it in the `handlers` map of `src/lib/JsonLD/index.ts`.
3. **Use** it from the route's `+page.svelte`: `generateJsonLd(data, ['Article', 'Recipe'])`.
4. **Spec** next to it (`Recipe.spec.ts`), see `Organization.spec.ts` / `VideoObject.spec.ts`.

---

## Conventions

- **Type the return with `schema-dts`.** Cast only at the boundary, with a comment.
- **`@id` for shared nodes** (`ids.ts`); `{url}#something` for the nodes of one page.
- **`url` = `data.meta.url`**: the canonical, so canonical, `og:url` and the JSON-LD `url` always agree.
- **URLs are absolute**: `PUBLIC_BASE_URL` / `absoluteUrl()` (`$lib/seo`), never `url.origin` (internal behind the proxy). Build assets (`thumb.jpg`) through `absoluteUrl()`.
- **Absent values are `undefined`** (`JSON.stringify` drops them), never `null` or `''`.
- **Dates are ISO 8601 strings** (the API's `publishedAt` / `updatedAt` already are).
- **Images for articles**: several ratios, at least 1200px wide (Discover / Top Stories).
- **No personal data**: no email, telephone or address of an author.

---

## What NOT to do

- Don't write raw `JSON.stringify({ '@type': 'Article', ... })` in a `+page.svelte`: always a generator.
- Keep the WebSite `SearchAction` (other engines); don't add `HowTo` or other retired rich results.
- Don't emit an `FAQPage` alone for a post: it goes with the Article.
- Don't describe content that is not on the page (a video not in the body, a rating nobody gave).
