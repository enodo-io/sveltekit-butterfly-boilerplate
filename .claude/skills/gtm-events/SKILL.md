---
name: gtm-events
description: Push custom events to the GTM `dataLayer` and understand the standard data-layer fields populated by route `layer` objects. Use when adding analytics tracking (clicks, form submits, custom interactions), working with `GTM.svelte`, or extending the `layer` schema. Covers event shape, naming, timing (before/after navigation), and standard fields.
---

# GTM events — `dataLayer` usage

GTM loads via `src/components/GTM.svelte` only when `PUBLIC_GTM_ID` is set. The container script is appended once the consent layer is up (`whenCmpReady` in `$lib/consent`: a TCF v2 CMP, Google's CMP, or straight away without one), so a slow first visit paints the consent banner before the tags; `gtm.js` is pushed first and the events queue in the `dataLayer` meanwhile. `withConsent(fn)` in the same module runs `fn` only after the visitor consented to the TCF purposes (never on a refusal) — use it for anything that sets cookies outside GTM. The standard data layer is driven by `data.layer` from each route's `+page.server.ts`. All pushes go through the helper in `$lib/dataLayer` — never touch `window.dataLayer` directly.

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

- `content.type` — `home | articles | post | page | author | authors | category | tag | tags | search | rss | atom | json` (required)
- `content.id` — resource id (post, page, category, tag, author pages)
- `content.taxonomy` — taxonomy slug of a term page (`tags`, from the term's `taxonomy` relationship)
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

## Butterfly tracker sink (first-party, cookieless)

`track('pageview', layer)` also sends a hit to the Butterfly tracker. On by default: the URL is derived from `PUBLIC_API_URL` (`{id}.pubbtf.eno.do` → `{id}.tbtf.eno.do`, `api{x}.site` → `t{x}.site`, see `trackerUrl()`); `PUBLIC_BUTTERFLY_TRACKER_URL` overrides it, `off` disables it. Nothing to call: every `pageview` already goes through it. Other events and `push()` never reach the tracker.

- `POST {PUBLIC_BUTTERFLY_TRACKER_URL}/h`, body `text/plain` JSON → a CORS simple request, no preflight. `navigator.sendBeacon` first, `fetch(…, { keepalive: true, credentials: 'omit' })` as fallback. Fire-and-forget: never throws, never blocks, no-op on the server.
- **Not consent-gated** (no `withConsent` / `whenCmpReady`): no cookie, no storage, no identifier, so it fits the CNIL audience-measurement exemption and counts every visit. Never add an identifier to it — that would require consent.
- **One navigation = one hit**: hits with `page.index > 1` are skipped client-side (infinite-scroll loads, `?page=N` pages are not new views; the tracker drops them too), and the same hit for the same URL twice in a row is sent once. GTM still gets every `pageview`.
- Off in dev unless `PUBLIC_BUTTERFLY_TRACKER_DEV=true`. Bots / prerender are filtered server-side.

Payload (short keys on purpose, `toHit()` in `$lib/dataLayer`):

| Key  | From layer         | Notes                                                    |
| ---- | ------------------ | -------------------------------------------------------- |
| `t`  | `content.type`     | required — sent as is (the tracker maps `tag` → term)    |
| `id` | `content.id`       | stringified, when present                                |
| `tx` | `content.taxonomy` | term pages only (`tags`)                                 |
| `pi` | `page.index`       | when present (always 1, see above)                       |
| `q`  | `page.query`       | search only                                              |
| `e`  | —                  | `1` on the first hit after a full page load (entry)      |
| `r`  | `document.referrer`| entry hit only: referrer HOSTNAME, never the full URL    |

```json
{ "t": "tag", "id": "svelte", "tx": "tags", "pi": 1 }
```

A new detail route (post, page, category, term, author) must set `content.type` + `content.id` in its `layer`; a new taxonomy also sets `content.taxonomy`.

---

## Naming conventions

| Event type           | Recommended `event` value                 | Where it fires                                               |
| -------------------- | ----------------------------------------- | ------------------------------------------------------------ |
| Page view            | `pageview`                                | `GTM.svelte` on every nav, routes after infinite-scroll load (the tracker counts the first only) |
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
