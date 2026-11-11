---
description: Add a new JSON-LD schema generator to src/lib/JsonLD and register it
argument-hint: <SchemaName>
---

Create a new JSON-LD schema generator named `$1` (PascalCase, e.g. `Recipe`, `Event`, `Product`) under `src/lib/JsonLD/`.

**Before touching files, read:**

1. `.claude/skills/jsonld-schema/SKILL.md` — generator conventions, shared `@id`s, rendering
2. `src/lib/JsonLD/index.ts` — registration map
3. `src/lib/JsonLD/ids.ts` and existing generators (`Organization.ts`, `Article.ts`, `VideoObject.ts`) as reference

**Steps:**

1. Create `src/lib/JsonLD/$1.ts`:
   - Import types from `schema-dts`
   - Default export `function $1(data: App.PageData)` returning one node, or an array of nodes (empty when nothing applies)
   - Emit the Schema.org fields the rich result needs — ask the user which ones if the type has many optional properties
   - `url: data.meta.url` (the canonical), absolute URLs via `PUBLIC_BASE_URL` / `absoluteUrl()`
   - ISO 8601 dates, `undefined` (not `null`) for absent values, no personal data
   - Reference `WEBSITE_ID` / `ORGANIZATION_ID` / `authorId()` from `ids.ts` instead of redefining those nodes
2. Register `$1` in the `handlers` map of `src/lib/JsonLD/index.ts`.
3. Add a spec `src/lib/JsonLD/$1.spec.ts`: `@type === '$1'`, required fields present (mirror `Organization.spec.ts`).
4. Tell the user **where** to use it: which route's `+page.svelte` should pass `'$1'` to `generateJsonLd()`.

Validate the output with [Google's Rich Results test](https://search.google.com/test/rich-results) once wired into a route.

**After scaffolding**, report: generator created, registered, spec created, and which route the user should wire it into.
