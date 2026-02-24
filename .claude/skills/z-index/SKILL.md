---
name: z-index
description: Enforce the use of z-* utility classes from @enodo/tailwindcss-foundation for all z-index values. Use whenever setting z-index on any element — modals, backdrops, navigation, dropdowns, tooltips, popovers, banners, overlays, or any stacking context. Never use Tailwind's built-in z-* numeric utilities (z-10, z-50, z-100, etc.) or raw z-index CSS values.
---

# Z-index — `z-*` scale

Always use the named `z-*` classes. Never use raw `z-index` values or Tailwind's numeric utilities (`z-10`, `z-50`, etc.).

| Class         | Value | Use for                   |
| ------------- | ----- | ------------------------- |
| `z-modal`     | 9050  | Modal dialog              |
| `z-modal-bg`  | 9000  | Modal backdrop            |
| `z-nav-fixed` | 5050  | Fixed navigation overlay  |
| `z-nav`       | 5000  | Navigation                |
| `z-banner`    | 4000  | Banners, toasts           |
| `z-tooltip`   | 3000  | Tooltips                  |
| `z-popover`   | 2000  | Popovers                  |
| `z-dropdown`  | 1000  | Dropdowns                 |
| `z-active`    | 50    | Active or focused element |
| `z-selected`  | 25    | Selected element          |
| `z-base`      | 0     | Default stacking context  |
| `z-hide`      | -1    | Hidden behind parent      |

```svelte
<dialog class="z-modal">...</dialog>
<div class="z-modal-bg">...</div>
<header class="z-nav-fixed">...</header>
<nav class="z-nav">...</nav>
<div class="z-dropdown">...</div>
<div class="z-tooltip">...</div>
```

## When no class fits

If the exact layer isn't covered, prefer adapting to the closest named class and adjusting the element's role. Only as a last resort, use `calc()` in CSS with the underlying CSS variable:

```css
/* Last resort only — prefer a named class */
.my-element {
  z-index: calc(var(--z-modal) + 1);
}
```

Always prefer a named class first. If a `calc()` offset is genuinely needed, keep it in a CSS file — not as an inline style.
