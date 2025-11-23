# SvelteKit Butterfly Boilerplate

A high-performance, SEO-optimized SvelteKit boilerplate for the [Enodo Butterfly CMS](https://butterfly.enodo.app). Built with simplicity and best practices in mind.

**🎯 [View Demo](https://demo.enodo.dev)**

## Table of Contents

- [Philosophy](#philosophy)
- [Features](#features)
  - [Performance](#performance)
  - [Accessibility (a11y)](#accessibility-a11y)
  - [SEO Optimizations](#seo-optimizations)
  - [Built with](#built-with)
  - [Analytics](#analytics)
- [Installation](#installation)
- [Deployment](#deployment)
- [Configuration](#configuration)
  - [Environment Variables](#environment-variables)
  - [Butterfly Requirements](#butterfly-requirements)
- [Customization](#customization)
  - [Color Palette](#color-palette)
  - [Typography](#typography)
  - [Language Configuration](#language-configuration)
  - [Assets](#assets)
  - [Sitemap URLs](#sitemap-urls)
- [Pages](#pages)
- [RSS Feeds](#rss-feeds)
- [Sitemaps](#sitemaps)
- [Library Utilities](#library-utilities)
- [Components](#components)
  - [Layout Components](#layout-components)
  - [Content Components](#content-components)
  - [Media Components](#media-components)
- [JSON-LD Schema Support](#json-ld-schema-support)
  - [Adding Custom Schemas](#adding-custom-schemas)
- [Google Tag Manager](#google-tag-manager)
  - [Data Layer](#data-layer)
  - [Custom Events](#custom-events)
- [Customization Examples](#customization-examples)
  - [Installing Custom Fonts](#installing-custom-fonts)
  - [Changing Colors](#changing-colors)
  - [Project-Type Color Suggestions](#project-type-color-suggestions)
- [Development Scripts](#development-scripts)
- [Contributing](#contributing)
- [License](#license)

## Philosophy

At Enodo, we believe in simplification ("enodo" = to untie, to simplify). This boilerplate delivers a **simple yet powerful** foundation for creating SEO-optimized blogs. All optimizations are included out of the box while maintaining clean, maintainable code.

The design is **intentionally neutral** to give you full creative freedom, while the semantic structure is **ultra-optimized** for accessibility and search engines.

## Features

### Performance

- **Streaming Svelte**: Feed pages use Svelte streaming with promise-only client rendering for optimal SEO and performance
- **Preload & Lazy Loading**: Smart media loading strategies
- **Responsive Images**: Components `Image` and `Picture` enable proper lazy loading of images from the Butterfly API, with easy support for responsive images with multiple sizes. `Image` uses `srcset` and `sizes` attributes, while `Picture` uses `<source>` elements for more advanced responsive scenarios
- **View Transitions**: Smooth page transitions using `view-transition` API
- **Deep Pagination**: Proper pagination structure for SEO and infinite scroll support

### Accessibility (a11y)

- Full keyboard navigation support
- Optimized semantic HTML structure
- Accessible menu navigation
- ARIA labels and roles throughout
- Focus management for better keyboard navigation

### SEO Optimizations

- **Rich Meta Tags**: Complete OpenGraph and standard meta tags
- **JSON-LD Schema**: Typed structured data using `schema-dts`
- **Sitemaps**: Automatic generation of sitemap index, sections, tags, authors, pages, and posts
- **RSS Feeds**: Multiple feed types (global, by category, by author, by tag)
- **Internal Linking**: Smart article mesh based on shared tags
- **Search Module**: Full-text search functionality available at `/search` route with keyboard navigation support

### Analytics

- **Google Tag Manager**: Built-in integration with configurable data layer
- Data layer includes: `app.version`, `app.platform`, `app.env`, `page.index`, `page.query`, `content.type`, `content.id`, `content.group`, `content.flags`, `content.tags`

### Architecture

- **Standardized Route Structure**: All routes follow a consistent data structure:
  - `data.scope`: Contains a `Butterfly.ApiResponse` object for the current page context (category, post, author, tag, etc.)
  - `data.feeds`: Contains promises or records of `Butterfly.ApiResponse` objects. The `<Feed>` component automatically handles lazy loading on the client side via Svelte streams, or direct SSR rendering when appropriate, making content loading seamless and performant
  - `data.meta`: Contains SEO metadata (`url`, `title`, `description`, `robots`) used for meta tags, Open Graph, and canonical URLs
  - `data.layer`: Contains analytics and tracking data (`page.index`, `page.query`, `content.type`, `content.id`, `content.group`, `content.tags`, `content.flags`) automatically pushed to Google Tag Manager data layer

### Built with

- **[@enodo/butterfly-ts](https://github.com/enodo-io/butterfly-ts)**: Wrapped in `lib/api.ts` for easy configuration
- **[@enodo/foundation-css](https://github.com/enodo-io/foundation-css)**: Utility-first CSS framework as UI base
- **SvelteKit**: Latest Svelte 5 with Runes
- **TypeScript**: Full type safety

## Installation

1. **Fork this repository** from [enodo-io/sveltekit-butterfly-boilerplate](https://github.com/enodo-io/sveltekit-butterfly-boilerplate)

2. **Install dependencies**:

```bash
npm install
```

3. **Configure your environment**:

```bash
npm run setup
```

This interactive wizard will guide you through:

- Your site URL
- Butterfly API configuration (get your credentials from [butterfly.enodo.app](https://butterfly.enodo.app) > Your Property > Administration > Settings)
- Media domain
- Static pages (optional)
- Search engine indexing settings
- Language & Locale configuration
- Google Tag Manager ID (optional)

4. **Run the development server**:

```bash
npm run dev
```

Your site will be available at `http://localhost:5173`

## Deployment

For deployment, see the [official SvelteKit adapter documentation](https://kit.svelte.dev/docs/adapters). This boilerplate currently uses **`@sveltejs/adapter-node`** but can be switched to any adapter (Vercel, Netlify, Cloudflare, etc.).

To build for production:

```bash
npm run build
npm run preview
```

## Configuration

### Environment Variables

The setup script creates a `.env` file with the following variables:

| Variable              | Required | Description                                                                       |
| --------------------- | -------- | --------------------------------------------------------------------------------- |
| `PUBLIC_BASE_URL`     | Yes      | Your website's public URL (e.g., `https://mywebsite.com`)                         |
| `PUBLIC_API_URL`      | Yes      | Butterfly API domain (from your Butterfly settings)                               |
| `PUBLIC_API_KEY`      | Yes      | Butterfly API key (from your Butterfly settings)                                  |
| `PUBLIC_MEDIA_URL`    | Yes      | Butterfly media domain (for static assets)                                        |
| `PUBLIC_STATIC_PAGES` | No       | JSON object mapping page slugs to IDs (e.g., `{"about":1,"legal":2}`)             |
| `PUBLIC_INDEXABLE`    | Yes      | Set to `false` for staging/dev to prevent indexing. Defaults to `true` if not set |
| `PUBLIC_LOCALE`       | Yes      | Locale code for your site (e.g., `fr_FR`, `en_US`, `es_ES`)                       |
| `PUBLIC_LANGUAGE`     | Yes      | Language code (e.g., `fr`, `en`, `es`) - auto-extracted from locale by default    |
| `PUBLIC_GTM_ID`       | No       | Google Tag Manager container ID (e.g., `GTM-XXXXXXX`)                             |

### Butterfly Requirements

This boilerplate expects the following structure in your Butterfly CMS:

- **Taxonomy**: A custom taxonomy named `tags` must exist
- **Post Type**: A post type named `page` for static pages (Legal, About, etc.)
- **Custom Feed**: A custom feed named `featured` must exist

Customize static page URLs via the `PUBLIC_STATIC_PAGES` environment variable.

## Customization

### Color Palette

Adapt your site's color palette in `src/assets/styles/main.scss`:

```scss
@use '@enodo/foundation-css' with (
  $colors: (
    light: (
      'main': #ffffff,
      '025': #fafafa,
      // ... more shades
      '900': #0a0a0a,
    ),
    primary: (
      'main': #3b82f6,
      // Your primary color
    ),
    secondary: (
      'main': #f59e0b,
      // Your secondary color
    ),
  )
);
```

You're not limited to `primary` and `secondary`. You can define colors by name (`blue`, `green`, `red`) or by usage (`brand`, `success`, `error`, `warning`).

### Typography

Change fonts in the same file:

```scss
@use '@fontsource/poppins';
@use '@fontsource-variable/open-sans';
@use '@fontsource/fira-mono';

@use '@enodo/foundation-css' with (
  $font-families: (
    brand: (
      'Poppins',
      sans-serif,
    ),
    // Brand heading font
    sans: (
        'Open Sans',
        sans-serif,
      ),
    // Body font
    mono: (
        'Fira Code',
        monospace,
      ),
    // Code font
  )
);
```

Install fonts via:

```bash
npm install -D @fontsource/{font-name}
```

### Language Configuration

Language and locale are configured via environment variables:

1. **Set `PUBLIC_LOCALE`** (e.g., `fr_FR`, `en_US`, `es_ES`, `de_DE`)
2. **Set `PUBLIC_LANGUAGE`** (e.g., `fr`, `en`, `es`) - auto-extracted from locale by default

These variables are used throughout the application for:

- HTML `lang` attribute in `src/app.html`
- Open Graph `og:locale` meta tags
- Default language settings

**Important**: After setting the environment variables, you must also:

3. **Translate all text** in your routes and components (including ARIA labels)
4. **Update error messages** in `src/lib/httpErrors.ts`
5. **Translate any hardcoded text** in components (buttons, labels, placeholders, etc.)

Example translations needed:

- Page titles and descriptions
- Form labels and placeholders (search input, buttons)
- Button text ("Search", "Load more", "Previous page", "Next page")
- Error messages in `src/lib/httpErrors.ts`
- ARIA labels
- Navigation menus
- Feed empty messages

### Assets

Replace default assets:

- **Favicons**: All `favicon-*.png` files and `favicon.ico` in the `static/` folder
- **Logo**: All `logo-*.jpg` and `logo-*.png` files in the `static/` folder
- **thumb.jpg**: Default Open Graph image in `src/assets/images/` (recommended size: 1366x768px)

### Sitemap URLs

Update `static/robots.txt` with your actual site URL:

```
Sitemap: https://www.yoursite.com/sitemaps/index.xml
Sitemap: https://www.yoursite.com/sitemaps/news.xml
```

## Pages

### Home Page: `/`

**File**: `src/routes/+page.svelte`

- Uses a Butterfly custom feed with the key `featured` to display a hero article
- Creates sections for each first-level category
- Displays the latest posts in each category

### Category Page: `/[path]`

**File**: `src/routes/[...path]/+page.svelte`

Lists all posts in the corresponding category with pagination.

### All Articles: `/articles`

**File**: `src/routes/articles/+page.svelte`

Displays all published posts across all categories.

### Search: `/search`

**File**: `src/routes/search/+page.svelte`

Full-text search functionality with keyboard navigation.

### Authors Listing: `/authors`

**File**: `src/routes/authors/+page.svelte`

Lists all site authors with their profile information.

### Author Page: `/authors/[slug]`

**File**: `src/routes/authors/[slug]/+page.svelte`

Displays author profile and their latest posts.

### All Tags: `/tags`

**File**: `src/routes/tags/+page.svelte`

Lists all tags from the `tags` taxonomy.

### Tag Page: `/tags/[slug]`

**File**: `src/routes/tags/[slug]/+page.svelte`

Displays all posts tagged with the specified tag.

### RSS Directory: `/rss.html`

**File**: `src/routes/rss.html/+page.svelte`

Syndication directory listing all available RSS feeds.

### Article (Post): `/[slug]-[id].html`

**File**: `src/routes/[slug=post]/+page.svelte`

- Displays a single article
- Automatically includes links to related articles based on shared tags
- Implements semantic cocoon / link building strategy

### Static Pages: `/[env-defined-slug].html`

**File**: `src/routes/[slug=page].html/+page.svelte`

Example: `/about.html`, `/legal.html` (configured via `PUBLIC_STATIC_PAGES`)

**Important**: Remember to set proper canonical URLs in Butterfly for these pages.

## RSS Feeds

All feeds are available at `/[format=feed]/` routes:

### Global Feed: `/rss/index.xml`

Latest posts from all categories

### Category Feed: `/rss/sections/[path].xml`

Posts from a specific category

### Author Feed: `/rss/authors/[slug].xml`

Posts by a specific author

### Tag Feed: `/rss/tags/[id].xml`

Posts tagged with a specific tag

## Sitemaps

All sitemaps are generated automatically and available at `/sitemaps/`:

- **Index**: `/sitemaps/index.xml` - Master sitemap
- **News**: `/sitemaps/news.xml` - Posts published in the last 48 hours
- **Sections**: `/sitemaps/sections.xml` - All category pages
- **Tags**: `/sitemaps/tags.xml` - All tag pages
- **Authors**: `/sitemaps/authors.xml` - All author pages
- **Pages**: `/sitemaps/pages.xml` - Static pages (post type `page` and hardcoded pages)
- **Posts**: `/sitemaps/posts.xml` - All article pages

## Library Utilities

The `$lib` directory contains reusable utility functions and helpers for the application.

### API Client

**File**: `lib/api.ts`

Pre-configured Butterfly API client instance using environment variables. Used throughout the application to interact with the Butterfly CMS API.

**Usage:**

```typescript
import api from '$lib/api';

// Using path
const posts = await api.get({ path: '/v1/posts' });
const next = await api.get({ path: posts.links.next });

// Using endpoint and ID
const post = await api.get({ endpoint: 'posts', id: 1 });

// With query parameters
const search = await api.get({
  endpoint: 'posts',
  query: { filter: { query: 'search query' } },
});

// With custom fetch options
const data = await client.get({
  endpoint: 'posts',
  signal: abortController.signal,
  intercept: (response) => console.log(response),
});
```

**Client methods:**

- `client.get<T>(options)` - Fetch data from Butterfly API
  - `path` - Full API path (e.g., `/v1/posts`)
  - `endpoint` - Endpoint name (e.g., `posts`, `authors`)
  - `id` - Resource ID
  - `query` - Query parameters object
  - `signal` - AbortSignal for cancellation
  - `intercept` - Function to intercept response
  - `fetch` - Custom fetch function

### Media URL Helper

**File**: `lib/getMediaUrl.ts`

Generates media URLs from Butterfly media objects. Automatically injects the media domain from environment variables.

**Usage:**

```typescript
import { getMediaUrl } from '$lib/getMediaUrl';

// Basic usage with format and width
const url = getMediaUrl({
  media: butterflyMedia,
  format: 'thumb',
  width: 800,
});

// With custom extension
const jpgUrl = getMediaUrl({
  media: imageMedia,
  format: 'cover',
  width: 1200,
  ext: 'jpg',
});

// Video with definition (required for .mp4)
const videoUrl = getMediaUrl({
  media: videoMedia,
  format: 'source',
  ext: 'mp4',
  definition: 'hd',
});

// Custom slug
const customUrl = getMediaUrl({
  media: butterflyMedia,
  format: 'square',
  width: 400,
  slug: 'avatar',
});
```

**Parameters:**

- `media` - Butterfly media object (required)
- `format` - Image/video format: `'default'`, `'source'`, `'thumb'`, `'square'`, `'cover'`, `'stories'` (default: `'default'`)
- `width` - Image width in pixels (for images)
- `ext` - File extension (e.g., `'jpg'`, `'png'`, `'webp'`, `png`, `'mp4'`, `'mp3'`)
- `slug` - URL slug (default: `'media'`)
- `definition` - Video definition (required for `.mp4` or `.mp3` formats: `'sd'`, `'hd'`.)

### HTTP Error Messages

**File**: `lib/httpErrors.ts`

User-friendly error messages for common HTTP status codes (400, 401, 403, 404, 410, 422, 429, 500, 503). Used in error pages throughout the application.

```typescript
import httpErrors from '$lib/httpErrors';
const message = httpErrors[404]; // "Oops! The page you're looking for wandered off 🕵️‍♂️"
```

### Breakpoints

**File**: `lib/breakpoints.js`

Responsive breakpoint values for media queries. Auto-generated during build.

```javascript
import { breakpoints } from '$lib/breakpoints';
// { sm: 600, md: 1008, lg: 1280 }
```

### JSON-LD Schema Generators

Located in `lib/JsonLD/`, these utilities generate structured data (Schema.org) for SEO:

- **`Article.ts`**: Generates Article/NewsArticle schema
- **`BreadcrumbList.ts`**: Generates breadcrumb navigation schema
- **`Organization.ts`**: Generates publisher organization schema
- **`ProfilePage.ts`**: Generates author profile schema
- **`WebPage.ts`**: Generates standard web page schema
- **`WebSite.ts`**: Generates website schema with search action
- **`FAQPage.ts`**: Generates standard FAQ page schema

Main entry point:

```typescript
import { generateJsonLd } from '$lib/JsonLD';

const schemas = generateJsonLd(pageData, ['WebPage', 'Article', 'BreadcrumbList']);
```

All these utilities are available throughout the app via the `$lib` alias.

## Components

### Layout Components

#### `Layout/Header.svelte`

Main site header with navigation menu.

#### `Layout/Footer.svelte`

Site footer with links and metadata.

#### `Layout/Categories.svelte`

Displays the category hierarchy.

#### `Modal.svelte`

Accessible modal with clickable backdrop (closes on direct backdrop click) and Escape key support.

Props:

- `open: boolean`
- `onClose?: () => void`
- `content: Snippet`

### Content Components

#### `Card.svelte`

Post card component for displaying articles.

**Props:**

- `post`: The Butterfly post data (required)
- `included`: Array of included resources from the API response (required)
- `width`: Image width (default: `380`)
- `heading`: Heading level `'h1'` to `'h4'` (default: `'h3'`)
- `format`: Image format `'default'`, `'source'`, `'thumb'`, `'square'`, `'cover'`, `'stories'` (default: `'thumb'`)
- `lazyload`: Enable lazy loading (default: `true`)
- `thumbnail`: Show thumbnail image (default: `true`)
- `resume`: Show post resume/description (default: `true`)
- `author`: Show author info (default: `true`)
- `date`: Show date info (default: `true`)
- `widths`: Array of image widths for responsive srcset (default: `[320, 480, 540]`)
- `sizes`: Sizes attribute for responsive images

**Usage:**

```svelte
<Card post={article} included={response.included} heading="h2" format="cover" />
```

**Customization:**

- Use `:global(.card)` in route styles or edit `src/assets/styles/_cards.scss`
- Image formats change the aspect ratio and display style

#### `Post/Body.svelte`

Renders a Butterfly post body (headings, paragraphs, lists, media, embeds, etc.).

- Recommended customization via `:global(.post--[element])` in `src/assets/styles/main.scss` (e.g., `.post--list`, `.post--quote`, `.post--youtube`).
- You can also edit individual element components, but global customization is preferred.

#### `Feed.svelte`

Wrapper component that displays post cards with loading skeleton states.

**Props:**

- `feed`: Promise or Butterfly API response containing posts (required)
- `length`: Number of skeleton cards to show while loading (default: `6`)
- `width`: Image width for cards (default: `380`)
- `format`: Image format (default: `'thumb'`)
- `heading`: Heading level (default: `'h3'`)
- `lazyloadAfter`: Index after which to lazy load images (default: `0`)
- `thumbnail`: Show thumbnail (default: `true`)
- `resume`: Show resume (default: `true`)
- `author`: Show author (default: `true`)
- `date`: Show date (default: `true`)
- `widths`: Image widths array
- `sizes`: Sizes attribute

**Usage:**

```svelte
<Feed feed={posts} length={9} lazyloadAfter={3} />
```

#### `Breadcrumb.svelte`

Displays a semantic breadcrumb trail based on `page.data` JSON-LD.

**Props:** None (reads from `page.data`)

**Usage:**

```svelte
<Breadcrumb />
```

Automatically generates from BreadcrumbList schema in page data.

#### `Pagination.svelte`

Handles pagination UI with optional infinite scroll support.

**Props:**

- `current`: Current page number (required)
- `max`: Maximum number of pages (required)
- `url`: Function that generates URL for a page number (default: `(page) => \`/?page=\${page}\``)
- `pad`: Number of pages to show before/after current (default: `2`)
- `label`: Button label for "load more" (default: `'Load more'`)
- `controls`: ARIA controls ID
- `onload`: Async function to load next page (returns `Promise<boolean>`)
- `next`: Whether there is a next page available
- `infiniteScroll`: Enable infinite scroll mode

**Usage:**

```svelte
<Pagination
  current={page}
  max={totalPages}
  url={(p) => `/articles?page=${p}`}
  onload={loadNextPage}
  next={hasMore}
/>
```

### Media Components

#### `Image.svelte`

Enhanced `<img>` component with lazy loading and responsive images.

**Props:**

- `media`: Butterfly media object
- `lazyload`: Enable lazy loading (default: `true`)
- `format`: Image format `'default'`, `'source'`, `'thumb'`, `'square'`, `'cover'`, `'stories'` (default: `'default'`)
- `width`: Base image width (default: `380`)
- `widths`: Array of widths for srcset (default: `[320, 480, 768, 990]`)
- `sizes`: Sizes attribute (default: `'100vw'`)
- `alt`: Alt text
- Additional standard `<img>` attributes

**Usage:**

```svelte
<Image
  media={article.media}
  format="thumb"
  width={540}
  widths={[400, 800, 1200]}
  sizes="(max-width: 768px) 100vw, 800px"
  alt={article.title}
/>
```

Automatically generates 2x versions and falls back to the default thumbnail image from `src/assets/images/thumb.jpg` if no media.

#### `Picture.svelte`

Advanced picture component with multiple sources for different breakpoints.

**Props:**

- `media`: Butterfly media object
- `lazyload`: Enable lazy loading (default: `true`)
- `format`: Image format (default: `'default'`)
- `width`: Base image width (default: `380`)
- `srcset`: Array of `{ query: string, width: number }` objects for responsive sources
- `alt`: Alt text

**Usage:**

```svelte
<Picture
  media={article.media}
  srcset={[
    { query: '(max-width: 768px)', width: 400 },
    { query: '(min-width: 769px)', width: 800 },
  ]}
  alt="Description"
/>
```

#### `Post/Elements/Video.svelte`

Minimal `<video>` wrapper with HD/SD sources and poster, no lazyload or custom player. Automatically picks HD/SD depending on network conditions (Network Information API when available).

## JSON-LD Schema Support

The boilerplate includes typed JSON-LD schemas using `schema-dts`:

- **WebPage** - Standard web page schema
  - **BreadcrumbList** - Navigation breadcrumbs
- **WebSite** - Site metadata
  - **SearchAction** - Search functionality
- **Organization** - Publisher information
- **Article / NewsArticle** - Article content
  - **Person** - Author information
  - **Organization** - Publisher
- **ProfilePage** - Author profile pages

### Adding Custom Schemas

1. Create a new schema file in `src/lib/JsonLD/`
2. Import it in `src/lib/JsonLD/index.ts`
3. Use it in your route's `+page.svelte`

## Google Tag Manager

GTM is integrated via the `GTM.svelte` component and automatically loads when `PUBLIC_GTM_ID` is configured.

### Data Layer

The following variables are automatically pushed to the data layer:

**Page Data:**

- `page.index`: Current page index (for pagination)
- `page.query`: Search query

**Content Data:**

- `content.type`: Content type (home, post, category, author, etc.)
- `content.id`: Content ID
- `content.group`: Content group/category
- `content.flags`: Content flags array
- `content.tags`: Content tags array

**App Data:**

- `app.version`: Package version + git commit
- `app.platform`: Node.js platform
- `app.env`: Environment name

### Custom Events

You can push custom events to the data layer:

```typescript
window.dataLayer.push({
  event: 'custom_event',
  // your custom properties
});
```

## Customization Examples

### Installing Custom Fonts

```bash
# Install the font
npm install -D @fontsource/inter

# Update main.scss
@use '@fontsource/inter';

@use '@enodo/foundation-css' with (
  $font-families: (
    sans: ('Inter', sans-serif)
  )
);
```

### Changing Colors

Edit `src/assets/styles/main.scss`:

```scss
$colors: (
  light: (
    /* neutral palette */
  ),
  primary: (
    'main': #3b82f6,
  ),
  // Your brand color
  accent: (
      'main': #f59e0b,
    ),
  // Accent color
  success: (
      'main': #10b981,
    ),
  // Success states
  error: (
      'main': #ef4444,
    ), // Error states
);
```

### Project-Type Color Suggestions

- **Blog/Magazine**: Professional blues + warm accent
- **Restaurant**: Warm reds/terracotta + golden yellow
- **Corporate**: Deep navy + teal
- **Creative**: Vibrant purple/magenta + lime
- **E-commerce**: Confident blue + attention orange
- **Healthcare**: Calming blue/teal + soft green

## Development Scripts

```bash
# Setup environment
npm run setup

# Development
npm run dev              # Start dev server
npm run check           # Type check
npm run check:watch     # Watch type checking

# Build
npm run build           # Production build
npm run preview         # Preview production build

# Testing
npm run test           # Run all tests
npm run test:unit      # Unit tests
npm run test:e2e       # E2E tests with Playwright

# Code Quality
npm run lint           # Lint code
npm run format         # Format code
```

## Contributing

This is the official Enodo boilerplate. For issues or questions:

- [Open an issue](https://github.com/enodo-io/sveltekit-butterfly-boilerplate/issues)
- [Butterfly Documentation](https://butterfly.enodo.app/docs)

## License

MIT © [Enodo](https://www.enodo.io)
