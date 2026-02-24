---
name: html-first
description: Enforce the HTML-first principle: always reach for native HTML APIs before writing JavaScript. Use when building any interactive UI — menus, dropdowns, modals, confirmations, accordions, tooltips, or any component that shows/hides or responds to user interaction.
---

# HTML-first: native APIs before JavaScript

## The principle

Before writing a single line of JavaScript for an interactive component, ask:
**"Does the browser already solve this natively?"**

Native HTML APIs give you accessibility, keyboard navigation, focus management, and ARIA semantics for free. Rolling your own with `<div>` + state + event listeners means reimplementing all of that — poorly.

JavaScript is for **progressive enhancement** of a solid HTML base, not a replacement for it.

---

## Popover API — menus, dropdowns, tooltips

Use `popover` + `popovertarget` for anything that toggles open/closed over other content.

```html
<!-- Trigger: no JS needed to open/close -->
<button popovertarget="main-menu" aria-label="Open navigation">Menu</button>

<!-- Panel -->
<div id="main-menu" popover>
  <nav>...</nav>
</div>
```

What you get for free:

- Toggle on click
- Close on Escape
- Close on click outside (`popover="auto"`, the default)
- Light-dismiss behaviour
- `::backdrop` pseudo-element for overlay styling

**Style open/closed state in CSS — no class toggling needed:**

```css
#main-menu {
  opacity: 0;
  transition:
    opacity 200ms,
    display 200ms allow-discrete;
}

#main-menu:popover-open {
  opacity: 1;

  @starting-style {
    opacity: 0; /* entry animation */
  }
}
```

**Then enrich with JS only for what CSS can't do:**

```js
// Lock body scroll when open (the project's Header.svelte does this)
menuEl.addEventListener('toggle', (e) => {
  document.body.style.overflow = e.newState === 'open' ? 'hidden' : '';
});

// Close on SPA navigation
navigating.subscribe(() => menuEl.hidePopover());
```

This is exactly how `src/components/Layout/Header.svelte` works:

- `popovertarget="menu"` on the burger button → declarative open/close
- `toggle` event listener → tracks state for the JS-driven features (body lock, icon swap, close on navigate)

---

## `<dialog>` — modals and confirmations

Use `<dialog>` for anything that blocks interaction with the rest of the page.

```html
<dialog id="confirm-delete">
  <h2>Delete this article?</h2>
  <p>This action cannot be undone.</p>
  <form method="dialog">
    <!-- `method="dialog"` closes the dialog and sets returnValue -->
    <button value="cancel">Cancel</button>
    <button value="confirm">Delete</button>
  </form>
</dialog>

<button onclick="document.getElementById('confirm-delete').showModal()">Delete</button>
```

What you get for free:

- Focus trap (keyboard stays inside the dialog)
- Escape to close
- `::backdrop` for the overlay
- `aria-modal` semantics
- Return value via `<form method="dialog">`

```js
// Read the return value after close
dialog.addEventListener('close', () => {
  if (dialog.returnValue === 'confirm') doDelete();
});
```

---

## HTML Invoker Commands — declarative triggering

The Invoker API (`commandfor` + `command`) is the evolution of `popovertarget`: it works with both `<dialog>` and `popover` from a single unified attribute.

```html
<!-- Open a modal dialog declaratively — zero JS -->
<button commandfor="my-dialog" command="show-modal">Open</button>
<dialog id="my-dialog">
  <p>Hello!</p>
  <button commandfor="my-dialog" command="close">Close</button>
</dialog>

<!-- Toggle a popover declaratively -->
<button commandfor="my-tooltip" command="toggle-popover">Help</button>
<div id="my-tooltip" popover>Tooltip content</div>
```

Built-in `command` values:

- `"show-modal"` / `"close"` — for `<dialog>`
- `"toggle-popover"` / `"show-popover"` / `"hide-popover"` — for `popover` elements
- `"request-close"` — politely requests the dialog to close (respects `beforetoggle` cancellation)

> **Browser support (Feb 2026):** Chrome 135+, Safari 18.4+. Use `popovertarget` as the fallback for `popover` elements today; it is universally supported. For `<dialog>`, fall back to calling `.showModal()` from JS.

---

## `<details>` / `<summary>` — accordions and FAQ

Never build an accordion with `<div>` + JS toggle. Use the native disclosure widget.

```html
<details>
  <summary>What is the return policy?</summary>
  <p>You can return any item within 30 days of purchase.</p>
</details>
```

Animate with CSS only:

