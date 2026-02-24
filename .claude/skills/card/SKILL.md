---
name: card
description: Create a semantic, accessible, SEO-friendly card component. Use when asked to build a card, article preview, product tile, blog post card, or any clickable content block. Produces valid HTML with proper link structure, CSS ::after click-zone trick, and flexbox order for visual reordering without touching DOM order.
---

# Creating a clean, semantic card component

## Principles

1. **DOM order follows semantic/accessibility logic**, not visual logic.
   The title (`h2`/`h3`) comes first in the DOM for screen readers and crawlers, even if it should visually appear below the image.

2. **The link lives only on the title.** Never wrap the entire card in `<a>`. See the `seo-links` skill.

3. **The entire card stays clickable** thanks to the `::after` pseudo-element on the title link.

4. **Flexbox + `order`** change the visual position of elements without modifying the DOM.

---

## Images: two cases

### Case 1 — Image from the Butterfly CMS API → use `<Image>` component

The Butterfly media API automatically serves the right format (WebP, AVIF, JPEG…) based on the browser's `Accept` header. No `<picture>` / `<source>` needed. Use the `<Image>` Svelte component which handles `srcset`, `sizes`, lazy loading, preload link, and the fade-in animation automatically.

```svelte
<script>
  import Image from '$components/Image.svelte';
  // `post.attributes.image` is a Butterfly.Media object
</script>

<!-- Lazy (default): adds loading="lazy" -->
<Image
  class="card__image"
  media={post.attributes.image}
  format="thumb"
  widths={[320, 480, 768]}
  sizes="(min-width: 768px) 33vw, 100vw"
  alt="Dark chocolate squares on a wooden board"
/>

<!-- Above the fold (hero card): disables lazy, adds fetchpriority="high" + <link rel="preload"> -->
<Image
  class="card__image"
  media={post.attributes.image}
  format="thumb"
  widths={[320, 480, 768]}
  sizes="(min-width: 768px) 33vw, 100vw"
  alt="Dark chocolate squares on a wooden board"
  lazyload={false}
/>
```

Available `format` values: `'default'` | `'source'` | `'thumb'` (16/9) | `'square'` | `'cover'` (850/315) | `'stories'` (portrait)

### Case 2 — External or static image → plain `<img>` with `srcset`

No `<picture>` with `<source>` elements. The format negotiation happens at the HTTP level. Use `srcset` + `sizes` on `<img>` directly to let the browser pick the right size.

```html
<img
  class="card__image"
  src="/images/chocolate-400.jpg"
  srcset="
    /images/chocolate-320.jpg 320w,
    /images/chocolate-480.jpg 480w,
    /images/chocolate-768.jpg 768w
  "
  sizes="(min-width: 768px) 33vw, 100vw"
  alt="Dark chocolate squares on a wooden board"
  width="400"
  height="225"
  loading="lazy"
/>
```

---

## Reference HTML structure

```html
<article class="card">
  <!--
    Title is FIRST in the DOM: semantic priority.
    The link lives here, and only here.
    Its ::after will cover the entire card to make it clickable.
  -->
  <h3 class="card__title">
    <a href="/article/why-chocolate-is-so-good"> Why is chocolate so good? </a>
  </h3>

  <!--
    Image is second in the DOM.
    It appears first visually via `order: -1` in CSS.
    For Butterfly CMS images: replace with <Image> component.
  -->
  <img
    class="card__image"
    src="/images/chocolate-400.jpg"
    srcset="
      /images/chocolate-320.jpg 320w,
      /images/chocolate-480.jpg 480w,
      /images/chocolate-768.jpg 768w
    "
    sizes="(min-width: 768px) 33vw, 100vw"
    alt="Dark chocolate squares on a wooden board"
    width="400"
    height="225"
    loading="lazy"
  />

  <p class="card__description">
    A scientific and cultural exploration of why humans universally love chocolate so much.
  </p>

  <footer class="card__footer">
    <!-- Secondary links: z-index higher than the title ::after -->
    <a class="card__author" href="/author/marie-dupont">Marie Dupont</a>
    <time datetime="2025-03-15">March 15, 2025</time>
  </footer>
</article>
```

---

## Reference CSS

```css
.card {
  position: relative; /* Required for the absolute ::after */
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  border-radius: 0.5rem;
  overflow: hidden;
  background: white;
  box-shadow: 0 2px 8px rgb(0 0 0 / 0.08);
}

/* ─── Trick: make the entire card clickable ─── */
.card__title a {
  text-decoration: none;
  color: inherit;
}

.card__title a::after {
  content: '';
  position: absolute;
  z-index: 1;
  inset: 0; /* covers the entire card */
}

/* ─── Secondary links sit above the click zone ─── */
.card__author,
.card__footer a {
  position: relative;
  z-index: 2;
}

/* ─── Visual reordering via flexbox ─── */
/*
  DOM order (semantic):   1. title  2. image  3. description  4. footer
  Desired visual order:   1. image  2. title  3. description  4. footer
  → Give the image order: -1 so it floats to the top visually.
*/
.card__image {
  order: -1; /* Appears first visually, stays 2nd in the DOM */
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
}

.card__title {
  padding: 0 1rem;
  font-size: 1.125rem;
  line-height: 1.4;
  margin: 0;
}

.card__description {
  padding: 0 1rem;
  color: #555;
  font-size: 0.9rem;
  line-height: 1.6;
  margin: 0;
}

.card__footer {
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #888;
  border-top: 1px solid #eee;
  margin-top: auto;
}
```

---

## Why use `order` instead of rewriting the DOM?

The DOM must reflect the **semantic and accessibility hierarchy**:

- A screen reader navigates in DOM order → title first is correct.
- Google understands semantic structure → `<h3>` before `<img>` signals the image illustrates that title.
- Developers read the HTML and understand the structure without decoding visual reordering tricks.

`order` is a purely visual property that does not affect the DOM, accessibility, or SEO. It is the right tool to decouple **logical order** from **visual order**.

```
DOM (semantic):   [title] [image] [description] [footer]
                       ↓ CSS order
Visual render:    [image] [title] [description] [footer]
```

---

## Common order variants

```css
/* Horizontal card: image left, content right */
.card--horizontal {
  flex-direction: row;
  align-items: flex-start;
}

.card--horizontal .card__image {
  order: -1;
  width: 180px;
  height: 100%;
  flex-shrink: 0;
}

/* Card with a category badge above the title */
.card__category {
  order: -2; /* floats above the image if needed, adjust as required */
  position: relative;
  z-index: 2;
}
```

---

## Checklist before shipping a card

- [ ] Is `<h2>`/`<h3>` first in the DOM?
- [ ] Is the `<a>` link only on the title text?
- [ ] Does `.card` have `position: relative`?
- [ ] Does the `::after` on the title link cover the entire card?
- [ ] Do secondary links have `position: relative; z-index: 2`?
- [ ] Butterfly CMS image → `<Image>` component with `media`, `format`, `widths`, `sizes`?
- [ ] Static/external image → plain `<img>` with `srcset` + `sizes` (no `<picture>/<source>`)?
- [ ] Does the image have a descriptive `alt`?
- [ ] Used `order` for visual layout instead of reordering the DOM?
