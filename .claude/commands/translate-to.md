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
- [ ] `src/lib/httpErrors.ts` and `src/routes/+error.svelte`: every message
- [ ] Every file of the skill's Step 3 table: visible text, visually hidden text (skip link, « Enlarge »…) and `aria-label`s (« Menu », « Main menu », « Footer », « Media viewer »…)
- [ ] Route titles, descriptions and their fallbacks (`+page.server.ts`), feed descriptions
- [ ] `src/lib/JsonLD/BreadcrumbList.ts`: segment names + the ` - Page N` regex
- [ ] Visible labels and accessible names still identical (WCAG 2.5.3)

Use the grep listed in the skill to catch any stray English strings. Don't translate Butterfly CMS content — that's authored in the CMS, not the codebase.

**Important:** this is a **single-language localisation**, not i18n. The site serves one language after this change. If the user actually wants multi-language support, flag that this is a scoped migration (recommended: Paraglide with SvelteKit) — not what this command does.

**After translating**, report: files updated, locale/language values set, and any strings you couldn't locate (if any).
