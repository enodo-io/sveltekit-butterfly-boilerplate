/**
 * Quality gate on the rendered pages (SSR HTML, the real API of `.env`):
 *
 * 1. valid, semantic HTML: html-validate (recommended + a11y presets) on the raw
 *    server response, what crawlers get — block content in <a>/<button>, list
 *    children, unknown elements, missing alt / iframe title / button type,
 *    unnamed landmarks, duplicate ids…
 * 2. the SEO head contract: canonical = og:url (absolute), absolute og:image,
 *    max-image-preview:large unless noindex, twitter:card, `article:*` (never
 *    `og:article:*`), JSON-LD that parses, one h1, no heading level skip, at
 *    most one high-priority image;
 * 3. axe-core (WCAG 2.x A/AA + best practices) in a real browser, also with the
 *    mobile menu and the media viewer open.
 *
 * The pages are picked from the API: home, listings, a category, a tag, an
 * author, the static pages, search, and the post whose body uses the most block
 * types (the "kitchen sink").
 */
import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { HtmlValidate } from 'html-validate';
import { Client } from '@enodo/butterfly-ts';
import type * as Butterfly from '@enodo/butterfly-ts';

const client = new Client({
  domain: process.env.PUBLIC_API_URL!,
  publicKey: process.env.PUBLIC_API_KEY,
});

let pages: string[] = [];
let kitchenSink: string | undefined;

test.beforeAll(async () => {
  const [categories, tags, authors, posts] = await Promise.all([
    client.get<Butterfly.Category[]>({ endpoint: 'categories', query: { page: { size: 100 } } }),
    client.get<Butterfly.Term[]>({
      endpoint: 'taxonomies/tags/relationships/terms',
      query: { page: { size: 1 } },
    }),
    client.get<Butterfly.Author[]>({ endpoint: 'authors', query: { page: { size: 1 } } }),
    client.get<Butterfly.Post[]>({
      endpoint: 'posts',
      query: { filter: { types: '-page' }, page: { size: 50 } },
    }),
  ]);

  // the post using the most distinct body block types (the lists carry no body:
  // the 20 latest posts are fetched one by one)
  const full = await Promise.all(
    posts.data.slice(0, 20).map((p) => client.get<Butterfly.Post>({ endpoint: 'posts', id: p.id })),
  );
  const blockTypes = (p: Butterfly.Post) =>
    new Set(((p.attributes.body || []) as { type: string }[]).map((x) => x.type)).size;
  const richest = full.map((r) => r.data).sort((a, b) => blockTypes(b) - blockTypes(a))[0];
  kitchenSink = richest ? `/${richest.attributes.slug}-${richest.id}.html` : undefined;

  const deepest = [...categories.data].sort(
    (a, b) => b.attributes.path.split('/').length - a.attributes.path.split('/').length,
  )[0];
  const word = posts.data[0]?.attributes.title.split(/\s+/)[0];
  const staticPages = Object.keys(JSON.parse(process.env.PUBLIC_STATIC_PAGES || '{}'));

  pages = [
    '/',
    '/articles',
    '/tags',
    '/authors',
    '/rss.html',
    ...(word ? [`/search?query=${encodeURIComponent(word)}`] : []),
    ...(categories.data[0] ? [categories.data[0].attributes.path] : []),
    ...(deepest && deepest !== categories.data[0] ? [deepest.attributes.path] : []),
    ...(tags.data[0] ? [`/tags/${tags.data[0].id}`] : []),
    ...(authors.data[0] ? [`/authors/${authors.data[0].id}`] : []),
    ...staticPages.map((slug) => `/${slug}.html`),
    ...(kitchenSink ? [kitchenSink] : []),
    ...(posts.data[1] ? [`/${posts.data[1].attributes.slug}-${posts.data[1].id}.html`] : []),
  ];
});

test('HTML is valid and semantic (html-validate)', async ({ request }) => {
  test.setTimeout(120_000);
  const validator = new HtmlValidate({
    extends: ['html-validate:recommended', 'html-validate:a11y'],
    rules: {
      // formatting choices of the Svelte output, not semantics
      'no-inline-style': 'off',
      'void-style': 'off',
      'attribute-boolean-style': 'off',
      'attribute-empty-style': 'off',
      'no-trailing-whitespace': 'off',
      'doctype-style': 'off',
      'no-raw-characters': 'off',
      'long-title': 'off',
    },
  });

  for (const path of pages) {
    const response = await request.get(path);
    expect.soft(response.status(), path).toBe(200);
    const report = await validator.validateString(await response.text(), path);
    const messages = report.results.flatMap((r) =>
      r.messages.map(
        (m) => `${path} ${m.line}:${m.column} [${m.ruleId}] ${m.message} (${m.selector})`,
      ),
    );
    expect.soft(messages, `${path} must be valid HTML`).toEqual([]);
  }
});

