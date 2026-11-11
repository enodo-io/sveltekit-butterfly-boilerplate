---
name: post-body
description: Customise article body rendering produced by `Post/Body.svelte`. Use when adjusting how paragraphs, headings, lists, quotes, embeds (YouTube, Twitter, Instagram…), galleries, or inline nodes look inside an article — including the per-property custom styles (`[data-customstyle="…"]`) and block templates (`[data-template="…"]`) defined in the Butterfly admin. Prefer global CSS via `.post--*` selectors over editing the per-element Svelte components.
---

# `Post/Body.svelte` — customisation strategy

`src/components/Post/Body.svelte` renders a Butterfly post body (an array of typed nodes: paragraphs, headings, lists, media, embeds, inline formatting). It delegates to two directories:

- `src/components/Post/Elements/` — block-level (Paragraph, List, Quote, Image, Video, Youtube, Table, Gallery, FAQ, Related, Pagebreak, Title, Code, Embed, Iframe, Facebook, Instagram, Tiktok, Vimeo, Dailymotion, X, Markdown, OEmbed, Audio, Media)
- `src/components/Post/InlineNodes/` — inline (Text, Emphasis, Strong, Code, Link, Underline, Strikethrough, Subscript, Superscript, Quote, Abbreviation, Break, CustomStyle)

Every element gets a `.post--{name}` class so CSS can style them globally.

---

## Decision rule — CSS first, component second

| Change                                             | Do                                    |
| -------------------------------------------------- | ------------------------------------- |
| Visual tweak (spacing, colour, typography, layout) | Edit `src/assets/styles/post.css`     |
| Structural change (add an element, alter HTML)     | Edit the component in `Post/Elements` |
| Adding a new Butterfly node type                   | Extend both `Body.svelte` + element   |

**Always start with CSS.** Editing components is appropriate only when CSS can't express the change.

---

## CSS — `src/assets/styles/post.css`

Each block type has a dedicated `.post--*` class. Examples:

```css
.post--paragraph { ... }
.post--list { ... }
.post--list.ordered { ... }
.post--quote { ... }
.post--youtube,
.post--vimeo,
.post--dailymotion { ... }
.post--table { ... }
.post--gallery { ... }
.post--image { ... }
.post--code { ... }
.post--faq details { ... }
.post--related { ... }
.post--pagebreak { ... }
```

Follow the design-system rules — spacing `p-4/7/9`, typography `fs-body-copy` for prose, `fs-long-primer` for captions, etc.

---

## Route-scoped overrides

Use `:global(.post--*)` in a page's `<style>` block to override body styles only on that route:

```svelte
<style>
  :global(.post--quote) {
    @apply border-l-4 pl-6 italic;
  }
</style>
```

Scope aggressively — don't widen a global rule for a one-off layout.

---

## Inline node customisation

Inline nodes (`InlineNodes/*.svelte`) are small, focused pieces. They're typically fine out of the box:

- `Emphasis` → `<em>`
- `Strong` → `<strong>`
- `Code` → `<code>`
- `Link` → `<a>` through `$lib/links`: `contentLink()` classifies by host (internal = same host as `PUBLIC_BASE_URL`, rendered as a path, same tab; external web = `target="_blank"`), `externalRel()` adds `noopener` + `sponsored` (CMS attribute, or any external link of a `sponso` post) / `ugc` / `nofollow` (CMS `rel`). An empty or `#` href renders the text without a link. See `seo-links`.
- `Quote` → `<q>` (inline quote), `cite` only when the source is a URL, the source in `title`
- `Underline`, `Strikethrough`, `Subscript`, `Superscript`, `Abbreviation`, `Break`
- `CustomStyle` → `<span data-customstyle="<key>">` — see the dedicated section below

If you need, e.g., external-link icons: edit `InlineNodes/Link.svelte`. Keep changes minimal — inline nodes render hundreds of times per article.

---

## Per-property customisation — custom styles & block templates

