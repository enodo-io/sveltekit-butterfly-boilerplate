# Contributing

Thanks for your interest in the Enodo SvelteKit Butterfly Boilerplate. This project is open to contributions — bug reports, documentation fixes, and pull requests are all welcome.

## Quick links

- [Issue tracker](https://github.com/enodo-io/sveltekit-butterfly-boilerplate/issues)
- [Butterfly Documentation](https://support.enodo.io/butterfly)
- [`CLAUDE.md`](./CLAUDE.md) — architectural invariants and conventions (also authoritative for human contributors)

## Before you start

1. **Read [`CLAUDE.md`](./CLAUDE.md)**. It captures the stack, the design-system rules, and the per-task skill pointers that govern this codebase. It is authoritative — if code disagrees with it, fix the code.
2. **Browse `.claude/skills/`**. Each skill is a short, focused convention document. Skills double as a style guide for human contributors.
3. **Run the project locally**. Contributing blind is risky — `npm install && npm run setup && npm run dev` takes a few minutes.

## How to propose a change

### Bug reports

Open an issue. Include:

- Reproduction steps (URL, action, expected vs actual)
- Environment (Node version, OS, browser)
- Relevant logs or screenshots

### Documentation fixes

Open a PR directly. Small doc changes don't need pre-discussion.

### Feature requests / larger changes

Open an issue first to align on scope before writing code. Changes that touch the design system, the PageData contract, or the Butterfly API client deserve a discussion.

## Pull request checklist

- [ ] Branch named `fix/...`, `feat/...`, or `docs/...`
- [ ] Commit messages follow Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`)
- [ ] `npm run lint` passes
- [ ] `npm run check` passes (svelte-check)
- [ ] `npm run test:unit` passes
- [ ] `npm run test:e2e` passes (when relevant)
- [ ] New routes are added to `src/routes/sitemaps/pages.xml/+server.ts` (see the `static-route-sitemap` skill)
- [ ] `CLAUDE.md` and affected skills updated when conventions change
- [ ] Follows the design-system rules (see the table in `CLAUDE.md` § "Design system rules")

## Design-system rules (summary)

Full details in `.claude/skills/`. In short:

| Don't                                    | Do                                                     |
| ---------------------------------------- | ------------------------------------------------------ |
| `text-sm`, `text-lg`, raw `font-size`    | `fs-canon`, `fs-trafalgar`, `fs-body-copy`…            |
| `p-[20px]`, arbitrary spacing            | BBC GEL scale (`p-4`, `gap-7`, SU 1–16)                |
| `z-10`, `z-50`, raw `z-index`            | Named tokens: `z-modal`, `z-nav`, `z-dropdown`…        |
| `<a>` wrapping a block                   | `<h3><a>text</a></h3>`, `::after` click zone for cards |
| "Click here" / "Read more"               | Descriptive, keyword-rich anchor text                  |
| `<div>` + state + JS toggle              | Native `<dialog>`, `popover`, `<details>`              |
| Google Fonts `<link>` / CDN `@import`    | Fontsource npm packages imported in `tailwind.css`     |
| Svelte 4: `export let`, `$:`, `on:click` | Svelte 5 Runes: `$props`, `$derived`, `onclick`        |

## Route contract

Every `+page.server.ts` must return an object matching `App.PageData`:

```ts
{
  layer: { 'content.type': string, ... },  // GTM data layer
  meta:  { url, title, description, robots? },  // SEO
  scope?: ApiResponse<Resource>,
  feeds?: Record<string, ApiResponse | Promise>,
}
```

Feeds follow the `isDataRequest ? promise : await promise` pattern for streaming. Details in the `route-server` and `feed-streaming` skills.

## Commit style

Conventional Commits, present tense, lowercase:

```
feat(search): add keyword-aware result highlighting
fix(sitemap): include pagination pages
docs(skills): clarify feed-streaming decision rule
chore: bump dependencies
```

Scope is optional but encouraged. The commit body explains **why**; the diff shows **what**.

## Code review

PRs are reviewed by Enodo maintainers. We look for:

- Correctness and clarity
- Alignment with skills and `CLAUDE.md`
- No new dependencies without justification
- Tests where warranted
- Documentation kept in sync

Reviews focus on root causes, not surface polish. If a reviewer asks "why is this needed?", the PR description should answer before the question is asked.

## What we won't merge

- Changes that break the single-language design without evolving the boilerplate coherently (use the `translate` skill for localisation; propose i18n via Paraglide as a scoped migration, not a silent add).
- Features that duplicate existing skills/components without a clear replacement plan.
- Silent dependency additions that expand the bundle or runtime surface.
- "Style over substance" reformatting sweeps unrelated to behavioural changes.

## License

By contributing, you agree that your contributions will be licensed under the project's MIT License (see [`LICENSE`](./LICENSE)).
