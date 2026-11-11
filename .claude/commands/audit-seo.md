---
description: Sweep the repo for SEO, semantic HTML, performance and design-system violations — report only, no edits
---

Audit the repo against every skill's rules. **Report only — do not fix.** The user will triage.

**Run the three auditors in parallel** (`.claude/agents/`), they run the project's gates first (`npm run lint`, `npm run check`, `npm run build`, `npm run budget`, `npm run test:quality` when a `.env` with the API exists) then the judgement checks:

- `seo-auditor` — head contract, canonical/URLs, soft 404s, JSON-LD, links, feeds, sitemaps
- `semantic-html-auditor` — links/buttons content, anchor text, native elements, headings, landmarks, lists, tables, focus
- `perf-reviewer` — first-load JS/CSS budget, LCP image, `sizes`, service worker, fonts, third parties, waterfalls

**Then sweep the design system yourself** (no tool enforces it):

- [ ] `text-sm|text-base|text-lg|text-xl|text-2xl|…|text-9xl` usages (should be `fs-*`)
- [ ] Raw `font-size` in CSS
- [ ] `fs-*` inside `@apply` (forbidden) — grep `@apply[^;]*fs-`
- [ ] Arbitrary spacing: `(p|m|gap)[xytrbl]?-\[[0-9.]+(px|rem|em)\]`
- [ ] Numeric Tailwind z-index `z-(10|20|30|40|50)` and raw `z-index: <number>` in CSS (should be `z-*` / `var(--z-*)`)

### Output format

Merge the three reports and your sweep into one punch list, ordered by impact:

```
[META] src/routes/<route>/+page.server.ts:<line> — description null when the term has none — fall back to a sentence — CERTAIN
[CONTENT] src/components/<Component>.svelte:<line> — <a> wraps <h3> — move the link inside the heading — CERTAIN
[LCP] src/routes/<route>/+page.svelte:<line> — sizes 320px on a 413px LCP image — compute from the grid — CERTAIN
[DS] src/routes/<route>/+page.svelte:<line> — uses text-lg — fs-pica — CERTAIN
```

One « zero findings » line per empty category — silence reads as « I didn't check ». Finish with a one-line summary (`N findings across K files`).