```css
details[open] > :not(summary) {
  animation: slide-down 250ms ease;
}

@keyframes slide-down {
  from {
    opacity: 0;
    transform: translateY(-0.5rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

## `<datalist>` — native autocomplete

Never reimplement a suggestions field in JS. `<datalist>` works with any `<input>` via the `list` attribute.

```html
<label for="framework">Framework</label>
<input id="framework" list="frameworks" name="framework" autocomplete="off" />
<datalist id="frameworks">
  <option value="SvelteKit"></option>
  <option value="Nuxt"></option>
  <option value="Remix"></option>
  <option value="Astro"></option>
</datalist>
```

What you get for free:

- Filtered suggestion dropdown as the user types
- Keyboard navigation (arrows, Enter, Escape)
- Works with any input type (`text`, `email`, `url`, `search`…)
- Free-form value allowed (not a strict `<select>`)

---

## `hidden="until-found"` — hidden but searchable

Unlike plain `hidden`: the browser can automatically reveal the content if the user finds it via Ctrl+F or an anchor link `#id`.

```html
<!-- Visually hidden, but Ctrl+F can find and reveal it -->
<div hidden="until-found" id="section-advanced">
  <h2>Advanced settings</h2>
  <p>...</p>
</div>

<!-- An anchor link also triggers the reveal -->
<a href="#section-advanced">Jump to advanced settings</a>
```

Ideal use cases:

- Accordions whose content must remain indexable and searchable
- Collapsed sections on long pages
- FAQ where users may search for a specific answer

> **Note:** when the browser reveals content, the `beforematch` event fires — listen to it for logging or animations, without owning the reveal logic.

---

## `inert` — disable interactivity without JS

The `inert` attribute makes an entire section non-interactive, non-focusable, and invisible to assistive technologies — without touching CSS or JS state.

```html
<!-- Sidebar disabled during loading -->
<aside inert>
  <nav>...</nav>
</aside>

<!-- Form disabled until terms are accepted -->
<form inert="{!termsAccepted}">...</form>
```

What `inert` does:

- Disables all clicks, focus, and keyboard events
- Removes content from the tab order
- Hides from screen readers (implicit `aria-hidden`)
- Does not affect visual rendering (add `opacity: 0.5` separately if needed)

Prefer `inert` over `pointer-events: none` + `tabindex="-1"` + `aria-hidden="true"` on every child.

---

## Native form validation — zero JS

The browser validates natively before submission. No validation library needed.

```html
<form>
  <!-- Required field -->
  <input type="text" required />

  <!-- Email format -->
  <input type="email" required />

  <!-- HTTPS URLs only -->
  <input type="url" pattern="https://.*" title="URL must start with https://" />

  <!-- Number within a range -->
  <input type="number" min="1" max="100" step="1" />

  <!-- Minimum length -->
  <input type="text" minlength="3" maxlength="50" />

  <!-- Custom regex -->
  <input type="text" pattern="[A-Za-z]{3,}" title="Letters only, minimum 3" />

  <button type="submit">Submit</button>
</form>
```

Style validation states in pure CSS:

```css
input:invalid {
  border-color: red;
}

/* Only show error after the user has interacted (not on initial load) */
input:user-invalid {
  border-color: red;
}

input:valid {
  border-color: green;
}
```

> **`:user-invalid`** (vs `:invalid`): only activates after the user has attempted to fill the field, avoiding red errors on initial render.

---

## CSS `:has()` — parent state styling

`:has()` lets you style a parent based on the state of its children — replacing entire swaths of JS class-toggling.

```css
/* Disable submit when form is invalid */
form:has(input:invalid) button[type='submit'] {
  opacity: 0.5;
  pointer-events: none;
}

/* Highlight a card when its checkbox is checked */
.card:has(input[type='checkbox']:checked) {
  outline: 2px solid var(--color-accent);
}

/* Float a label when the input has content */
.field:has(input:not(:placeholder-shown)) label {
  transform: translateY(-1.5rem);
  font-size: 0.75rem;
}

/* Adjust grid layout when a card contains an image */
.card:has(img) {
  grid-template-rows: auto 1fr;
}
```

Prefer `:has()` over any JS that adds/removes classes to reflect child state on a parent.

---

## CSS Anchor Positioning — tooltips and dropdowns without JS

Position an element relative to another without measuring the DOM in JS. Replaces `getBoundingClientRect()` + manual position math.

```html
<button id="help-btn" popovertarget="help-tip">?</button>
<div id="help-tip" popover>Tooltip content</div>
```

