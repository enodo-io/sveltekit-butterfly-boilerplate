---
name: spacing
description: Enforce the use of BBC GEL spacing units from @enodo/tailwindcss-foundation for all spacing. Use whenever applying margin, padding, or gap to any element. Never use arbitrary values (p-[20px], m-[2rem]) or values outside the scale. SU1, SU3, SU5 are restricted to component-level spacing only — never use them for page layout.
---

# Spacing — BBC GEL spacing units

Spacing units map directly to Tailwind's numeric utilities (`p-4`, `m-7`, `gap-9`, etc.). Never use arbitrary values or raw CSS spacing. One unit = one value — never stack two units to reach a size not in the scale.

| SU  | Token | px    | Notes                    |
| --- | ----- | ----- | ------------------------ |
| 1   | `1`   | 4px   | ⚠ Component spacing only |
| 2   | `2`   | 8px   |                          |
| 3   | `3`   | 12px  | ⚠ Component spacing only |
| 4   | `4`   | 16px  |                          |
| 5   | `5`   | 20px  | ⚠ Component spacing only |
| 6   | `6`   | 24px  |                          |
| 7   | `7`   | 32px  |                          |
| 8   | `8`   | 40px  |                          |
| 9   | `9`   | 48px  |                          |
| 10  | `10`  | 56px  |                          |
| 11  | `11`  | 64px  |                          |
| 12  | `12`  | 72px  |                          |
| 13  | `13`  | 80px  |                          |
| 14  | `14`  | 120px |                          |
| 15  | `15`  | 160px |                          |
| 16  | `16`  | 200px |                          |

SU 1–6 use Tailwind's default scale (N × 0.25 rem). SU 7–16 are overridden by `@enodo/tailwindcss-foundation` to match the GEL scale.

---

## ⚠ SU 1, 3, 5 — component spacing only

Use `1`, `3`, `5` only for fine-grained spacing **inside** a component: button padding, icon alignment, internal gaps. Never for page layout (spacing between sections, grid gaps, content regions).

```svelte
<!-- ✅ Component: fine units OK -->
<button class="gap-1 px-5 py-3">Submit</button>

<!-- ✅ Layout: multiples of 8 only -->
<section class="gap-7 py-9">...</section>

<!-- ❌ Fine unit used for layout -->
<section class="gap-3">...</section>
```

---

## Spacing is for space only

Use spacing units for `margin`, `padding`, `gap` — not for `width`, `height`, or image sizes.

```svelte
<!-- ✅ Space between elements -->
<div class="gap-7 p-4">...</div>

<!-- ❌ Size defined with spacing unit -->
<img class="h-9 w-9" />
<!-- use explicit dimensions instead -->
```

---

## Responsive spacing

Spacing units can vary across breakpoints using Tailwind's responsive prefixes:

```svelte
<div class="p-4 md:p-7">...</div><section class="gap-6 md:gap-9">...</section>
```

---

## One unit at a time

Never add two units together to reach a value not in the scale. If a size isn't in the scale, use the nearest unit.

```svelte
<!-- ❌ Stacking units to reach 24px -->
<div class="p-4 pt-2">...</div>

<!-- ✅ Use the correct single unit -->
<div class="p-6">...</div>
```
