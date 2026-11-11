---
name: testing
description: Write and organise tests for the boilerplate — Vitest for unit/browser tests and Playwright for e2e. Use when adding tests for a lib utility, a Svelte component, or an end-to-end flow. Covers file conventions (`*.spec.ts`), browser mode via `vitest-browser-svelte`, Playwright configuration, and what belongs in each layer.
---

# Testing — unit + browser + e2e

Three layers, each with a purpose:

| Layer   | Tool                                       | File location      | Good for                            |
| ------- | ------------------------------------------ | ------------------ | ----------------------------------- |
| Unit    | Vitest                                     | `src/**/*.spec.ts` | Pure functions, lib utilities       |
| Browser | Vitest (browser) + `vitest-browser-svelte` | `src/**/*.spec.ts` | Svelte components, DOM interactions |
| E2E     | Playwright                                 | `e2e/**/*.test.ts` | Full-route flows, multi-page        |

## Commands

```bash
npm run test:unit      # Vitest (all unit + browser specs)
npm run test:e2e       # Playwright (all e2e, builds and serves the app on :4173)
npm run test:quality   # Playwright, e2e/quality.test.ts only
npm run test           # unit (--run) then e2e
npm run budget         # performance budget of the last build (after npm run build)
```

The e2e suites read the real API of `.env` (`PUBLIC_API_URL`, `PUBLIC_API_KEY`): no `.env`, no e2e. `playwright.config.ts` runs `npm run build && npm run preview` (reused locally when already running).

The `Stop` hook also runs `svelte-check` and `vitest run` on every response, so tests must pass to avoid spam. The pre-commit hook (`.githooks/pre-commit`) runs `npm run lint` (Prettier + ESLint, including the semantic HTML rules) and `npm run check`.

---

## Quality gate

### `e2e/quality.test.ts` (`npm run test:quality`)

On pages picked from the API: home, `/articles`, `/tags`, `/authors`, `/rss.html`, a search, the first and the deepest category, a tag, an author, the static pages, the post using the most block types (« kitchen sink ») and another post.

1. **html-validate** (`recommended` + `a11y` presets, formatting rules off) on the raw SSR HTML: flow content in `<a>`/`<button>`, list children, unknown elements, missing `alt` / iframe `title` / button `type`, unnamed landmarks, duplicate ids…
2. **SEO head contract**: canonical absolute and equal to `og:url`; absolute `og:image`; `max-image-preview:large` unless noindex; `twitter:card`; a meta description; no `og:article:*`; every JSON-LD block parses; exactly one `h1`; no heading level skip; at most one `img[fetchpriority="high"]`.
3. **axe-core** (WCAG 2.0/2.1/2.2 A+AA + best practices) after hydration, then with the mobile menu open (390px) and the gallery media viewer open. Third-party content is excluded (iframes, `.post--embed`, X/TikTok/Instagram/Facebook widgets).

A new route that lists or renders content is added to the `pages` list of `beforeAll`.

### `scripts/check-budget.js` (`npm run budget`, after `npm run build`)

| Budget                                               | Limit       |
| ---------------------------------------------------- | ----------- |
| first-load JS per route (entry + root layout + route node and their static imports, gzip) | 72 kB  |
| main CSS (gzip)                                      | 12 kB       |
| font files in the build                              | 30          |

Exit 1 when exceeded: a dependency imported at the top of a page, Sentry back in the entry, every font weight again… Raise a budget only on purpose, in the script, with the reason.

### ESLint (`eslint.config.js`, `.svelte` files)

`svelte/button-has-type`, `svelte/no-target-blank`, vague anchor texts (« read more », « lire la suite »…), `href="#"` / empty `href`. See `seo-links`.

### CI — `.github/workflows/quality.yml`

On push to `master` and on pull requests: `lint`, `check`, `test:unit --run`, `build`, `budget` (with `.env.example` as `.env`); then the whole e2e suite (`npm run test:e2e`, quality gate included) on the demo API **only when the `DEMO_API_KEY` repository secret is set** (it is written as `PUBLIC_API_KEY`); without it the e2e job is skipped.

---

## Where existing specs live

