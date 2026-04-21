---
name: gtm-events
description: Push custom events to the GTM `dataLayer` and understand the standard data-layer fields populated by route `layer` objects. Use when adding analytics tracking (clicks, form submits, custom interactions), working with `GTM.svelte`, or extending the `layer` schema. Covers event shape, naming, timing (before/after navigation), and standard fields.
---

# GTM events — `dataLayer` usage

GTM loads via `src/components/GTM.svelte` only when `PUBLIC_GTM_ID` is set. The standard data layer is driven by `data.layer` from each route's `+page.server.ts`. All pushes go through the helper in `$lib/dataLayer` — never touch `window.dataLayer` directly.

A ready-to-import GTM container template lives in `scripts/GTM.json` (tags, triggers, variables, GA4 forwarding). Import it into any GTM account — account/container IDs are placeholders and get reassigned.

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

## Pushing via `$lib/dataLayer`

Two helpers, both SSR-safe (no-op when `window` is undefined) and auto-initialising `window.dataLayer`:

```ts
import { push, track } from '$lib/dataLayer';

// Named event with a payload
track('click_cta', { cta_id: 'hero_primary', cta_label: 'Subscribe' });

// Arbitrary payload without an `event` field (app-init metadata, etc.)
push({ 'app.version': '1.2.3', 'app.platform': 'web' });
```

The helper also **normalises `content.id` to a string** — GTM matches variables by string, so numeric IDs from the API would otherwise silently miss lookups.

Rules:

- **Never write `window.dataLayer.push(...)` directly.** Use `track` or `push`.
- `event` is the reserved key (always in `snake_case`).
- All other keys are free-form, but **stay consistent** across the app. Define a small taxonomy (e.g. `cta_id`, `cta_label`, `form_name`) and reuse it.
- Keep payloads small. GTM truncates oversized events silently on some accounts.

---

## Where to push — `$lib/dataLayer` handles SSR

The helper short-circuits on the server, so you can call `track` / `push` from any context without guards:

```svelte
<script>
  import { track } from '$lib/dataLayer';
  $effect(() => {
    track('article_view', { article_id: data.scope.data.id });
  });
</script>
```

`$effect` itself also runs client-only after hydration, so the combination is doubly safe.

---

## Event timing

- **On mount / page view** → `$effect` at component level.
- **On user action** (click, submit) → inline handler in the event listener.
- **Before navigation** (outgoing click) → use the SvelteKit `beforeNavigate` helper; the push runs synchronously before the page unloads.

```svelte
<script>
  import { beforeNavigate } from '$app/navigation';
  import { track } from '$lib/dataLayer';

  beforeNavigate(({ to }) => {
    track('link_click', { to: to?.url.pathname });
  });
</script>
```

---

## Naming conventions

| Event type           | Recommended `event` value                 | Where it fires                                               |
| -------------------- | ----------------------------------------- | ------------------------------------------------------------ |
| Page view            | `pageview`                                | `GTM.svelte` on every nav, routes after infinite-scroll load |
| Infinite scroll load | `infinite_scroll`                         | `Pagination.svelte` (auto-load via inview)                   |
| "Load more" click    | `load_more_click`                         | `Pagination.svelte` (manual click)                           |
| CTA / link click     | `click_cta`, `click_link`                 | component-level                                              |
| Form interaction     | `form_submit`, `form_start`, `form_error` | form components                                              |
| Search               | `search_submit`, `search_result_click`    | `/search` route                                              |
| Scroll depth         | `scroll_depth`                            | global listener                                              |
| Media playback       | `video_play`, `video_complete`            | `Post/Elements/Video.svelte`                                 |
| Outbound link        | `outbound_click`                          | global `beforeNavigate` guard                                |
| File download        | `file_download`                           | link click handler                                           |

Stick to this list unless you have a reason to diverge. Custom event names spread fast and become impossible to clean up later.

### Event-pair pattern (intent + completion)

`load_more_click` / `infinite_scroll` fire **at intent** (before the async load starts), carrying the `page.index` of the page about to be loaded. The subsequent `pageview` fires **at completion** (after the load resolves) with the same `page.index`. Analysts can:

- Count engagements via intent events
- Count successful content loads via pageviews
- Derive load-failure rate as `intent − pageview` for the same index

Don't merge the two events into one "page loaded" signal — the pairing is the insight.

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
