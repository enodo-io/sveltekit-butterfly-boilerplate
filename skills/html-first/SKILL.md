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
└─ Need to trigger any of the above declaratively?
    └─ → commandfor + command (Invoker API)
        fallback: popovertarget (popover) or JS .showModal() (dialog)
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

Before writing a JS-driven toggle component:

- [ ] Is it a modal/confirmation? → `<dialog>`
- [ ] Is it a menu/dropdown/tooltip? → `popover`
- [ ] Is it an accordion/FAQ? → `<details>/<summary>`
- [ ] Can the trigger be declarative? → `popovertarget` or `commandfor`
- [ ] Is JS only adding what CSS/HTML genuinely can't do?
