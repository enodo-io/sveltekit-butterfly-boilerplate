---
description: Rewrite the @theme colour tokens in tailwind.css for a new palette
---

Replace the colour palette in `src/assets/styles/tailwind.css` inside the `@theme` block.

**Ask the user first:**

1. What palette do they want? Options:
   - A named preset (Blog, Restaurant, Corporate, Creative, E-commerce, Healthcare — see README "Project-Type Color Suggestions")
   - Specific brand colours (primary accent + text/background)
   - A project type they describe ("warm, inviting, food-focused")
2. Keep the existing `light` neutral family, or rename it?
3. Primary accent name — keep `flash` or rename (`brand`, `primary`, `accent`)?
4. How many shades of the accent (full 025–900 scale or just 050/600/700)?

**Then apply:**

1. Open `src/assets/styles/tailwind.css`, find the `@theme` block.
2. Rewrite the colour tokens:
   - Neutral family: `--color-{name}`, `--color-{name}-025` through `--color-{name}-900`
   - Accent family: `--color-{accent}`, `--color-{accent}-050` through `--color-{accent}-700` (or whichever shades)
   - Semantic: `--color-error`, optionally `--color-success`, `--color-warning`
3. Keep the structure identical — Tailwind utility classes (`bg-flash`, `text-light-900`) depend on the token naming pattern `--color-{family}[-{shade}]`.
4. **Don't rename tokens silently** — if `flash` becomes `brand`, grep the codebase for `bg-flash`, `text-flash`, `border-flash`, etc. and update all call sites. Skip only `.post.css` classes if they don't reference colour tokens.

**Validate:**

- [ ] `npm run dev` — the site still renders without unstyled elements
- [ ] Run `grep -rn "flash\|light-" src/` to catch stale references
- [ ] Contrast check for the accent against background — WCAG AA minimum

**After changing**, report: tokens replaced, call sites updated, and ask the user to visually review the dev server.
