---
name: svelte5-runes
description: Write Svelte 5 components using Runes. Use whenever creating or modifying a `.svelte` file. Enforces `$state`, `$derived`, `$effect`, `$props`, snippets, and event-handler syntax; forbids Svelte 4 legacy patterns (`export let`, `$:`, stores for local state, `on:click`).
---

# Svelte 5 — Runes conventions

The entire project is Svelte 5. **Never write Svelte 4 syntax.** When in doubt, read an existing component (e.g. `src/components/Pagination.svelte`, `src/components/Feed.svelte`) before writing a new one.

## Reactive primitives

| Rune        | Purpose                                                       |
| ----------- | ------------------------------------------------------------- |
| `$state`    | Reactive value — mutations trigger re-renders                 |
| `$derived`  | Computed value from other state                               |
| `$effect`   | Side effect when dependencies change (client-only by default) |
| `$props`    | Component props (replaces `export let`)                       |
| `$bindable` | Two-way bindable prop                                         |
| `$host`     | Web component host (rarely needed)                            |

---

## Props — `$props`

```svelte
<script lang="ts">
  type Props = {
    current: number;
    max: number;
    url?: (page: number) => string;
    label?: string;
    onload?: () => Promise<boolean>;
    infiniteScroll?: boolean;
  };

  let {
    current,
    max,
    url = (page) => `/?page=${page}`,
    label = 'Load more',
    onload,
    infiniteScroll = false,
  }: Props = $props();
</script>
```

Rules:

- **Declare a `Props` type** at the top. Destructure inside `$props()`.
- **Defaults go in the destructure**, not as `export let x = value`.
- **No `export let`**. Ever.

---

## State — `$state`

```svelte
<script>
  let count = $state(0);
  let user = $state({ name: 'Ada', age: 36 });

  function increment() {
    count += 1; // direct mutation is reactive
    user.age += 1; // deep mutation is reactive (proxy)
  }
</script>
```

Use `$state.raw(value)` when you need a non-proxied plain value (large arrays, objects mutated frequently).

---

## Derived — `$derived` / `$derived.by`

```svelte
<script>
  let pageSize = $state(10);
  let total = $state(100);
  let pageCount = $derived(Math.ceil(total / pageSize));

  // Complex derivations:
  let visiblePages = $derived.by(() => {
    const pages = [];
    // ...
    return pages;
  });
</script>
```

- `$derived(expr)` for simple one-liners.
- `$derived.by(() => { ... })` for multi-line logic.

Never declare a derived value with `let` + `$effect` — always use `$derived`.

---

## Effects — `$effect`

```svelte
<script>
  import { page } from '$app/state';

  $effect(() => {
    // Runs on mount and whenever `page.url` changes.
    window.dataLayer?.push({ event: 'page_view', url: page.url.pathname });
  });

  // Cleanup:
  $effect(() => {
    const id = setInterval(() => ..., 1000);
    return () => clearInterval(id);
  });
</script>
```

- Runs **client-side only** (after hydration).
- Dependencies are tracked automatically from what you read synchronously.
- Return a cleanup function when you need teardown.
- Use `$effect.pre(() => ...)` to run **before** DOM updates (rare).

---

## Event handlers — property form, not `on:`

```svelte
<!-- ✅ Svelte 5 -->
<button onclick={handleClick}>Click</button>
<input oninput={(e) => (value = e.currentTarget.value)} />

<!-- ❌ Svelte 4 — do not use -->
<button on:click={handleClick}>Click</button>
<input on:input={...} />
```

No directive modifiers (`|once`, `|preventDefault`). Write the behaviour in the handler:

```svelte
<form
  onsubmit={(e) => {
    e.preventDefault();
    submit();
  }}
>
  …
</form>
```

Once-only: track a boolean in state.

---

## Snippets — replaces slots

```svelte
<!-- ChildWithSnippet.svelte -->
<script>
  import type { Snippet } from 'svelte';
  let { header, children }: { header?: Snippet; children: Snippet } = $props();
</script>

{#if header}{@render header()}{/if}
<main>{@render children()}</main>
```

```svelte
<!-- Parent -->
<ChildWithSnippet>
  {#snippet header()}<h1>Title</h1>{/snippet}
  <p>Body content goes in the default children snippet.</p>
</ChildWithSnippet>
```

- `{@render snippet()}` instead of `<slot />`.
- Pass args: `{@render row({ item })}` and define with `{#snippet row({ item })}`.

---

## Two-way binding — `$bindable`

```svelte
<!-- Input.svelte -->
<script>
  let { value = $bindable('') }: { value?: string } = $props();
</script>

<input bind:value={value} />
```

```svelte
<!-- Parent -->
<Input bind:value={name} />
```

Only mark a prop bindable if the child needs to update it. Most props don't.

---

## Stores — only for cross-component shared state

`writable`/`readable` stores still work for genuinely shared global state (auth session, toast queue). For **component-local** state, use `$state`. Don't import stores to avoid `$state`.

Accessing `$app/state` (SvelteKit):

```svelte
<script>
  import { page } from '$app/state'; // Svelte 5 runes-mode SvelteKit state

  $effect(() => {
    console.log(page.url.pathname);
  });
</script>
```

Not `$app/stores` — that's the legacy store version.

---

## TypeScript

Always write `<script lang="ts">`. Type props via a local `Props` type. Type children / snippets with `Snippet` from `svelte`.

---

## What NOT to do

- `export let foo` → use `$props`
- `$: foo = bar * 2` → use `$derived`
- `$: { sideEffect(); }` → use `$effect`
- `on:click={...}` → use `onclick={...}`
- `<slot />` → use `{@render children()}`
- `let items = []; items.push(x); items = items;` — Runes don't need reassignment; proxies track mutations.
- `import { writable } from 'svelte/store'` for local state → use `$state`.

---

## Reading existing code

Reference components that show every pattern:

- `src/components/Pagination.svelte` — props, state, derived, event handlers
- `src/components/Feed.svelte` — streaming promises, snippets
- `src/components/Layout/Header.svelte` — `$effect`, popover API, body lock
- `src/components/Dialog.svelte` — `<dialog>` + bindable open prop

When modifying any `.svelte` file, skim the closest peer first — the project patterns are consistent.