async function headContract(page: Page) {
  return page.evaluate(() => {
    const meta = (sel: string) => document.querySelector(sel)?.getAttribute('content') || '';
    const problems: string[] = [];
    const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href') || '';
    const ogUrl = meta('meta[property="og:url"]');
    const robots = meta('meta[name="robots"]');
    const absolute = (u: string) => /^https?:\/\//.test(u);

    if (!absolute(canonical)) problems.push(`canonical not absolute: "${canonical}"`);
    if (canonical !== ogUrl) problems.push(`canonical ${canonical} != og:url ${ogUrl}`);
    if (!absolute(meta('meta[property="og:image"]'))) problems.push('og:image not absolute');
    if (!robots.includes('noindex') && !robots.includes('max-image-preview:large'))
      problems.push(`robots without max-image-preview:large: "${robots}"`);
    if (!meta('meta[name="twitter:card"]')) problems.push('no twitter:card');
    if (!meta('meta[name="description"]')) problems.push('no meta description');
    if (document.querySelector('meta[property^="og:article:"]'))
      problems.push('og:article:* used (the namespace is article:*)');

    document.querySelectorAll('script[type="application/ld+json"]').forEach((s, i) => {
      try {
        JSON.parse(s.textContent || '');
      } catch {
        problems.push(`JSON-LD #${i} does not parse`);
      }
    });

    const h1 = document.querySelectorAll('h1').length;
    if (h1 !== 1) problems.push(`${h1} h1`);
    let previous = 0;
    document.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((h) => {
      const level = Number(h.tagName[1]);
      if (previous && level > previous + 1)
        problems.push(`heading skip h${previous} -> h${level} ("${h.textContent?.trim()}")`);
      previous = level;
    });

    const high = document.querySelectorAll('img[fetchpriority="high"]').length;
    if (high > 1) problems.push(`${high} images with fetchpriority="high" (one LCP image)`);
    return problems;
  });
}

test('SEO head contract', async ({ page }) => {
  test.setTimeout(120_000);
  for (const path of pages) {
    await page.goto(path);
    expect.soft(await headContract(page), path).toEqual([]);
  }
});

// third-party content is not ours to fix: embedded players and the social
// widgets (their markup and colours come from the provider), raw CMS embeds
const THIRD_PARTY = [
  'iframe',
  '.post--embed',
  'blockquote.twitter-tweet',
  'blockquote.tiktok-embed',
  'blockquote.instagram-media',
  '.fb-post',
];

const axe = (page: Page) => {
  // frames are third-party documents: not analysed (iframes: false); each
  // selector excluded on its own (an array would be read as a path into frames)
  const builder = new AxeBuilder({ page }).options({ iframes: false });
  THIRD_PARTY.forEach((selector) => builder.exclude(selector));
  return builder.withTags([
    'wcag2a',
    'wcag2aa',
    'wcag21a',
    'wcag21aa',
    'wcag22aa',
    'best-practice',
  ]);
};

const violations = (results: Awaited<ReturnType<AxeBuilder['analyze']>>) =>
  results.violations.map(
    (v) => `[${v.id}] ${v.help}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`,
  );

test('accessibility (axe-core)', async ({ page }) => {
  test.setTimeout(180_000);
  for (const path of pages) {
    // hydrated page (not networkidle: embeds and analytics keep the network busy)
    await page.goto(path, { waitUntil: 'load' });
    expect.soft(violations(await axe(page).analyze()), path).toEqual([]);
  }
});

test('accessibility with the mobile menu open (axe-core)', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Menu' }).click();
  await expect(page.locator('#menu')).toBeVisible();
  // the menu fades in: measured once fully opaque
  await page
    .locator('#menu')
    .evaluate((el) => Promise.all(el.getAnimations({ subtree: true }).map((a) => a.finished)));
  expect(violations(await axe(page).include('#menu').analyze())).toEqual([]);
});

test('accessibility with the media viewer open (axe-core)', async ({ page }) => {
  test.skip(!kitchenSink, 'no post in the API');
  await page.goto(kitchenSink!);
  const enlarge = page.locator('.post--gallery button').first();
  test.skip((await enlarge.count()) === 0, 'no gallery in the richest post');
  await enlarge.click();
  await expect(page.locator('dialog[open]')).toBeVisible();
  await page
    .locator('dialog[open]')
    .evaluate((el) => Promise.all(el.getAnimations({ subtree: true }).map((a) => a.finished)));
  expect(violations(await axe(page).include('dialog[open]').analyze())).toEqual([]);
});
