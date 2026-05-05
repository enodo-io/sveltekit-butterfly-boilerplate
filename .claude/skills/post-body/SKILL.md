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
- `Link` → `<a>` — follows `seo-links` rules (but also **opens CMS-external links** in a new tab; read the component before editing)
- `Underline`, `Strikethrough`, `Subscript`, `Superscript`, `Abbreviation`, `Quote`, `Break`
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
4. **Keep a fallback** — unknown types should render nothing silently, not crash.

---

## Embeds — sandboxing caveats

Social embeds (YouTube, Instagram, TikTok, Twitter/X, Facebook, Vimeo, Dailymotion) use their native embed scripts or iframes. Don't lazy-load them via IntersectionObserver unless the platform supports it natively — some iframes break when hidden at mount.

For YouTube/Vimeo specifically: use the `lite-youtube` / `lite-vimeo` pattern if performance is critical. The current boilerplate uses standard `<iframe>` with `loading="lazy"` where safe.

---

## Related posts

`Post/Elements/Related.svelte` renders the internal link mesh (same-tag articles). Customise via the `.post--related` class. Don't change the underlying link-selection logic here — it lives in the article page's server load.

---

## Gallery

`Post/Elements/Gallery.svelte` shows multiple images as a carousel/grid. Uses `<Image>` from `$components` — the `image-picture` skill applies (widths, sizes, lazyload).

---

## Markdown / raw HTML

Posts may embed raw markdown or HTML blocks. `Post/Elements/Markdown.svelte` handles the former; HTML blocks use `{@html …}` with scripts stripped by `$lib/stripScripts`. **Never** `{@html}` user-authored content without going through `stripScripts` — XSS risk.

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
