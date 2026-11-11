---
name: new-seo-site
description: Produce a complete 12-month editorial SEO strategy for a new content site on any niche, following the methodology used for desplantes.fr. Use when the user wants to bootstrap a content-led site on a specific topic (gardening, cooking, fitness, parenting, finance, tech…) with the goal of ranking on Google Search AND Google Discover. Generates a full set of strategic docs, a Butterfly CMS structure, and a UI/UX implementation plan — all ready for validation and execution.
---

# New SEO Site — full editorial strategy bootstrap

Produce a complete strategy package for a new content site on any niche. Output is a set of 7 markdown docs in `docs/strat-seo/` of the consuming project, modelled on the desplantes.fr deliverables (see `@../des-plantes/docs/strat-seo/` if available as reference).

**Use this skill whenever** the user asks to "build a content site on [topic]", "lancer un site SEO sur [thématique]", "pose-moi la strat éditoriale pour…", or equivalent.

---

## The 7 deliverables

Always produce these in this order:

1. **`PLAN-CONDENSE.md`** — 2-page summary for fast validation (6-8 questions to validate before writing the rest)
2. **`strat-seo.md`** — master strategic doc (3000-4000 words)
3. **`strat-seo-personas.md`** — 5-6 reader personas
4. **`strat-seo-charte-editoriale.md`** — voice, tone, lexicon, anti-AI rules, sensitive topics
5. **`strat-seo-article-structure.md`** — 6-10 article templates + SEO on-page rules + Enodo Semantic quality grid
6. **`strat-seo-calendrier-editorial.md`** — 12-month editorial calendar, month-by-month
7. **`plan-butterfly.md`** + **`plan-design.md`** — Butterfly CMS spec + UI/UX spec

**Always stop after deliverable 1** and ask for validation before writing 2-7. Small upfront misalignment wastes hours later.

---

## Phase 1 — Discovery (before writing a single doc)

### Research the niche

Use WebSearch (and WebFetch for deep dives) to gather:

1. **Competitive landscape** — top 10 sites in the niche (FR or target country), approximate monthly traffic (Similarweb if you can cite), editorial model, content intensity, visible weaknesses
2. **Google Discover patterns** — what topics/angles in this niche go viral on Discover? Look for recent articles that went big
3. **Query clusters** — 15-25 thematic clusters with intent and rough difficulty
4. **Seasonality** — month-by-month peaks (which months drive the most search volume)
5. **Trends 2025-2026** — what's rising? Specific to this niche
6. **Monetisation norms** — affiliate, ads, paid newsletter, e-commerce back-end
7. **Differentiation gaps** — what is no one doing well?

If WebSearch is unavailable in the environment, say so explicitly — don't fabricate volumes or sources. Ask the user for data (Ahrefs export, GSC screenshot) or scope the work to a structural strategy without traffic claims.

### Find a brand name + available domain

The working dir often has a code name (`des-plantes/`, `food-project/`…) — that's **not** the brand. Before writing `PLAN-CONDENSE.md` propose 2-3 candidate brand names:

- Short (1-2 syllables ideal), pronounceable in the target language
- Evocative of the niche without being literal (`PromesseDeFleurs`-style "descriptif" names are a trap — hard to remember, hard to rank on brand)
- Available as `.fr` (or the TLD that matches the target audience) — check via `whois` or `https://rdap.nic.fr/domain/<name>.fr`
- Free of obvious trademark conflicts in the niche
- Works as a short handle on Instagram / Pinterest / YouTube

Present the candidates with trade-offs, let the user pick. Record the chosen name + domain in `PLAN-CONDENSE.md` and use it consistently in every subsequent doc.

### Inspect existing assets

- Check if a Butterfly property is already configured (`.env`, `mcp__butterfly__list_*`)
- Check for existing docs, analytics, competitor notes in the working dir or sister dirs

### Propose 2-3 positioning angles

Before writing anything, suggest 2-3 distinct positioning options with trade-offs. Let the user pick one. Examples:

- "Sérieux scientifique" — source everything, debunk myths (works when the niche is full of folklore)
- "Urbain moderne" — ignore the rural/suburban audience everyone fights over, own the city dweller (works for plants, food, fitness)
- "Premium éditorial" — long-form journalism, 1 article / week, paywall viable (works for finance, tech, parenting)
- "Service utile" — templates, calculators, tools + content (works for finance, productivity, health)

