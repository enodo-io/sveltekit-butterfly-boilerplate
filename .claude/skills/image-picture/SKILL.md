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
- `alt` — the media description by default; `""` for a decorative image (it repeats the text next to it)
- `lazyload` — defaults to `true`; set `false` for above-the-fold images
- `priority` — the LCP image (below)

`<Image>` adds the 2× of every width and **snaps every width to one ladder** (`$lib/imageWidths`: 160, 240, 320, 400, 480, 640, 768, 960, 1080, 1280, 1536, 1920, 2560): 640/760/768 are one CDN variant shared by every component, never above the source width. The `src` is `snapWidth(width)`.

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

With `priority`, `<Picture>` emits one `<link rel="preload" fetchpriority="high" media="…">` per `<source>` (only the matching one downloads) and `fetchpriority="high"` on the `<img>`, never a preload of the fallback on top.

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
  priority
/>
```

Two props, two jobs:

- `lazyload={false}`: no `loading="lazy"` (every image above the fold).
- `priority`: `fetchpriority="high"` on the `<img>` and a `<link rel="preload" fetchpriority="high">` in `<svelte:head>` (the default image when there is no media), never lazy. **One image per page at most**, the LCP candidate: several "high" images compete with each other and with the CSS, and a small avatar must never get it. `e2e/quality.test.ts` fails on more than one `img[fetchpriority="high"]`.

Where it is today: the first card of every listing (`<Feed priority>`), the home featured post, the category hero when the category has a thumbnail (then the feed has no `priority`). Post pages have none (the avatar is not the LCP).

Other images on the page stay with the default `lazyload={true}`.

### `sizes` must match the real layout

`sizes` tells the browser the rendered width before the CSS is known. Compute it from the grid: the `<main>` column is `max-w-screen-md` (1008px) minus `p-2`, so **992px from `md`, `calc(100vw - 16px)` below**. A post body is `col-span-2` of 3 (`656px` from `md`); the home featured image is the `5fr` of a `5fr/7fr` grid (`413px` from `md`, `41vw` from `sm`). `100vw` on an image that renders at 656px downloads a file twice too big; `320px` on one that renders at 413px makes the LCP image blurry.

---

## `Feed` pre-load control

`<Feed>` exposes `lazyloadAfter` — the first N cards render eagerly (e.g. `lazyloadAfter={3}` for a 3-column grid), the rest lazy-load:

```svelte
<Feed feed={posts} length={9} lazyloadAfter={3} priority />
```

Set this to match the cards that are above the fold. `priority` makes the first card's image the LCP candidate: only when nothing above the feed (a hero image) already is. `length` (the skeleton count) must equal the page size of the query, or the layout shifts when the cards arrive.

No fade-in on images: an `<img>` kept at `opacity: 0` until hydration is invisible before the JS runs, and not counted as the LCP.

---

## What NOT to do

- Don't build `<picture>` with multiple `<source type="image/webp">` for format negotiation — Butterfly's API does that via the `Accept` header.
- Don't use `<Image>` without thinking about `alt`: the media description when it informs; `alt=""` when the image only repeats adjacent text (a card thumbnail without description next to its title, an avatar next to the author name).
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
- [ ] LCP image has `lazyload={false}` and `priority`, and it is the only `priority` image of the page?
- [ ] `sizes` computed from the real grid (992px / 656px from `md`)?
- [ ] `alt` is descriptive (or `""` only if decorative: it repeats the text next to it)?
