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
npm run test:unit    # Vitest (all unit + browser specs)
npm run test:e2e     # Playwright
npm run test         # Both sequentially
```

The `Stop` hook also runs `vitest run` on every response, so tests must pass to avoid spam.

---

## Where existing specs live

- `src/lib/getMediaUrl.spec.ts` — pure unit test on a lib utility
- `src/lib/stripScripts.spec.ts` — input/output assertions on string transforms
- `src/lib/JsonLD/Organization.spec.ts` — schema generator output shape
- `src/lib/JsonLD/generateJsonLd.spec.ts` — schema dispatcher behaviour

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
    const screen = render(MyCard, { props: { title: 'Hello' } });
    const heading = screen.getByRole('heading', { level: 3 });
    await expect.element(heading).toHaveTextContent('Hello');
  });
});
```

Browser mode runs real Chromium via Playwright. Prefer this over `@testing-library/svelte` — it catches real CSS / DOM issues.

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

Tests run with the `.env` loaded by Vite. For deterministic tests, override in the test file:

```ts
import.meta.env.PUBLIC_BASE_URL = 'https://test.example';
```

Or use `.env.test` (already supported by `.gitignore` exception).

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
