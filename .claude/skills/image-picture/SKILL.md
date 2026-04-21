---
name: image-picture
description: Decide between `<Image>` and `<Picture>` components, choose the right media format, set `widths`/`sizes` for responsive loading, and opt-out of lazy loading for the LCP image. Use whenever rendering a Butterfly media asset. Covers formats (thumb/square/cover/stories), preload strategy, and the `<picture>` vs plain `<img>` trade-off.
---

# `<Image>` vs `<Picture>` — when to use which

Both components live in `src/components/` and wrap Butterfly media URLs via `$lib/getMediaUrl`. The Butterfly media API already negotiates format (WebP/AVIF/JPEG) via the HTTP `Accept` header — you rarely need `<picture>` with multiple `<source>` elements.

## Decision rule

| Situation                                                 | Component                                              |
| --------------------------------------------------------- | ------------------------------------------------------ |
| One media asset at different sizes across breakpoints     | `<Image>` with `widths` + `sizes`                      |
| Different **crops** / **compositions** across breakpoints | `<Picture>` with `srcset` entries                      |
| External/static image (not from Butterfly)                | Plain `<img>` with `srcset`/`sizes` (see `card` skill) |

**Default to `<Image>`.** Only reach for `<Picture>` when you genuinely need a different art-direction at a different breakpoint (e.g. portrait crop on mobile, landscape on desktop).

---

## `<Image>` — responsive single-asset

```svelte
<script>
  import Image from '$components/Image.svelte';
</script>

<Image
  media={post.attributes.image}
  format="thumb"
  width={540}
  widths={[320, 480, 768, 990]}
  sizes="(min-width: 768px) 33vw, 100vw"
  alt={post.attributes.title}
/>
```

Props at a glance:

- `media` — Butterfly media object (falls back to `src/assets/images/thumb.jpg` if missing)
- `format` — `'default' | 'source' | 'thumb' | 'square' | 'cover' | 'stories'`
- `width` — base width (single `src`)
- `widths` — array of widths for `srcset`
- `sizes` — CSS `sizes` attribute
- `alt` — required for a11y
- `lazyload` — defaults to `true`; set `false` for above-the-fold/LCP

`<Image>` automatically generates 2× variants for retina screens.

---

## `<Picture>` — art direction across breakpoints

```svelte
<script>
  import Picture from '$components/Picture.svelte';
</script>

<Picture
  media={post.attributes.image}
  srcset={[
    { query: '(max-width: 768px)', width: 400 },
    { query: '(min-width: 769px)', width: 800 },
  ]}
  alt={post.attributes.title}
/>
```

Use `<Picture>` only when the layout demands a different **visual** source per breakpoint — e.g. portrait mobile hero vs landscape desktop hero. For pure size variation, `<Image>` is lighter (no `<source>` elements, single tag in the DOM).

---

## Format — pick by aspect ratio

| Format    | Aspect / use                                 |
| --------- | -------------------------------------------- |
| `default` | Original Butterfly default — avoid for cards |
| `source`  | Untransformed source — rarely what you want  |
| `thumb`   | 16:9 crop — cards, article previews          |
| `square`  | 1:1 — avatars, grid tiles                    |
| `cover`   | 850×315 — wide banner / hero strip           |
| `stories` | Portrait — mobile hero, vertical story cards |

Choice follows the **visual slot**, not the original image ratio.

---

## `widths` + `sizes` — pick by real-world render width

The `sizes` attribute tells the browser which `widths` candidate to pick. Write it as a list of `(breakpoint) rendered-width` pairs:

```svelte
sizes="(min-width: 1024px) 400px, (min-width: 600px) 33vw, 100vw"
```

This reads: "≥1024px → 400px wide, ≥600px → one third of viewport, otherwise full viewport."

`widths` should bracket the real render widths across breakpoints:

```ts
widths={[320, 480, 768, 990]}  // ≤mobile, ≤tablet, ≤laptop, ≤desktop
```

Don't pad with extreme values — each extra width costs a conditional request for nothing.

---

## LCP / above-the-fold — opt out of lazy

Lazy loading the LCP image kills Core Web Vitals. For the **first** image on a page (hero card, article header, etc.):

```svelte
<Image
  media={article.attributes.image}
  format="cover"
  widths={[320, 480, 768]}
  sizes="100vw"
  alt={article.attributes.title}
  lazyload={false}
/>
```

`lazyload={false}` removes `loading="lazy"`, adds `fetchpriority="high"`, and emits a `<link rel="preload">` in `<svelte:head>`.

Other images on the page stay with the default `lazyload={true}`.

---

## `Feed` pre-load control

`<Feed>` exposes `lazyloadAfter` — the first N cards render eagerly (e.g. `lazyloadAfter={3}` for a 3-column grid), the rest lazy-load:

```svelte
<Feed feed={posts} length={9} lazyloadAfter={3} />
```

Set this to match the cards that are above the fold.

---

## What NOT to do

- Don't build `<picture>` with multiple `<source type="image/webp">` for format negotiation — Butterfly's API does that via the `Accept` header.
- Don't use `<Image>` without `alt`. Empty string `alt=""` is valid for decorative images only; post thumbnails must have descriptive alt.
- Don't lazy-load the LCP image.
- Don't use raw `<img>` tags with Butterfly media URLs — you lose srcset, retina, and preload.
- Don't pad `widths` with sizes the layout never uses at any breakpoint.

---

## Checklist

- [ ] Is this a Butterfly media asset? → `<Image>` or `<Picture>` (not raw `<img>`)
- [ ] Same crop across breakpoints? → `<Image>`
- [ ] Different crop/composition per breakpoint? → `<Picture>`
- [ ] `format` matches the visual slot (thumb/square/cover/stories)?
- [ ] `widths` bracket the real rendered widths at each breakpoint?
- [ ] `sizes` tells the browser the render width at each breakpoint?
- [ ] LCP image has `lazyload={false}`?
- [ ] `alt` is descriptive (or `""` only if purely decorative)?
