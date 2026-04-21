---
description: Validate .env completeness and ping the Butterfly API to confirm credentials work
---

Validate that the local `.env` is complete and the Butterfly API responds.

**Steps:**

1. **Read `.env`** (not `.env.example`). If it doesn't exist, tell the user to run `npm run setup` and stop.

2. **Required vars** — all must be present and non-empty:
   - `PUBLIC_BASE_URL`
   - `PUBLIC_API_URL`
   - `PUBLIC_API_KEY`
   - `PUBLIC_MEDIA_URL`
   - `PUBLIC_LOCALE`
   - `PUBLIC_LANGUAGE`

3. **Optional vars** — flag if missing (not an error):
   - `PUBLIC_STATIC_PAGES` (warn if the site uses static pages)
   - `PUBLIC_INDEXABLE` (warn if pushing to prod)
   - `PUBLIC_GTM_ID` (warn if analytics are expected)

4. **Sanity check format**:
   - `PUBLIC_BASE_URL` starts with `https://` (or `http://` for local dev)
   - `PUBLIC_API_URL` starts with `https://`
   - `PUBLIC_LOCALE` matches `[a-z]{2}_[A-Z]{2}` (e.g. `fr_FR`)
   - `PUBLIC_LANGUAGE` matches `[a-z]{2}`
   - `PUBLIC_STATIC_PAGES` parses as JSON (if present)

5. **Ping the API**:

   ```bash
   curl -sS -H "x-api-key: $PUBLIC_API_KEY" "$PUBLIC_API_URL/v1/" | head -c 500
   ```

   - Expect a JSON response with a `data.attributes` shape (the `Property`)
   - If 401/403 → API key is wrong or the property isn't provisioned
   - If 404 → API URL is wrong
   - If timeout → network / DNS issue

6. **Check Butterfly prerequisites** via the API response:
   - Taxonomy `tags` exists (`GET /v1/taxonomies`, look for `slug: 'tags'`)
   - Post type `page` exists (check property `postTypes`)
   - Custom feed `featured` exists (`GET /v1/feeds/featured` should return posts)

**Report**: one line per variable with ✓/✗, then API connectivity, then Butterfly prerequisites. If anything fails, tell the user which env var or CMS setting to fix.

**Do not modify the `.env` file.** Report only.
