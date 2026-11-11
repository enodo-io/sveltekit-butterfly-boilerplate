---
name: fonts
description: Enforce the use of Fontsource npm packages for all web fonts. Use when adding, changing, or removing fonts in the project. Never use Google Fonts link tags or @import CDN URLs — always install fonts as npm packages, import them in src/assets/styles/tailwind.css, and declare the font token in the @theme block.
---

# Fonts — Fontsource

Always install fonts via npm. Never use `<link>` tags to Google Fonts or any CDN `@import`.

---

## Two files to edit together

Font configuration lives in **`src/assets/styles/tailwind.css`** — both the `@import` (font-face declarations) and the `--font-*` CSS variable (Tailwind token) belong in the same file so they stay in sync.

```css
/* 1. Import font-face at the top of tailwind.css */
@import '@fontsource-variable/open-sans';
@import '@fontsource/poppins/400.css';
@import '@fontsource/poppins/700.css';

/* 2. Declare the token in @theme */
@theme {
  --font-brand: 'Poppins', sans-serif;
  --font-sans: 'Open Sans Variable', Arial, sans-serif;
}
```

The `--font-*` tokens become Tailwind utilities automatically: `font-brand`, `font-sans`, `font-mono`.

---

## Two package variants

| Variant                | Package                       | Import syntax                                |
| ---------------------- | ----------------------------- | -------------------------------------------- |
| Variable (all weights) | `@fontsource-variable/{name}` | `@import '@fontsource-variable/{name}.css';` |
| Static (per weight)    | `@fontsource/{name}`          | `@import '@fontsource/{name}/{weight}.css';` |

**Prefer variable fonts when available** — one file covers all weights.

---

## Installing

```bash
# Variable font (preferred when available)
npm install -D @fontsource-variable/open-sans

# Static font — install once, import per weight
npm install -D @fontsource/poppins
```

---

## Import patterns

### Variable font

```css
@import '@fontsource-variable/open-sans';
```

### Static font — only the weights actually used

```css
@import '@fontsource/poppins/400.css';
@import '@fontsource/poppins/600.css';
@import '@fontsource/poppins/700.css';
```

Typical set: `400`, `500`, `600`, `700`. Don't import unused weights.

### Latin subsets (default)

```css
@import '@fontsource/poppins/latin-400.css'; /* é, ü, ç… */
@import '@fontsource/poppins/latin-ext-400.css'; /* Central European, ő, ł… */
```

Import `latin` + `latin-ext` per weight, not `{weight}.css`: the full charset adds cyrillic, greek, devanagari, vietnamese… `@font-face` rules to the main CSS of every page (Poppins in 7 weights was 29% of the CSS). Add a subset only for a site written in that script. A variable font without per-subset files (`@fontsource-variable/open-sans`) is fine as is: its `unicode-range` already limits the download to the latin file.

### Metric fallbacks (no layout shift at the swap)

Each `--font-*` lists a `{Font} Fallback` face right after the web font: Arial with the `size-adjust` / `ascent-override` / `descent-override` / `line-gap-override` of the web font, so text keeps the same size and line height before and after `font-display: swap`. For a new font, compute them with Capsize:

```bash
npx -y -p @capsizecss/core -p @capsizecss/metrics node -e "
const { createFontStack } = require('@capsizecss/core');
const m = (n) => require('@capsizecss/metrics/' + n);
console.log(createFontStack([{ ...m('poppins'), familyName: 'Poppins' }, m('arial')], { fontFaceFormat: 'styleString' }).fontFaces)"
```

---

## Removing a font

1. Remove its `@import` lines from `tailwind.css`
2. Remove or update the `--font-*` variable in `@theme` if it referenced that font
3. Uninstall the package:

```bash
npm uninstall @fontsource/old-font-name
```

---

## Current setup (reference)

```css
/* tailwind.css — imports + @theme */
@import '@fontsource/poppins/latin-400.css';
@import '@fontsource/poppins/latin-ext-400.css';
@import '@fontsource/poppins/latin-600.css';
@import '@fontsource/poppins/latin-ext-600.css';
@import '@fontsource-variable/open-sans';
@import '@fontsource/fira-mono/latin-400.css';
@import '@fontsource/fira-mono/latin-ext-400.css';
/* + the 'Open Sans Variable Fallback' and 'Poppins Fallback' @font-face */

@theme {
  --font-brand: 'Poppins', 'Poppins Fallback', sans-serif;
  --font-sans: 'Open Sans Variable', 'Open Sans Variable Fallback', Arial, …, sans-serif;
  --font-mono: 'Fira Mono', monospace;
}
```

Poppins is the header font only (400 and 600): a new weight in the header needs its import.

---

## Preload the fonts of the first paint

`src/routes/+layout.svelte` preloads the woff2 files the first screen needs (the body text and the header font), imported from the Fontsource package with `?url` and emitted as `<link rel="preload" as="font" crossorigin>`. Without it the browser discovers a font only once the CSS is parsed and the text laid out. Preload two or three files at most: every preload competes with the HTML and the CSS. When a font changes, change the imports there too.