Butterfly editors can define **custom styles** (inline marks) and **block templates** (block-level variants) under *Customization* in the admin. The boilerplate already wires the rendering plumbing — you only need to write CSS.

### Custom styles → `[data-customstyle="<key>"]`

Custom styles are inline marks (think bold / italic) applied to a substring of a paragraph, list item, quote, FAQ answer or table cell. The editor wraps the selection with `<span data-customstyle="<key>">…</span>`. Each `<key>` is a slug shown in the Butterfly admin (e.g. `highlight`, `term-of-art`).

To style every occurrence, add a rule in `src/assets/styles/post.css`:

```css
[data-customstyle='highlight'] {
  color: var(--color-brand-700);
  font-weight: 600;
}
[data-customstyle='term-of-art'] {
  font-style: italic;
  border-bottom: 1px dotted var(--color-light-300);
}
```

That's it — no component edit, no schema work. Unknown keys render as a plain `<span>` (the slug is left in DOM as a hint), which is the correct fallback when a customstyle is deleted in the admin and existing posts still reference it.

### Block templates → `[data-template="<key>"]`

Block templates are block-level variants — e.g. a `callout` paragraph, a `numbered-bullets` list, a `compact` quote. The editor stamps the chosen slug on `block.template` and `Post/Body.svelte` automatically wraps the block in `<div data-template="<key>">…</div>` only when the slug is set (no wrapper otherwise — DOM identical to today for normal blocks).

Style the variant via the wrapper:

```css
/* Whole block layout */
[data-template='callout'] {
  background: var(--color-light-025);
  border-left: 4px solid var(--color-brand-500);
  padding: var(--space-4);
}
/* Tweak the inner block when nested in a template */
[data-template='callout'] .post--paragraph {
  margin: 0;
  font-weight: 500;
}
[data-template='compact'] .post--quote {
  font-size: var(--fs-pica);
}
```

Same fallback policy: an unknown `<key>` renders the block normally, the wrapper just sits there inert.

### Where do the keys come from?

The slugs live in the Butterfly admin (`/customization` on the editor side). Coordinate with whoever maintains the editor — there's no API call this site makes for the catalog. **Both endpoints are admin-only** (`/v1/customstyles`, `/v1/blocktemplates` require the Private Key), and a public-key site has no business pulling them — only the slugs that already travel inline inside `post.body` matter.

### Where do the components live?

- Inline mark: `src/components/Post/InlineNodes/CustomStyle.svelte` (registered in `InlineNodes.svelte`)
- Block-level wrapping: handled centrally in `src/components/Post/Body.svelte` — a single `{#if element.template}` branch wraps the chosen Element component. No per-element edit required.

---

## Adding a new element type

If Butterfly introduces a new block type (e.g. `callout`):

1. **Create** `src/components/Post/Elements/Callout.svelte` — accept the node as props, render the HTML.
2. **Register** the mapping inside `Post/Body.svelte` (type-name → component).
3. **Add** `.post--callout` styles in `src/assets/styles/post.css`.
4. **Unknown types**: `Body.svelte` renders nothing for a type missing from its `registry` in production, and a `[type]` placeholder in dev only. Keep it that way — never crash, never ship a placeholder.

---

## Heading outline — `$lib/postOutline`

`Body.svelte` computes `postOutline(body)` and passes `level` and `id` to `Title` (and the FAQ questions):

- **No level skip**: the page title is the `h1`; a CMS `title4` right after a `title2` renders as `h3` (at most one level below the previous heading, `h2` at least).
- **FAQ questions are `h2`**.
- **Anchors are unique and never empty** (slugified text, `intro`, `intro-2`…).

Don't render a heading level straight from the CMS type in a new element: take `level` from the outline.

---

## Markdown — rendered on the server

The post and static page loads call `withRenderedMarkdown(body)` (`$lib/server/markdown`, `marked` with GFM): every `markdown` block gets an `html` field, headings shifted one level down when the Markdown uses `#` (the page title stays the only `h1`), scripts stripped. `Markdown.svelte` renders `element.html` (`{@html}`) and only falls back to the source in a `<pre>` when there is no `html`. Crawlers get real HTML; the client ships no Markdown parser. A new route rendering a post body must call `withRenderedMarkdown` in its load too.

