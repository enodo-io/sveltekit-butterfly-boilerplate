---
name: seo-links
description: Enforce proper SEO-friendly anchor tag creation. Use when writing or reviewing any HTML that contains <a> links — especially in cards, navigation, lists, or any clickable elements. Ensures anchor text is clean, descriptive, and keyword-rich, and that block elements are never wrapped in <a> tags.
---

# Rules for clean, SEO-friendly `<a>` links

## Core principle

Google reads the raw text content inside `<a>` tags as the **primary SEO signal** for a link. That text must be:

- **Descriptive**: tell the user exactly what they'll find
- **Keyword-rich**: use the important terms from the target page
- **Clean**: as little HTML markup as possible around the text

---

## Rule 1 — Text only inside `<a>`, maximize keywords, minimize HTML

```html
<!-- ✅ Good: pure descriptive text, keywords inside -->
<a href="/recipes/chocolate">List of chocolate-based recipes</a>

<!-- ❌ Bad: "Click here" gives Google zero signal -->
<a href="/recipes/chocolate">Click here</a>

<!-- ❌ Bad: unnecessary tags pollute the anchor text signal -->
<a href="/recipes/chocolate"><span class="icon"></span><span>Recipes</span></a>
```

---

## Rule 2 — Never put block elements inside `<a>`

`<a>` is an **inline** element. It cannot contain block elements (`<div>`, `<article>`, `<h2>`, `<p>`, `<section>`…). This is invalid HTML and confuses crawlers.

```html
<!-- ✅ Valid: link is INSIDE the block element -->
<h3><a href="/article/why-chocolate">Why is chocolate so good?</a></h3>

<!-- ❌ Invalid: block element INSIDE the link -->
<a href="/article/why-chocolate">
  <h3>Why is chocolate so good?</h3>
</a>
```

---

## Rule 3 — Never wrap an entire card in `<a>`

This is the most frequent and most damaging mistake. Wrapping a whole `<div>` in `<a>`:

- Makes the HTML invalid (block inside inline)
- Dilutes the anchor text signal with parasitic markup (img, spans, icons…)
- Prevents having multiple independent links inside the card

```html
<!-- ❌ Very bad: entire card inside the link -->
<a href="/article/chocolate">
  <div class="card">
    <img src="chocolate.jpg" alt="Chocolate" />
    <h3>Why is chocolate so good?</h3>
    <p>An article description...</p>
  </div>
</a>

<!-- ✅ Good: only the title carries the link, everything else is free -->
<div class="card">
  <img src="chocolate.jpg" alt="Chocolate" />
  <h3><a href="/article/chocolate">Why is chocolate so good?</a></h3>
  <p>An article description...</p>
</div>
```

---

## Rule 4 — Make an entire card clickable without wrapping it in `<a>`

Use the `::after` pseudo-element on the title link to create an invisible click zone covering the whole card.

```css
.card {
  position: relative; /* required */
}

.card a::after {
  content: '';
  position: absolute;
  z-index: 1;
  inset: 0; /* shorthand for top: 0; right: 0; bottom: 0; left: 0; */
}
```

Any other link inside the card (author, category…) must have `position: relative; z-index: 2` to sit above the click zone.

---

## Rule 5 — Image links

When the only content of a `<a>` is an image, the `alt` attribute acts as the anchor text for Google.

```html
<!-- ✅ Good: descriptive alt = good anchor text -->
<a href="/recipes/chocolate">
  <img src="chocolate.jpg" alt="Dark chocolate dessert recipes" />
</a>

<!-- ❌ Bad: empty alt = empty anchor text, link is invisible to Google -->
<a href="/recipes/chocolate">
  <img src="chocolate.jpg" alt="" />
</a>
```

---

## Quick checklist

Before validating any `<a>` tag:

- [ ] Is the text inside descriptive and keyword-rich?
- [ ] Is there only text inside (no divs, h2, p, article)?
- [ ] Is the card/component NOT entirely wrapped in `<a>`?
- [ ] If clickable card → using `::after` on the title link?
- [ ] If image link → is `alt` descriptive?
