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

### Latin subset (optional, smaller file)

```css
@import '@fontsource/poppins/latin/400.css'; /* latin only */
@import '@fontsource/poppins/400.css'; /* full charset */
```

Use latin subset when the site doesn't need extended character sets.

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
@import '@fontsource/poppins/300.css';
@import '@fontsource/poppins/400.css';
@import '@fontsource/poppins/500.css';
@import '@fontsource/poppins/600.css';
@import '@fontsource/poppins/700.css';
@import '@fontsource/poppins/800.css';
@import '@fontsource/poppins/900.css';
@import '@fontsource-variable/open-sans';
@import '@fontsource/fira-mono';

@theme {
  --font-brand: 'Poppins', sans-serif;
  --font-sans: 'Open Sans Variable', Arial, -apple-system, …, sans-serif;
  --font-mono: 'Fira Mono', monospace;
}
```
