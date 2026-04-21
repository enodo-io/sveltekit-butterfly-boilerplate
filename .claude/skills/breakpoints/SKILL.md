---
name: breakpoints
description: Work with the responsive breakpoints defined in `src/lib/breakpoints.ts` (auto-generated from `scripts/setup-breakpoints.js`). Use when referencing breakpoints in JS (not CSS — Tailwind covers that), adding a new breakpoint, or explaining why `src/lib/breakpoints.ts` is generated and excluded from lint/format.
---

# Breakpoints — single source of truth

The project has one breakpoints definition and two consumption paths:

- **Source**: `scripts/setup-breakpoints.js` — the canonical values (sm/md/lg).
- **Runtime import**: `src/lib/breakpoints.ts` — auto-generated from the script, imported as `import { breakpoints } from '$lib/breakpoints'` in Svelte code that needs pixel thresholds in JS (media query listeners, viewport checks).
- **CSS / Tailwind**: the same values are mirrored in the Tailwind `@theme` (in `src/assets/styles/tailwind.css`). Don't read `breakpoints.ts` from CSS.

## The current values

```ts
// Auto-generated in src/lib/breakpoints.ts
export const breakpoints = {
  sm: 600,
  md: 1008,
  lg: 1280,
} as const;
```

Matches the BBC GEL breakpoint scale that `@enodo/tailwindcss-foundation` follows.

---

## When to import

Import in Svelte code only when you need a **pixel threshold at runtime**:

```svelte
<script>
  import { breakpoints } from '$lib/breakpoints';

  let isMobile = $state(false);

  $effect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoints.sm - 1}px)`);
    isMobile = mql.matches;
    const listener = (e) => (isMobile = e.matches);
    mql.addEventListener('change', listener);
    return () => mql.removeEventListener('change', listener);
  });
</script>
```

Don't import this in CSS or `<style>` blocks — use Tailwind's responsive prefixes (`md:`, `lg:`) or `@media` queries with raw values that match the theme.

---

## Adding or changing a breakpoint

1. Edit `scripts/setup-breakpoints.js`:
   ```js
   const breakpoints = {
     sm: 600,
     md: 1008,
     lg: 1280,
     xl: 1536, // new
   };
   ```
2. **Delete** `src/lib/breakpoints.ts` (the script skips regeneration if it exists).
3. Run `npm run setup:breakpoints` — regenerates the TS file.
4. Update the Tailwind `@theme` in `src/assets/styles/tailwind.css` to add the same breakpoint token. Tailwind responsive prefixes (`xl:`) pick it up automatically.
5. Commit both files together.

The `predev` / `prebuild` npm scripts run `setup:breakpoints` automatically, so a fresh clone bootstraps correctly — but they **skip** if `breakpoints.ts` already exists. To truly reset, delete and re-run.

---

## Why it's generated

Two reasons:

- **Single source of truth**: the script writes the TS file, which enforces the exact same values are used in JS runtime logic. No drift between "what the JS thinks the breakpoint is" and "what the Tailwind config says".
- **Type safety**: the generated file exports `breakpoints` as `const` with literal types, so `breakpoints.sm` narrows to `600`, not `number`.

---

## Linting / formatting

`src/lib/breakpoints.ts` is in `.prettierignore` and typically also excluded from lint. Don't hand-edit it — re-run the script.

---

## What NOT to do

- Don't hardcode pixel values like `600`, `1008`, `1280` in Svelte `<script>` blocks. Always import `breakpoints`.
- Don't import `breakpoints` in CSS via `@apply` or `@theme` — the values live twice on purpose (JS vs CSS). Keep them in sync manually when adding a new one.
- Don't rename the exported object. Downstream imports assume `{ breakpoints }`.
- Don't convert `breakpoints.ts` to `.js` — the project uses TS everywhere, and the generator outputs `.ts`.
