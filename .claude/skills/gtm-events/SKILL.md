---
name: gtm-events
description: Push custom events to the GTM `dataLayer` and understand the standard data-layer fields populated by route `layer` objects. Use when adding analytics tracking (clicks, form submits, custom interactions), working with `GTM.svelte`, or extending the `layer` schema. Covers event shape, naming, timing (before/after navigation), and standard fields.
---

# GTM events — `dataLayer` usage

GTM loads via `src/components/GTM.svelte` only when `PUBLIC_GTM_ID` is set. The standard data layer is driven by `data.layer` from each route's `+page.server.ts`. Custom events push directly to `window.dataLayer`.

## Standard data-layer fields (auto-populated)

Every navigation pushes these (defined in `App.PageData.layer`, plus app-level fields):

**App scope** — set once at load:

- `app.version` — package version + git commit
- `app.platform` — Node.js platform
- `app.env` — environment name

**Page scope** — per navigation:

- `page.index` — current pagination page
- `page.query` — search query

**Content scope** — per navigation:

- `content.type` — `home | articles | post | page | author | category | tag | search` (required)
- `content.id` — resource id
- `content.group` — group/category
- `content.tags` — array of tag names
- `content.flags` — array of flag strings

These are populated by each route via its `layer` object (see `route-server` skill).

---

## Pushing a custom event

```ts
window.dataLayer.push({
  event: 'click_cta',
  cta_id: 'hero_primary',
  cta_label: 'Subscribe',
});
```

Rules:

- `event` is the only reserved key — name it in `snake_case`.
- All other keys are free-form, but **stay consistent** across the app. Define a small taxonomy (e.g. `cta_id`, `cta_label`, `form_name`) and reuse it.
- Keep payloads small. GTM truncates oversized events silently on some accounts.

---

## Where to push — SSR-safe

`window.dataLayer` only exists client-side. Wrap pushes:

```ts
if (typeof window !== 'undefined') {
  window.dataLayer?.push({ event: '...' });
}
```

Inside a Svelte component with Runes, `$effect` already runs client-side only:

```svelte
<script>
  $effect(() => {
    window.dataLayer?.push({ event: 'article_view', article_id: data.scope.data.id });
  });
</script>
```

---

## Event timing

- **On mount / page view** → `$effect` at component level.
- **On user action** (click, submit) → inline handler in the event listener.
- **Before navigation** (outgoing click) → use the SvelteKit `beforeNavigate` helper; push synchronously so the event fires before the page unloads.

```svelte
<script>
  import { beforeNavigate } from '$app/navigation';

  beforeNavigate(({ to }) => {
    window.dataLayer?.push({ event: 'link_click', to: to?.url.pathname });
  });
</script>
```

---

## Naming conventions

| Event type       | Recommended `event` value                 |
| ---------------- | ----------------------------------------- |
| Page view        | Auto via `layer` — no custom event needed |
| CTA / link click | `click_cta`, `click_link`                 |
| Form interaction | `form_submit`, `form_start`, `form_error` |
| Search           | `search_submit`, `search_result_click`    |
| Scroll depth     | `scroll_depth`                            |
| Media playback   | `video_play`, `video_complete`            |
| Outbound link    | `outbound_click`                          |
| File download    | `file_download`                           |

Stick to this list unless you have a reason to diverge. Custom event names spread fast and become impossible to clean up later.

---

## Extending `App.PageData.layer`

If you add a new standard field:

1. **Extend the type** in `src/app.d.ts` (`App.PageData.layer`).
2. **Populate it** from the relevant `+page.server.ts` load functions.
3. **Document it** in the README's "Data Layer" section.
4. **Match GTM variables** — ping the analytics owner before shipping, or the field won't appear in tags.

---

## Debugging

- GTM Preview mode (Tag Assistant) shows every dataLayer push in real time.
- In the console: `window.dataLayer` is a plain array — inspect it directly.
- Missing events usually mean `PUBLIC_GTM_ID` isn't set. Check `.env`.

---

## Common mistakes

- Pushing before `GTM.svelte` initialises → the event is lost. Wrap early pushes in a short `$effect` — GTM's async loader eventually drains.
- Forgetting the SSR guard → hydration error on first render.
- Pushing the full API response — PII risk + payload size. Send ids and labels, not objects.
- Adding a new field to `layer` without updating `App.PageData` → TS won't catch missing fields on other routes.
