---
name: seo-links
description: Enforce proper SEO-friendly anchor tag creation. Use when writing or reviewing any HTML that contains <a> links — especially in cards, navigation, lists, or any clickable elements. Ensures anchor text is clean, descriptive, and keyword-rich, that block elements are never wrapped in <a> or <button>, and that internal/external links get the right target and rel.
---

# Rules for clean, SEO-friendly `<a>` links

## Core principle

Google reads the text content inside `<a>` as the **primary signal** of a link, and screen readers list links by that same text. It must be:

- **Descriptive**: tell the user exactly what they'll find, out of context
- **Keyword-rich**: use the important terms of the target page
- **Real text**: in the HTML, not in CSS, not only in an attribute

Part of this is enforced by ESLint (`eslint.config.js`, `.svelte` files, blocks the commit): vague anchor texts, `href="#"` / empty `href`, `target="_blank"` without `rel`, `<button>` without `type`. The rest is review (`semantic-html-auditor` agent) and `npm run test:quality` (html-validate on the rendered pages).

---

## Rule 1 — Descriptive text, as little markup as needed

```html
<!-- ✅ pure descriptive text -->
<a href="/recipes/chocolate">Chocolate-based recipes</a>

<!-- ✅ a span for styling is fine: the text is still the anchor text -->
<a href="/recipes/chocolate">Chocolate <span class="font-bold">recipes</span></a>

<!-- ❌ parasitic markup: an empty icon span and a wrapper that only add noise -->
<a href="/recipes/chocolate"><span class="icon"></span><div><span>Recipes</span></div></a>
```

Banned anchor texts (ESLint flags them): « read more », « learn more », « click here », « here », « more », « lire la suite », « en savoir plus », « cliquez ici », « ici », « plus ». Write what the target page is about (`All {category} articles`, the post title…).

Also banned:

- **`href="#"` or an empty `href`**: an action is a `<button type="button">`, a link has a real URL.
- **CSS `content:` as link text** (`a::after { content: 'See all' }`): crawlers and some screen readers don't read it. Decorative pseudo-content is silenced with `content: '>' / ''`.
- **Icon-only links named only by `aria-label`**: `aria-label` is not anchor text for Google. Put the text in the link, visually hidden:

```svelte
<!-- ✅ Breadcrumb.svelte -->
<a href={resolve('/')}><Home size={16} /><span class="sr-only">{siteTitle}</span></a>

<!-- ❌ -->
<a href="/" aria-label="Home"><Home size={16} /></a>
```

- **A `title` repeating the link text**: noise for screen readers, no SEO value. Use `title` only for extra information.

---

## Rule 2 — No flow content inside `<a>` or `<button>`

`<a>` and `<button>` take phrasing content only. No `<div>`, `<article>`, `<h2>`, `<p>`, `<section>`, `<ul>`, `<figure>` inside. Invalid HTML (html-validate flags it) and a diluted anchor text.

```html
<!-- ✅ the link is inside the heading -->
<h3><a href="/article/why-chocolate">Why is chocolate so good?</a></h3>

<!-- ❌ heading inside the link -->
<a href="/article/why-chocolate"><h3>Why is chocolate so good?</h3></a>

<!-- ❌ same for a button -->
<button type="button"><div class="card">…</div></button>
```

---

## Rule 3 — Never wrap an entire card in `<a>`

Wrapping a whole card makes the HTML invalid, turns the image, resume and labels into anchor text, and forbids any second link inside the card.

```html
<!-- ❌ -->
<a href="/article/chocolate">
  <article class="card"><img … /><h3>Why is chocolate so good?</h3><p>…</p></article>
</a>

<!-- ✅ only the title carries the link -->
<article class="card">
  <h3><a href="/article/chocolate">Why is chocolate so good?</a></h3>
  <p>An article description…</p>
  <img … alt="" />
</article>
```

---

## Rule 4 — Whole card clickable: the stretched `::after`

The title link's `::after` covers the card. Use the z-index tokens (`z-index` skill), never raw numbers:

```css
.card {
  position: relative; /* required */
}

.card__title a::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: var(--z-selected);
}

/* any other link or button inside the card sits above the click zone */
.card a:not(.card__title a),
.card button {
  position: relative;
  z-index: var(--z-active);
}
```

The utilities `link--overlay` (the `::after`) and `link--wrapper` (raises the other links/buttons) in `src/assets/styles/tailwind.css` do the same.

---

## Rule 5 — Image links

When the only content of an `<a>` is an image, its `alt` is the anchor text: it must describe the target. An image **next to** a text link to the same target is decorative: `alt=""` (the card thumbnail without a description, the avatar next to the author name).

---

## Rule 6 — Internal vs external

Content links (post body, quote sources) go through `$lib/links`:

- `contentLink(href)` classifies by **host**: same host as `PUBLIC_BASE_URL` (www or not, http or https) or relative = **internal**, rendered as a path. `''`, `#`, unparsable → `null`: render the text, no link.
- **Internal**: same tab (never `target="_blank"`), never `rel="sponsored"`/`nofollow`; `resolve()` for the routes of the app.
- **External web**: `target="_blank"` with `rel` from `externalRel({ sponsored, ugc, nofollow })` → always `noopener`, plus:
  - `sponsored`: a paid link (the CMS `sponsored` attribute/`rel`, or every external link of a post flagged `sponso`)
  - `ugc`: user-generated content (comments, forum)
  - `nofollow`: a link you don't vouch for
- `mailto:`, `tel:`: as they are, no target.

Author links carry `rel="author"`. A hand-written paid link elsewhere (a partner banner) gets `rel="sponsored noopener"` explicitly.

---

## Quick checklist

- [ ] The text inside `<a>` is descriptive and not in the banned list?
- [ ] No flow content (div, h*, p, article, ul, figure) inside `<a>` or `<button>`?
- [ ] No `href="#"`, no empty href, no CSS `content:` as text?
- [ ] Icon-only link → visually hidden text, not just `aria-label`?
- [ ] Card → link on the title only, stretched `::after` with `--z-selected`, other links `--z-active`?
- [ ] Image link → `alt` describes the target; image next to its text link → `alt=""`?
- [ ] CMS link → `contentLink` / `externalRel`: internal same tab, external `_blank` + `noopener` (+ sponsored/ugc/nofollow)?
