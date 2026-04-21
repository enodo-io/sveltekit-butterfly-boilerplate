---
description: Sweep the repo for SEO, a11y, and design-system violations — report only, no edits
---

Audit the repo against every skill's rules. **Report only — do not fix.** The user will triage.

**Run these checks in parallel where possible:**

### SEO

- [ ] `<a>` wrapping a block element — grep `<a[^>]*>\s*<(div|section|article|h[1-6]|p|nav|header|footer)` in `src/**/*.svelte`
- [ ] "Click here" / "Read more" / "Learn more" anchor text (diluted signals)
- [ ] `<img>` without `alt` — grep `<img[^>]*(?!alt=)`
- [ ] Empty `alt=""` on non-decorative images — visual review of card-like components
- [ ] Routes missing from `src/routes/sitemaps/pages.xml/+server.ts` — list all `src/routes/*/+page.svelte` for non-dynamic routes, cross-check sitemap entries
- [ ] Missing `meta.robots` where appropriate (search = `noindex,follow`?)
- [ ] Missing `meta` or `layer` in `+page.server.ts` — grep for return statements without those keys

### Design system

- [ ] `text-sm|text-base|text-lg|text-xl|text-2xl|text-3xl|text-4xl|text-5xl|text-6xl|text-7xl|text-8xl|text-9xl` usages (should be `fs-*`)
- [ ] Raw `font-size` in CSS
- [ ] Arbitrary spacing: `[p|m|gap]-\[[0-9]+(px|rem|em)\]`
- [ ] Numeric Tailwind z-index: `z-(10|20|30|40|50|60|70|80|90|100)` (should be `z-modal`, `z-nav`…)
- [ ] Raw `z-index` in CSS
- [ ] `fs-*` inside `@apply` (forbidden) — grep `@apply[^;]*fs-`

### A11y

- [ ] `<button>` without a11y-meaningful content (no text, no `aria-label`)
- [ ] `<a>` with no text and no `aria-label`
- [ ] Interactive elements without focus styles
- [ ] Missing `lang` on `<html>` (check `src/app.html`)

### Streaming / route

- [ ] `+page.server.ts` files that `await` every feed promise (breaks streaming) — grep `await .+\.get\(` immediately followed by `feeds:`
- [ ] Missing `setHeaders` in `+page.server.ts`
- [ ] Missing `fetch` arg passed to `api.get` calls

### Output format

Report as a **flat punch list** grouped by category. For each finding:

```
[SEO] src/components/Card.svelte:42 — <a> wraps <article>
[DS]  src/routes/articles/+page.svelte:18 — uses text-lg
[A11Y] src/components/Dialog.svelte:23 — button has no aria-label
```

No explanations inline. Finish with a one-line summary (`N findings across K files`).

If you find zero issues in a category, say so explicitly — silence reads as "I didn't check."
