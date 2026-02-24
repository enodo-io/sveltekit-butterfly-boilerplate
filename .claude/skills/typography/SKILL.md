---
name: typography
description: Enforce the use of fs-* utility classes from @enodo/tailwindcss-foundation for all font sizes. Use whenever setting font-size on any element — headings, body text, captions, labels, timestamps, navigation links, or any text element. Never use Tailwind's built-in text-* size utilities (text-sm, text-lg, text-2xl, etc.) or raw font-size CSS values.
---

# Typography — `fs-*` scale

Always use `fs-*` classes for font sizes. Never use Tailwind's `text-sm`, `text-lg`, `text-2xl`, etc. Never write raw `font-size` CSS values.

Each `fs-*` utility sets both `font-size` and `line-height` responsively across four breakpoint groups:

| Group | Condition         | Context        |
| ----- | ----------------- | -------------- |
| A     | default           | Feature phone  |
| B     | `≥ 320px`         | Smartphone     |
| C     | `≥ 600px`         | Tablet / touch |
| D     | `≥ 600px` + mouse | Desktop        |

---

## Editorial sizes — everyday use

| Class             | Usage                           | A     | B     | C     | D     |
| ----------------- | ------------------------------- | ----- | ----- | ----- | ----- |
| `fs-canon`        | Hero or blog post title         | 28/32 | 32/36 | 52/56 | 44/48 |
| `fs-trafalgar`    | Article title, section header   | 20/24 | 24/28 | 36/40 | 32/36 |
| `fs-paragon`      | Primary headline on indexes     | 20/24 | 22/26 | 28/32 | 28/32 |
| `fs-double-pica`  | Sub-header                      | 20/24 | 20/24 | 26/30 | 24/28 |
| `fs-great-primer` | Headline title or subtitle      | 18/22 | 18/22 | 21/24 | 20/24 |
| `fs-body-copy`    | Article body copy **only**      | 15/20 | 16/22 | 18/24 | 16/22 |
| `fs-pica`         | Index links, titles & headlines | 15/20 | 16/20 | 18/22 | 16/20 |
| `fs-long-primer`  | Index body copy, image captions | 15/18 | 15/18 | 15/20 | 14/18 |
| `fs-brevier`      | Timestamps and bylines          | 14/16 | 14/18 | 14/18 | 13/16 |
| `fs-minion`       | Small header capitals, labels   | 12/16 | 12/16 | 13/16 | 12/16 |

Values: font-size/line-height in px.

```svelte
<h1 class="fs-canon">Hero title</h1>
<h2 class="fs-trafalgar">Article title</h2>
<p class="fs-body-copy">Body paragraph text.</p>
<figcaption class="fs-long-primer">Image caption</figcaption>
<time class="fs-brevier">12 Jan 2026</time>
<span class="fs-minion">CATEGORY</span>
```

---

## Display sizes — immersive use only

`fs-atlas`, `fs-elephant`, `fs-imperial`, `fs-royal`, `fs-foolscap` are **not for standard editorial content**. Use only for immersive storytelling, hero covers, or infographic experiences where maximum typographic impact is needed.

| Class         | A    | B    | C     | D     |
| ------------- | ---- | ---- | ----- | ----- |
| `fs-atlas`    | 78px | 96px | 192px | 140px |
| `fs-elephant` | 60px | 78px | 156px | 116px |
| `fs-imperial` | 50px | 64px | 124px | 96px  |
| `fs-royal`    | 40px | 52px | 94px  | 76px  |
| `fs-foolscap` | 32px | 40px | 72px  | 56px  |

These scale dramatically — `fs-atlas` goes from 78 px on a feature phone to 192 px on tablet touch. Only use when this extreme scaling is intentional.

---

## Rules

- `fs-body-copy` is for **article body copy only** — not for UI text or interface elements. Use `fs-pica` for interface text at the same visual size.
- `fs-pica` vs `fs-body-copy`: same sizes, different line-heights. `fs-body-copy` has more generous leading for long-form reading.
- Never combine `fs-*` with `text-*` on the same element — `fs-*` sets both font-size and line-height.
- `@apply` is valid in component CSS: `h1 { @apply fs-canon; }`