- `src/lib/getMediaUrl.spec.ts`, `imageWidths.spec.ts` — pure unit tests on lib utilities
- `src/lib/stripScripts.spec.ts`, `embedHtml.spec.ts` — input/output assertions on string transforms
- `src/lib/links.spec.ts`, `seo.spec.ts`, `postOutline.spec.ts` — link classification, `absoluteUrl` / `metaDescription`, heading outline
- `src/lib/server/pageParam.spec.ts`, `cacheTags.spec.ts`, `markdown.spec.ts`, `sitemapCache.spec.ts` — server helpers (`$env/*` mocked with `vi.mock` / `vi.doMock` where they read it)
- `src/lib/JsonLD/Organization.spec.ts`, `VideoObject.spec.ts` — schema generator output shape
- `src/lib/JsonLD/generateJsonLd.spec.ts` — schema dispatcher behaviour
- `e2e/routes/*.test.ts` — one file per route; `e2e/helpers/` (API pickers, SEO and a11y checks)

Use these as reference for new specs.

---

## Unit tests — pure functions

```ts
// src/lib/myUtil.spec.ts
import { describe, it, expect } from 'vitest';
import { myUtil } from './myUtil';

describe('myUtil', () => {
  it('returns the right value for a typical input', () => {
    expect(myUtil('hello')).toBe('HELLO');
  });

  it('handles empty input', () => {
    expect(myUtil('')).toBe('');
  });
});
```

Keep unit tests **fast** (<50ms each) and **isolated** (no fetch, no file I/O). Mock via `vi.mock` only when necessary.

---

## Component tests — `vitest-browser-svelte`

```ts
// src/components/MyCard.spec.ts
import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import MyCard from './MyCard.svelte';

describe('MyCard', () => {
  it('renders the title as an h3', async () => {
    const screen = await render(MyCard, { props: { title: 'Hello' } });
    const heading = screen.getByRole('heading', { level: 3 });
    await expect.element(heading).toHaveTextContent('Hello');
  });
});
```

Browser mode runs real Chromium via Playwright: the provider is the `@vitest/browser-playwright` package (`provider: playwright()` in `vite.config.ts`), `render` is async (Vitest 5, vitest-browser-svelte 3) and the `page` locators come from `vitest/browser`. Prefer this over `@testing-library/svelte` — it catches real CSS / DOM issues. Locators match text exactly by default; pass `{ exact: false }` for a partial match.

---

## E2E tests — Playwright

Tests live in `e2e/` (see `playwright.config.ts`). Typical shape:

```ts
// e2e/home.test.ts
import { test, expect } from '@playwright/test';

test('home page shows featured article', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});
```

Run one file: `npx playwright test e2e/home.test.ts`.

---

## What to test at which layer

| Change type                | Tests to add/update                          |
| -------------------------- | -------------------------------------------- |
| New lib utility            | Unit spec next to the file                   |
| New JSON-LD schema         | Unit spec in `src/lib/JsonLD/`               |
| New Svelte component       | Browser spec (`vitest-browser-svelte`)       |
| New route / flow           | Playwright e2e test                          |
| Bug fix                    | Regression test at the appropriate layer     |
| New lib helper on a route path (pagination, URLs, links) | Unit spec + the e2e route test |
| New page type / template  | Add it to the pages of `e2e/quality.test.ts` |
| New dependency on the client | `npm run build && npm run budget`     |
| Design-system rule (skill) | **Not testable by tests** — enforced by hook |

---

## Mocking the Butterfly API

For component or e2e tests that touch `$lib/api`, mock at the module boundary:

```ts
import { vi } from 'vitest';

vi.mock('$lib/api', () => ({
  default: {
    get: vi.fn().mockResolvedValue({
      data: [
        /* fixtures */
      ],
      included: [],
      links: {},
      meta: {},
    }),
  },
}));
```

Keep fixtures small and focused. Don't ship real API responses as test data — they become stale and inflate the repo.

---

## `PUBLIC_*` env vars in tests

Unit specs don't depend on the `.env`: mock the `$env` module the code imports, then import the module under test (see `links.spec.ts`, `cacheTags.spec.ts`):

```ts
vi.mock('$env/static/public', () => ({ PUBLIC_BASE_URL: 'https://www.site.test' }));
const { contentLink } = await import('./links');
```

`vi.resetModules()` + `vi.doMock()` when one spec needs several values (module-level constants are read at import).

---

## Naming

- Spec files next to their source: `foo.ts` ↔ `foo.spec.ts`.
- One spec file per source file.
- Describe block = module / component name; test names = sentence fragments describing behaviour.

---

## What NOT to do

- Don't test implementation details (private helpers, internal state). Test the public surface.
- Don't write e2e tests for logic that a unit test can cover — e2e is slow.
- Don't share state across tests. Each test should set up and tear down its own fixtures.
- Don't commit flaky tests. If a test times out occasionally, fix the root cause or delete it.
- Don't skip the a11y dimension — for component tests, assert on `getByRole`, not on class names.
