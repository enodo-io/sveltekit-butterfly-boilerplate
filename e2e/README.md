# Butterfly E2E Tests

This e2e (end-to-end) test suite verifies that all Butterfly site pages work correctly and follow SEO and accessibility best practices.

## Structure

### Helpers

- **`helpers/api.ts`** : Utilities to fetch data from the Butterfly API
  - `getRandomCategory()` : Fetches a random category
  - `getRandomAuthor()` : Fetches a random author
  - `getRandomPost()` : Fetches a random post
  - `getRandomStaticPage()` : Fetches a random static page
  - `getRandomFeedFormat()` : Returns a random feed format (rss or atom)

- **`helpers/seo.ts`** : Generic SEO tests
  - Validates `lang` attribute on `<html>`
  - Checks for exactly 1 `<h1>` element
  - Validates Open Graph meta tags (locale, site_name, title, description, url, image, type)
  - Validates `<title>` and meta description tags
  - Checks for canonical link presence
  - Validates JSON-LD structured data
  - Verifies that non-lazy images have preload links

- **`helpers/accessibility.ts`** : Accessibility tests
  - Checks that all images have alt text
  - Verifies all inputs have labels
  - Ensures interactive elements have accessible text
  - Validates skip link presence
  - Checks for semantic landmarks
  - Basic contrast validation

### Tests

**`routes/`** : Test suite organized by route, one file per route

Each route has its own test file with separated tests:

- **`home.test.ts`** : `/` - Home page
- **`articles.test.ts`** : `/articles` - Articles listing page
- **`authors.test.ts`** : `/authors` - Authors listing page
- **`author.test.ts`** : `/authors/{id}` - Author pages (dynamic)
- **`search.test.ts`** : `/search` - Search page
- **`tags.test.ts`** : `/tags` - Tags listing page
- **`category.test.ts`** : `/{categoryPath}` - Category pages (dynamic)
- **`post.test.ts`** : `/{slug}-{id}.html` - Post pages (dynamic)
- **`page.test.ts`** : `/{slug}.html` - Static pages (dynamic)
- **`feed.test.ts`** : `/{format}.html` - RSS/Atom feeds (dynamic)

#### Test Structure

Each route file contains at least two separated test cases:

1. **`should load`** : Verifies that the page loads correctly (basic functionality test)
2. **`should pass SEO tests`** : Runs all SEO validation tests using the `runAllSEOTests()` helper

Some routes also include:

- **`should pass accessibility tests`** : Runs accessibility validation tests (home and search pages)

## Configuration

Tests use environment variables from the `.env` file at the project root:

- `PUBLIC_API_URL` : Butterfly API URL
- `PUBLIC_API_KEY` : Public API key
- `PUBLIC_STATIC_PAGES` : JSON mapping of static pages (format: `{"slug": id}`)

The `playwright.config.ts` file automatically loads these variables.

## Running Tests

```bash
# Run all e2e tests
npm run test:e2e

# Run tests in watch mode
npx playwright test --ui

# Run tests on a specific browser
npx playwright test --project=chromium
```

## Post Page Specific Tests

Post pages (`post.test.ts`) have additional tests:

- Validates that `og:type` equals `"article"`
- Verifies JSON-LD contains a valid Article, NewsArticle, BlogPosting, or FAQPage object

## Important Notes

These tests require:

1. The `.env` file configured with correct environment variables
2. A compatible Node.js version (20.19+ or 22.12+)
3. A successful site build

If some tests are skipped, it means the corresponding data doesn't exist in your Butterfly instance (e.g., no categories, authors, or posts).