---

## Phase 2 — Produce `PLAN-CONDENSE.md`

**Target length** : 2 pages, scannable, with tables.

**Structure** :

1. **Diagnostic niche (résumé)** — top 3-5 competitors with forces/failles, 3-4 unexploited angles
2. **Positionnement & promesse** — 1 tagline + 3 differentiation pillars
3. **Architecture éditoriale** — 5-7 editorial pillars with % volume allocation, intent, role
4. **Structure Butterfly** — 4 sections:
   - **A. Arborescence du site** (URL tree with sub-hubs via taxonomies)
   - **B. Catégories Butterfly** (flat, mutually exclusive, 1 per post) — **critical distinction, don't confuse URL sub-hubs with Butterfly categories**
   - Taxonomies (transverse, with terms)
   - Flags, feeds, authors, custom settings
5. **UI/UX** — naming, color palette tokens, typography picks, image direction, logo + favicon AI prompts
6. **Cadence & KPIs** — articles/month at start vs régime, 12-month KPI targets
7. **6-8 questions to validate** — positioning, pillars, Butterfly structure, naming, palette, cadence…
8. **Next steps if validated** — list the 6 remaining docs + the Butterfly config + first content sprint

**Critical rules**:

- Never put URL hierarchy (`fiches-plantes/interieur/`, `au-jardin/janvier/`) as Butterfly categories — a Butterfly post has **exactly 1 category**. Sub-level groupings must be taxonomies.
- Authors are fictitious but plausible. Include AI image prompts for realistic portraits (documentary-style, 85mm, natural lighting, unretouched, asymmetric — avoid stock-photo aesthetic). Same photographic style across the whole team.
- Logo: propose a minimalist botanical/editorial icon + wordmark in a serif typeface. Provide 3 AI prompts (icon, wordmark, vertical lockup) and list the deliverables (`favicon.svg`, `apple-touch-icon.png`, `og-default.png`, `logo.svg`).
- Palette: respect WCAG AA contrast. Provide hex values ready to paste into `tailwind.css` `@theme` block. Avoid the cliché color of the niche (e.g. fluo green for plants, fluo orange for food, fluo blue for tech).

**STOP here**. Ask the user to validate. Do **not** start producing 2-7 before they explicitly accept.

---

## Phase 3 — Produce the 6 detailed docs

Only after validation. Each doc builds on the validated `PLAN-CONDENSE.md`.

### `strat-seo.md` (~3000-4000 words)

Sections:

1. Executive summary (situation, opportunity, 3 actions for days 1-30)
2. Diagnostic de la niche (market size, top 10, 3 unexploited angles)
3. Analyse concurrentielle (3-5 deep competitor dives with force/faille)
4. Positionnement & différenciation (promesse + 3 pillars + moat)
5. Architecture éditoriale (reprises PLAN-CONDENSE, détail piliers)
6. Les N templates d'articles (8-10 templates depending on niche)
7. Plan de 130+ idées d'articles (priority-tagged 🔥⭐○, distributed across pillars)
8. Calendrier saisonnier (month overview + 40/month cadence breakdown)
9. Stratégie Discover (6 invariants + 20 ideas to prioritise)
10. Netlinking & autorité (rule: earn first, outreach later; Pinterest if relevant)
11. KPIs & roadmap 90 jours (week-by-week)
12. 7 pièges à éviter

### `strat-seo-personas.md`

5-6 personas, each with:

- Identity (age, situation, job, income, location)
- Context (what's happening in their life right now)
- Motivations (jobs to be done)
- Pains / frustrations
- Desires
- Channels (where they find content)
- Vocabulary (words they use — and don't)
- Budget
- Objections to our content / brand
- Articles that speak to them (references to the 130+ ideas)
- Sample quote

Include a persona × pillar matrix at the end (⭐⭐⭐ / ⭐⭐ / ⭐ / —).

### `strat-seo-charte-editoriale.md`

Sections:

1. Manifeste (1-page brand voice declaration)
2. 5 editorial values
3. Voice rules (4 absolutes + anti-AI section with banned formulations)
4. 20 ✅ vs ❌ examples (highly specific to the niche)
5. Lexique (words we use / words we ban — corporate, mièvrerie, niche folklore)
6. Signature formulations (openings, transitions, CTA verbs, closings)
7. Sensitive topics (religion, health, disability, money, kids, pets — adapt to niche)
8. Visual style (photo, illustration, typography)
9. 7 questions before publishing (checklist)

### `strat-seo-article-structure.md`

Sections:

1. General rules (voice, length by template)
2. SEO on-page (title, excerpt, slug, keywords, robots)
3. Standard 4-block format (title, excerpt, author, body)
4. Internal linking rules
5. Images (formats, sources, alt text, Discover specifics)
6. The N templates detailed — for each: intention, length, schema, persona, structure, clés
7. Schema.org mapping by template
8. QA checklist before publishing
9. Enodo Semantic quality grid (with the 9 dangers)

### `strat-seo-calendrier-editorial.md`

For each of 12 months:

- Context (seasonal pressure, events, search trends)
- Events (Mother's Day, holidays, niche-specific dates)
- Pillar breakdown (how many of each pillar to publish this month)
- Week-by-week planning (for M1-M2 especially)
- Key angles / articles

Plus: overall cadence table, refresh/recycle strategy, weekly/monthly ops rhythm.

### `plan-butterfly.md`

Actionable spec with MCP calls. Sections:

1. Execution order (property metadata → custom settings → types → taxonomies → categories → flags → feeds → authors)
2. **Property metadata** — explicit `update_property` call with title, description, hostname (`https://<brand>.<tld>`), locale (`fr-FR`), timezone (`Europe/Paris`), permalink template (default: `{main-category}/{slug}-{id}.html`), and default values for every custom setting. **Don't skip this** — the property's own `title` / `description` feed `<title>` / meta description on the homepage; leaving them at creation-time placeholders ships a broken site.
3. Content types — explicit MCP `create_type` calls
4. Categories — flat list with MCP calls + SEO descriptions per hub page
5. Taxonomies — 10-15 taxonomies with exhaustive term lists + MCP calls
6. Flags — short list + MCP calls. **Minimalism rule**: create a flag only when the information it carries is **not derivable** from publishedAt, the post's category, an intersection of taxonomies, or a curated feed. Common mistakes: `new` (derive from `publishedAt < 30 days` on the site), `trend-2026` (redundant with a dedicated category), `debunk` (redundant when `category=myths-*` exists), `seasonal` (redundant with `category=monthly × taxonomy month`). The boilerplate ships `news` and `sponso` — keep only those unless you have a clear reason. For curated editorial ordering of a handful of posts (home hero, top picks), use a **feed**, not a flag.
7. Feeds — custom feeds for home + hubs. **Slug matters**: the boilerplate home loads a feed named `featured` (`src/routes/+page.server.ts`). Create the feed with a `name` that slugifies to `featured` (visible label can be anything, e.g. "À la une" / "Top stories" — the technical name "Featured" produces slug `featured`) or rename the endpoint on the code side. Never create both a flag and a feed for the same role. A feed exists for **manual editorial ordering**; when chronological order works, a tag/category filter is enough and no feed is needed.
8. Authors — MCP calls + reminder to upload AI portrait first, then link via `thumbnail_media_id`
9. Custom settings — keys/values. Only create settings that the site actually *reads*. Don't pre-create settings "for later" — the property already has first-class `title`/`description`/`hostname`/`locale`/`timezone`; putting a `site_short_description` custom duplicates it. Same for fields like `zone_climatique_default` that no route or component reads.
10. SvelteKit routes to create (with path examples, matchers, load function structure)
11. Schema.org / JSON-LD generators to add (mapping per template)
12. Sitemaps to add (custom taxonomy sitemaps)
13. Environment variables to set
14. MCP troubleshooting (if admin endpoints fail)

#### MCP server loading .env (robust setup)

The `butterfly-mcp` subprocess inherits the parent shell's environment, which often shadows `dotenv`-loaded values. Use a wrapper script instead — `scripts/mcp-butterfly.sh` is already in the boilerplate:

```sh
#!/bin/sh
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_ROOT"
[ -f .env ] || { echo "mcp-butterfly.sh: .env not found" >&2; exit 1; }
set -a; . ./.env; set +a
exec butterfly-mcp
```

Wire it in `.mcp.json`:

```json
{ "mcpServers": { "butterfly": { "command": "./scripts/mcp-butterfly.sh" } } }
```

#### Unsplash MCP (optional, for CC stock photography)

When the niche needs visual assets and you don't have an in-house photographer, wire an Unsplash MCP. Use the **`unsplashx` npm package** (returns URLs, not base64 — safe for context); avoid `@jeff_kit/unsplash-mcp-server` which currently ships invalid base64 payloads. Pattern mirrors the Butterfly wrapper:

- Add `UNSPLASH_ACCESS_KEY` to `.env` (create an Unsplash app at `https://unsplash.com/oauth/applications` to get one).
- Drop `scripts/mcp-unsplash.sh` alongside `mcp-butterfly.sh` — same structure, last line `exec npx -y unsplashx "$UNSPLASH_ACCESS_KEY"` (that package reads the key as a positional arg, not env).
- Register in `.mcp.json`: `"unsplash": { "command": "./scripts/mcp-unsplash.sh" }`.
- Restart Claude Code to pick up the new MCP.

Tools exposed: `search_photos`, `get_photo`, `download_to_project`, `insert_to_page`.

#### Media workflow (apply every time you add an image)

1. **Visually inspect before uploading**. Never trust a filename — Wikimedia Commons files named `TopTropicals.jpg` can be promotional banners; Unsplash "monstera" results can include unrelated subjects. Read the downloaded file with the image viewer tool before calling `upload_media`. A branded image shipped live is a rollback problem.
2. **Reuse existing medias**. Call `list_medias` (or keep the id from a previous upload) before re-uploading the same picture. Each Butterfly media has a single id and can be referenced from many posts/terms/authors.
3. **`image` blocks in a body carry three fields, always**:
   - `description`: **alt text**, describes what is *on* the image (for a11y + SEO). Never leave empty.
   - `caption`: visible legend under the image — the narrative/editorial sentence.
   - `credits`: attribution (e.g. "Wikimedia Commons (CC BY-SA)", "Unsplash — Photographer Name").
4. **Wikimedia fetch pattern**: Wikimedia blocks default MCP fetchers by User-Agent. Download locally via `curl -L -A "YourBotName/1.0" <url>` first, then pass the local path to `upload_media`.
5. **Nginx 413 on upload** = reverse-proxy `client_max_body_size` is too low (default 1MB). Bump it on the nginx fronting the public API (and on any internal proxy between public-api and private-api — both layers can independently cap). The backend CMS handles media compression, so lift the limit rather than pre-compress every upload.

#### Permalink template — pick the route-compatible shape

The boilerplate ships with root-level post routes (`src/routes/[slug=post].html/`). Set the property permalink to **`{slug}-{id}.html`**, not `{main-category}/{slug}-{id}.html`. A nested permalink like `/category/post-1.html` has no matching route and falls through to the `[...path]/` catch-all which looks for a category whose path matches — returns 404 on deep paths. If the site absolutely needs category-in-URL, add a `[category]/[slug=post].html/` route that duplicates the post-detail logic.

A post's `canonical` is computed from the permalink template at read time, but the property metadata is cached; after an `update_property(permalink)`, existing posts may 301-redirect to the old shape until the cache expires or you trigger a refresh with `update_post`.

#### Troubleshoot checklist

- **401 "Private key required" on admin list endpoints** (`list_types`, `list_flags`, `list_feeds`, `list_custom_settings`) → the MCP server must pass `scope: 'admin'` when hitting these routes. Verify in `mcp-server-v1/src/index.js`. Also: kill all stale MCP processes before retrying.
- **403 "Can not edit property" on `update_property`** → the `/v1/properties` router is not mounted behind `propertyMiddleware`. For service-auth calls (MCP → public-api → private-api), `req.property` is unset and `req.decodedToken.god = true` — the controller must short-circuit the IAM ACL check in that case. See `controllers/properties.js`. If you are the property creator and still get 403, the fix isn't deployed — push + redeploy `private-api-v1` before retrying.
- **Category/term creation fails with `"Cannot read properties of undefined (reading 'name')"`** → you are hitting a slug/path unique-constraint clash with a soft-deleted row from a previous run. `models/categories.js` has a buggy retry that recurses with mangled args when the initial insert fails. Fix: either choose a different slug, or `update_category` the existing soft-deleted row back to `disable: false` (the MCP `update_category` has a `restore: true` flag for this).
- **Taxonomy `tags` terms must be pre-created via `create_term`** before being attached to a post. Unlike other fields, the taxonomy doesn't auto-create terms from a `create_post` call — you get `400: Unknown term "X" in taxonomy "tags"`. Run `create_term` first, then reference the slug.
- **`thumbnail_media_id` doesn't stick on `create_post`** — despite being accepted in the schema, the post is created with `thumbnail.data: null`. Workaround: call `update_post(post_id, thumbnail_media_id)` right after creation. Same may apply to `create_term` (test before chaining).
- **Slug auto-generation quirks** — `&` becomes `and` in slugs (`mythes-and-verites`), `'` is dropped but without replacement so `Plante d'intérieur` → `plante-dinterieur` (the `d` sticks), long names stay long (`au-jardin-ce-mois-ci`). Choose short, symbol-free names; rename via `update_category` / `update_term` or delete + recreate (accept the new id).
- **413 Request Entity Too Large on media upload** — nginx default `client_max_body_size` is 1MB. Bump it on the reverse proxy fronting the API. Watch out for a second hop: when the public-api forwards to the private-api through another nginx, both layers need to be raised or the first pass looks fixed and the second still 413s.
- **schema-dts has no `Plant` export** — JSON-LD generators for botany niches must cast the return to `Thing` instead of `Plant`; `@type: 'Plant'` is valid at runtime, the TS types are the gap. Same pattern likely applies to other less-common schema.org classes.

### `plan-design.md`

Sections:

1. Design principles (3 invariants specific to the brand)
2. Color palette (tokens in `@theme` block format, ratios WCAG AA verified)
3. Typography (Fontsource packages to install, `fs-*` mapping per element)
4. Spacing, rhythm, grid (max-widths for text/hero/grid)
5. Key components (Card, PlantIdCard-equivalent, encadré à retenir, header, footer, buttons, badges, breadcrumb, TOC, author block)
6. Logo & favicon (references to the AI prompts in PLAN-CONDENSE + file deliverables)
7. Imagery (formats, sources, treatment, alt text)
8. Accessibility (contrasts, semantics, focus, keyboard)
9. Implementation checklist (8-day plan)

---

## Phase 4 — Implementation trigger

After all docs are written, the user will typically ask to:

1. Configure Butterfly (use `plan-butterfly.md` as the script)
2. Apply the design (use `plan-design.md`)
3. Start writing the first sprint of articles (use the calendar)

**Don't start implementation during Phase 3.** Docs first. Implementation is a separate phase, usually a new session.

---

## Niche-specific adaptations

The 7 docs are a scaffold. Adapt to niche:

- **If the niche has strong "folklore"** (plants, cooking, health, parenting, finance, astrology…) → make "Mythes & vérités" / "Débunk" a full pillar (10 % of volume). High E-E-A-T value, high linkability.
- **If the niche is highly seasonal** (gardening, fashion, travel, cooking) → "Au mois-ci" is a major pillar (15-20 %) with 12 recurring mensual articles.
- **If the niche is problem-driven** (plants, pets, tech, parenting) → "Diagnostic" is a key pillar.
- **If the niche is transactional** (e-commerce, finance, tools) → "Top / sélection" template is dominant, strong affiliate potential.
- **If the niche is tech / fast-moving** (AI, crypto, SaaS) → "Actualités" becomes 20-30 % of volume.
- **If the niche is evergreen** (psychology, philosophy, classic cooking) → longer articles, less calendar pressure.

Persona count: 4-6 typically. Fewer if audience is tight. More if multiple segments must be addressed.

Template count: 6-10. Force each article into exactly one template — never hybrid.

---

## Checklist when producing a new bootstrap

- [ ] Phase 1 — research done (competitors, seasons, clusters, trends, monetisation)
- [ ] Phase 1 — 2-3 positioning angles proposed, user picked one
- [ ] Phase 1 — 2-3 brand names proposed + domain availability checked, user picked one
- [ ] `PLAN-CONDENSE.md` produced
- [ ] **User has explicitly validated before producing the rest**
- [ ] `strat-seo.md` (all 12 sections)
- [ ] `strat-seo-personas.md` (5-6 personas + matrix)
- [ ] `strat-seo-charte-editoriale.md` (all 9 sections)
- [ ] `strat-seo-article-structure.md` (templates + QA grid)
- [ ] `strat-seo-calendrier-editorial.md` (12 months)
- [ ] `plan-butterfly.md` (MCP-callable, property metadata + defaults included)
- [ ] `plan-design.md` (Tailwind-ready tokens)

Final step: tell the user what's next — typically "validate the docs, then start a new session to run the Butterfly config + first content sprint".
