---
description: Migrate a legacy Svelte 4 component to Svelte 5 Runes (props, state, derived, effect, snippets, event handlers)
argument-hint: <file-path>
---

Migrate the Svelte 4 component at `$1` to Svelte 5 Runes syntax. Use this when pasting / vendoring external components, or when porting legacy code into the boilerplate.

**Before editing, read:**

1. `.claude/skills/svelte5-runes/SKILL.md` — the canonical rule set for this project

**Read the file first.** If it's already on Svelte 5 (uses `$props`, `$state`, no `export let`, no `$:`), report that and stop.

## Migration rules

Apply these conversions in order:

### 1. Props — `export let` → `$props`

```svelte
<!-- Before -->
<script lang="ts">
  export let title: string;
  export let count: number = 0;
  export let items: Item[] = [];
</script>

<!-- After -->
<script lang="ts">
  type Props = {
    title: string;
    count?: number;
    items?: Item[];
  };
  let { title, count = 0, items = [] }: Props = $props();
</script>
```

If any prop was used with `bind:` in a parent, wrap its default in `$bindable()`.

### 2. Reactive declarations — `$:` → `$derived` or `$effect`

**Computed values** → `$derived`:

```svelte
<!-- Before -->
$: total = price * quantity;
$: visible = items.filter((i) => i.active);

<!-- After -->
let total = $derived(price * quantity);
let visible = $derived(items.filter((i) => i.active));
```

**Side effects** → `$effect`:

```svelte
<!-- Before -->
$: {
  console.log('count changed', count);
  localStorage.setItem('count', String(count));
}

<!-- After -->
$effect(() => {
  console.log('count changed', count);
  localStorage.setItem('count', String(count));
});
```

Multi-line computed logic with branches → `$derived.by(() => { ... })`.

### 3. Local state — plain `let` → `$state`

```svelte
<!-- Before -->
let open = false;
let items = [];

<!-- After -->
let open = $state(false);
let items = $state<Item[]>([]);
```

Read-only mutations (`items = [...items, x]` reassignment) still work but are no longer needed — proxies track `items.push(x)` directly.

### 4. Event handlers — `on:X={fn}` → `onX={fn}`

```svelte
<!-- Before -->
<button on:click={handleClick}>Click</button>
<input on:input={handleInput} />
<form on:submit|preventDefault={save}>...</form>

<!-- After -->
<button onclick={handleClick}>Click</button>
<input oninput={handleInput} />
<form onsubmit={(e) => { e.preventDefault(); save(); }}>...</form>
```

Modifier directives (`|preventDefault`, `|stopPropagation`, `|once`) are removed — write the behaviour inline.

### 5. Slots — `<slot />` → snippets

```svelte
<!-- Before -->
<div class="card">
  <slot name="header" />
  <slot />
  <slot name="footer" item={currentItem} />
</div>

<!-- After -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  type Props = {
    header?: Snippet;
    children?: Snippet;
    footer?: Snippet<[Item]>;
  };
  let { header, children, footer }: Props = $props();
</script>

<div class="card">
  {#if header}{@render header()}{/if}
  {#if children}{@render children()}{/if}
  {#if footer}{@render footer(currentItem)}{/if}
</div>
```

Parent usage:

```svelte
<Card>
  {#snippet header()}<h2>Title</h2>{/snippet}
  <p>Default content</p>
  {#snippet footer(item)}<small>{item.id}</small>{/snippet}
</Card>
```

### 6. Stores for local state → `$state`

If the component uses `writable()` for purely local state, replace with `$state`. Keep stores only for **cross-component shared state** (global auth, toast queue).

### 7. `$app/stores` → `$app/state`

```svelte
<!-- Before -->
import { page } from '$app/stores';
$: console.log($page.url);

<!-- After -->
import { page } from '$app/state';
$effect(() => console.log(page.url));
```

---

## Validation

After conversion:

1. Run `npm run check` — fixes TypeScript issues.
2. Run `npm run test:unit` if the component has a spec.
3. Manually exercise the component in the browser — Runes-specific bugs (stale closures in `$effect`, missed reactivity) usually surface at interaction time.

---

## Edge cases to flag, not fix

- **Custom stores with complex subscription logic**: keep as stores; document why.
- **`tick()` calls**: still valid in Svelte 5, no change needed.
- **`onMount` / `onDestroy`**: still valid — prefer `$effect` cleanup for new code, but don't churn existing components that already use lifecycle hooks cleanly.
- **`createEventDispatcher`**: replace with callback props (`onchange={...}` convention). Ask the user before changing the public API of a component.

---

## Output

After migration, report:

- Lines changed (approx).
- Conversions applied (e.g. "3 props, 2 reactive decl → derived, 1 slot → snippet").
- Anything you flagged for user review (custom stores, public API changes).
- Whether `npm run check` is clean.
