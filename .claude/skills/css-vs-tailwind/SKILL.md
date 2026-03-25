---
name: css-vs-tailwind
description: Decide when to use Tailwind utility classes directly vs creating a custom CSS class. Use when styling any element — applying classes to HTML, creating new components, or reviewing existing styles. Default to Tailwind utilities; only extract a custom CSS class when the same combination of utilities repeats many times in the final DOM.
---

# CSS vs Tailwind — when to extract a custom class

Tailwind utility classes are the default. Only create a custom CSS class when the exact same set of utilities would appear many times in the final rendered DOM, making the repeated inline classes heavier than a single class definition.

## Decision rule

| Situation                                                                                           | Action                          |
| --------------------------------------------------------------------------------------------------- | ------------------------------- |
| Element appears **1–2 times** in the final DOM                                                      | Use Tailwind utilities directly |
| Element appears **many times** in the final DOM (lists, repeated cards, table cells, tags, badges…) | Extract a custom CSS class      |

## Examples

### Tailwind utilities — element used once or twice

```svelte
<!-- ✅ Only one main header per page — Tailwind directly -->
<header class="flex items-center justify-between gap-7 p-4">
  <a href="/">Home</a>
</header>

<!-- ✅ One hero section — Tailwind directly -->
<section class="grid gap-9 py-12 text-center">
  <h1 class="fs-trafalgar font-bold">Welcome</h1>
</section>
```

### Custom CSS class — element repeated many times

```svelte
<!-- ✅ Tag appears dozens of times in a listing — extract a class -->
{#each tags as tag}
  <a href={tag.href} class="tag">{tag.label}</a>
{/each}
```

```svelte
<!-- ✅ Keep fs-brevier as a Tailwind class, extract the rest -->
{#each tags as tag}
  <a href={tag.href} class="tag fs-brevier">{tag.label}</a>
{/each}
```

```css
/* Custom class justified by high repetition in the DOM */
.tag {
  @apply inline-block rounded-full bg-neutral-100 px-3 py-1 no-underline;
}
```

### Wrong: custom class for a one-off element

```svelte
<!-- ❌ Only one footer per page — no need for a custom class -->
<footer class="site-footer">...</footer>
```

```css
/* Unnecessary — just put the utilities on the element */
.site-footer {
  @apply border-t p-7;
}
```

## Key points

- The threshold is about the **final DOM**, not the source code. A Svelte `{#each}` that renders 50 items means 50 occurrences in the DOM — extract a class. A component imported in 2 places means 2 occurrences — keep utilities.
- When extracting, use `@apply` to compose from existing Tailwind utilities rather than writing raw CSS values.
- **`fs-*` classes must always stay as Tailwind classes in the HTML — never put them inside `@apply`.** Even when extracting a custom CSS class, keep `fs-*` on the element alongside the custom class. This ensures typography remains visible and overridable at the template level.
- This rule complements the typography, spacing, z-index, and fonts skills — always use the foundation's utility classes as the building blocks, whether inline or inside `@apply`.
