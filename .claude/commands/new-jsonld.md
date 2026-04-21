---
description: Add a new JSON-LD schema generator to src/lib/JsonLD and register it
argument-hint: <SchemaName>
---

Create a new JSON-LD schema generator named `$1` (PascalCase, e.g. `Recipe`, `Event`, `Product`) under `src/lib/JsonLD/`.

**Before touching files, read:**

1. `.claude/skills/jsonld-schema/SKILL.md` — generator conventions, `@id` cross-references, rendering
2. `src/lib/JsonLD/index.ts` — registration map
3. Existing generators (`Organization.ts`, `Article.ts`) as reference

**Steps:**

1. Create `src/lib/JsonLD/$1.ts`:
   - Import types from `schema-dts`
   - Default export `function $1(data: App.PageData): Thing`
   - Emit a fully populated Schema.org object for `$1` — ask the user which fields they need if the type has many optional properties
   - Use absolute URLs (`${PUBLIC_BASE_URL}/...`)
   - Use `new Date(...).toISOString()` for dates
   - Reference `Organization` / `WebSite` by `@id` when applicable
2. Register `$1` in `src/lib/JsonLD/index.ts`:
   ```ts
   import $1 from './$1';
   const handlers = { WebSite, WebPage, ..., $1 };
   ```
3. Add a minimal spec `src/lib/JsonLD/$1.spec.ts`:
   - Asserts `@type === '$1'`
   - Asserts required fields are present
   - Mirror the style of `Organization.spec.ts`
4. Remind the user **where** to use the new schema — which route(s) should pass `'$1'` to `generateJsonLd()`?

Validate the schema shape with [Google's Rich Results test](https://search.google.com/test/rich-results) after wiring it into a route.

**After scaffolding**, report: generator created, registered, spec created, and which route the user should wire it into.
