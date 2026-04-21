---
description: Run the translate skill end-to-end — localise the whole boilerplate to a target language
argument-hint: <language-name-or-locale>
---

Localise the entire boilerplate to `$1` (e.g. `French`, `fr_FR`, `Spanish`, `es_ES`, `German`, `de_DE`).

**Before doing anything, read the translate skill fully:** `.claude/skills/translate/SKILL.md`. It contains the complete checklist of files and the FR/ES reference translations.

**Clarify with the user:**

- BCP 47 locale (e.g. `fr_FR`)
- ISO 639-1 code (e.g. `fr`)
- Target timezone for `formatRelativeDate.ts` (e.g. `Europe/Paris`)
- 12h vs 24h clock preference
- Tone (formal vs conversational) — this is especially relevant for `httpErrors.ts`

**Then execute the skill checklist:**

- [ ] `.env`: update `PUBLIC_LOCALE` and `PUBLIC_LANGUAGE`
- [ ] `src/lib/formatRelativeDate.ts`: translate `Today` / `Yesterday` / `${n} days ago`; adjust `hour12`, `timeZone`, and any AM/PM replacement
- [ ] `src/lib/httpErrors.ts`: translate all 9 messages
- [ ] `src/routes/+layout.svelte`: `aria-label` on skip link
- [ ] `src/components/Layout/Header.svelte`: nav/menu/search aria-labels + visible "Search"
- [ ] `src/components/Layout/Footer.svelte`: all link texts + static copy
- [ ] `src/routes/search/+page.svelte`: form strings + no-results message
- [ ] `src/routes/search/+page.server.ts`: SEO titles + descriptions
- [ ] `src/components/Pagination.svelte`: aria-labels + default `label` prop
- [ ] `src/components/Dialog.svelte`: close aria-label
- [ ] `src/components/Breadcrumb.svelte`: nav aria-label
- [ ] `src/lib/JsonLD/BreadcrumbList.ts`: segment names
- [ ] `src/routes/+page.svelte`: CSS `content:` strings

Use the ripgrep searches listed in the skill to catch any stray English strings. Don't translate Butterfly CMS content — that's authored in the CMS, not the codebase.

**Important:** this is a **single-language localisation**, not i18n. The site serves one language after this change. If the user actually wants multi-language support, flag that this is a scoped migration (recommended: Paraglide with SvelteKit) — not what this command does.

**After translating**, report: files updated, locale/language values set, and any strings you couldn't locate (if any).