---

## Embeds

- **YouTube, Vimeo, Dailymotion, raw `embed`**: the oEmbed / embed HTML goes through `stripScripts` then `embedHtml(html, title)` (`$lib/embedHtml`): every `<iframe>` gets `loading="lazy"`, a `title` (the oEmbed title, else « Embedded content »), no `frameborder`. **No click-to-load facade on purpose**: the iframe stays in the HTML so the video is indexed (and `VideoObject` describes it).
- **`iframe` block**: `title` from the CMS, else « Embedded content from {host} », `loading="lazy"`.
- **X, Facebook, Instagram, TikTok** (`OEmbed.svelte`): the oEmbed HTML (through `stripScripts`) is in the page; the network SDK is loaded once per page when the embed comes within 600px of the viewport (`IntersectionObserver`), not at hydration.
- Never `{@html}` oEmbed or CMS HTML without `stripScripts`.

---

## Tables

`Table.svelte`: `<figure>` → a scroll region `<section tabindex="0" aria-label={caption || 'Table'}>` (wide tables scroll inside the column, keyboard reachable and named) → `<table>`. Header cells are `<th scope="col">`; an **empty** header cell (a corner) is a `<td>` (a `th` must name its column). The caption is the `<figcaption>`.

---

## Quotes

- Block `quote`: `<figure>` → `<blockquote cite={source.url}>` → `<figcaption>` « — author, `<cite>`title`</cite>` », the title linked through `contentLink`/`externalRel` when the source has a URL. A quote without a source renders without credits.
- Inline: `<q>` (see inline nodes).

---

## Related posts

`Post/Elements/Related.svelte` (a `related` block of the body): a named `<aside aria-label={title || 'Related articles'}>` with a list of links to the posts (24px targets). Customise via `.post--related`. The « Related articles » column of the article page is something else: `feeds.related` of the post load (same tags, else same category, pages excluded).

---

## Gallery

`Post/Elements/Gallery.svelte`: a `<ul>` of `<li><figure>`; each thumbnail is a `<button type="button">` (visually hidden text « Enlarge ») that opens the media in `Dialog.svelte` (`<dialog closedby="any">`, named « Media viewer »). Thumbnails use `<Image>` (`image-picture` skill).

---

## Raw HTML

HTML blocks use `{@html …}` with scripts stripped by `$lib/stripScripts`. **Never** `{@html}` user-authored content without it — XSS risk.

---

## Checklist

- [ ] Is this a visual change? → edit `post.css`, not the component
- [ ] Is the rule route-specific? → use `:global(.post--*)` inside the route's `<style>`
- [ ] Following spacing/typography/z-index skills?
- [ ] Editing a component? — keep it minimal; consider if CSS is enough
- [ ] Adding a new block type? — component + register in `Body.svelte` + `.post--{type}` CSS
- [ ] Styling a per-property custom style? → add `[data-customstyle="<key>"] { … }` in `post.css`
- [ ] Styling a per-property block template? → add `[data-template="<key>"] { … }` in `post.css`
- [ ] Handling raw HTML? — `stripScripts` first, always
- [ ] A heading? — `level`/`id` from `postOutline`, never the raw CMS level
- [ ] An iframe? — `title` + `loading="lazy"` (`embedHtml`)
- [ ] A link? — `contentLink` / `externalRel`, never a raw `href` from the CMS

---

## Sponsored posts

A post flagged `sponso` in Butterfly is partner content. The article page shows one line above the title (« Sponsored by {sponsor} », from the `sponsor` custom field, or « Partner content »), cards show the « Partner content » label, `<Body sponsored>` makes every external link of the body `rel="sponsored"`, the Google News sitemap leaves the post out, and the JSON-LD types it `AdvertiserContentArticle` with its sponsor. Nothing to do per post beyond the flag and the custom field.