```css
#help-btn {
  anchor-name: --help-btn;
}

#help-tip {
  position: fixed;
  position-anchor: --help-btn;

  /* Position below the button, horizontally centered */
  top: anchor(bottom);
  left: anchor(center);
  translate: -50% 0.5rem;

  /* Flip above if not enough space below */
  position-try-fallbacks: flip-block;
}
```

Useful `anchor()` values:

| Value            | Meaning                       |
| ---------------- | ----------------------------- |
| `anchor(top)`    | Top edge of the anchor        |
| `anchor(bottom)` | Bottom edge of the anchor     |
| `anchor(left)`   | Left edge of the anchor       |
| `anchor(right)`  | Right edge of the anchor      |
| `anchor(center)` | Horizontal or vertical center |

> **Browser support (Feb 2026):** Chrome 125+, Edge 125+. Not yet Safari. Use as progressive enhancement — provide a fixed `top`/`left` fallback.

---

## CSS animations without JS — `@starting-style` and `allow-discrete`

Animate elements appearing and disappearing from `display: none` without any JS.

```css
/* Any popover or dialog */
[popover],
dialog {
  opacity: 0;
  transform: translateY(-0.5rem);
  transition:
    opacity 200ms ease,
    transform 200ms ease,
    display 200ms allow-discrete,
    /* enables animating from/to display:none */ overlay 200ms allow-discrete; /* enables exit animation from the top layer */
}

/* Open state */
[popover]:popover-open,
dialog[open] {
  opacity: 1;
  transform: translateY(0);

  /* Entry animation: initial state before the transition plays */
  @starting-style {
    opacity: 0;
    transform: translateY(-0.5rem);
  }
}
```

Rules:

- **`@starting-style`**: defines the CSS state _before_ the element enters the DOM or becomes visible — it's the "from" of the entry animation.
- **`allow-discrete`**: required for non-interpolable properties (`display`, `visibility`, `overlay`) — without it, the transition is skipped entirely.
- No `classList.add('is-animating')`, no `setTimeout` to wait for an animation before hiding.

---

## Decision tree

```
Need to show/hide something?
│
├─ Blocks all interaction (confirmation, modal image, form)?
│   └─ → <dialog> + showModal()
│
├─ Floats over content, light-dismissable (menu, dropdown, tooltip)?
│   └─ → popover API
│
├─ Inline toggle, part of document flow (FAQ, accordion)?
│   └─ → <details> / <summary>
│
├─ Content hidden but searchable (Ctrl+F, anchor links)?
│   └─ → hidden="until-found"
│
└─ Need to trigger any of the above declaratively?
    └─ → commandfor + command (Invoker API)
        fallback: popovertarget (popover) or JS .showModal() (dialog)

Need suggestions / autocomplete?
└─ → <datalist> + list attribute

Need to disable a section entirely?
└─ → inert attribute

Need to validate user input?
└─ → type, required, pattern, min/max, minlength/maxlength

Need to style a parent based on child state?
└─ → CSS :has()

Need to position an element relative to another?
└─ → CSS anchor positioning (anchor-name + position-anchor)

Need to animate appearance/disappearance of display:none elements?
└─ → @starting-style + transition-behavior: allow-discrete
```

---

## What JS is legitimately for (progressive enhancement)

Once the HTML base works, JS can enrich it:

| Behaviour              | HTML base                      | JS enhancement                              |
| ---------------------- | ------------------------------ | ------------------------------------------- |
| Burger menu open/close | `popover`                      | Lock body scroll, close on navigate         |
| Modal close            | `<dialog>` + `method="dialog"` | Read `returnValue`, async actions           |
| Accordion              | `<details>`                    | Collapse siblings (accordion group)         |
| Dropdown               | `popover`                      | Keyboard arrow navigation, focus first item |

---

## Quick checklist

Before writing any JS for UI interaction:

- [ ] Is it a modal/confirmation? → `<dialog>`
- [ ] Is it a menu/dropdown/tooltip? → `popover`
- [ ] Is it an accordion/FAQ? → `<details>/<summary>`
- [ ] Is it hidden content that should be searchable? → `hidden="until-found"`
- [ ] Is it a suggestions/autocomplete field? → `<datalist>`
- [ ] Is it disabling a section? → `inert`
- [ ] Is it validating user input? → `type`, `required`, `pattern`, `min`/`max`
- [ ] Is it styling based on child state? → CSS `:has()`
- [ ] Is it positioning relative to another element? → CSS anchor positioning
- [ ] Is it animating show/hide? → `@starting-style` + `allow-discrete`
- [ ] Can the trigger be declarative? → `popovertarget` or `commandfor`
- [ ] Is JS only adding what CSS/HTML genuinely can't do?
