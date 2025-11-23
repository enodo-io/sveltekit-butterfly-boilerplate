import { expect, test } from '@playwright/test';
import { getRandomPost } from '../helpers/api';
import { runAllSEOTests } from '../helpers/seo';
import { runAllAccessibilityTests } from '../helpers/accessibility';
import { hasJsonLd, hasJsonLdType } from '../helpers/jsonld';

test.describe('Post Page', () => {
  test('should load a random post', async ({ page }) => {
    const post = await getRandomPost();

    if (!post || !post.slug || !post.id) {
      test.skip();
      return;
    }

    await page.goto(`/${post.slug}-${post.id}.html`);
    await expect(page.locator('body')).toBeVisible();
  });

  test('should pass SEO tests on a random post', async ({ page }) => {
    const post = await getRandomPost();

    if (!post || !post.slug || !post.id) {
      test.skip();
      return;
    }

    await page.goto(`/${post.slug}-${post.id}.html`);

    const seoTests = await runAllSEOTests(page);

    for (const test of seoTests) {
      expect(
        test.passed,
        `${test.name} on /${post.slug}-${post.id}.html: ${test.message}`,
      ).toBeTruthy();
    }
  });

  test('should pass accessibility tests', async ({ page }) => {
    const post = await getRandomPost();

    if (!post || !post.slug || !post.id) {
      test.skip();
      return;
    }

    await page.goto(`/${post.slug}-${post.id}.html`);

    const a11yTests = await runAllAccessibilityTests(page);

    for (const test of a11yTests) {
      expect(test.passed, `${test.name}: ${test.message}`).toBeTruthy();
    }
  });

  test('should have JSON-LD structured data', async ({ page }) => {
    const post = await getRandomPost();

    if (!post || !post.slug || !post.id) {
      test.skip();
      return;
    }

    await page.goto(`/${post.slug}-${post.id}.html`);
    const hasJsonLdData = await hasJsonLd(page);
    expect(hasJsonLdData, `JSON-LD should exist on /${post.slug}-${post.id}.html`).toBe(true);
  });

  test('should have BreadcrumbList in JSON-LD', async ({ page }) => {
    const post = await getRandomPost();

    if (!post || !post.slug || !post.id) {
      test.skip();
      return;
    }

    await page.goto(`/${post.slug}-${post.id}.html`);
    const hasBreadcrumbList = await hasJsonLdType(page, 'BreadcrumbList');
    expect(hasBreadcrumbList, `BreadcrumbList should exist on /${post.slug}-${post.id}.html`).toBe(
      true,
    );
  });

  test('should have Article, NewsArticle, BlogPosting, or FAQPage in JSON-LD', async ({ page }) => {
    const post = await getRandomPost();

    if (!post || !post.slug || !post.id) {
      test.skip();
      return;
    }

    await page.goto(`/${post.slug}-${post.id}.html`);

    const hasArticle = await hasJsonLdType(page, 'Article');
    const hasNewsArticle = await hasJsonLdType(page, 'NewsArticle');
    const hasBlogPosting = await hasJsonLdType(page, 'BlogPosting');
    const hasFAQPage = await hasJsonLdType(page, 'FAQPage');

    const hasArticleType = hasArticle || hasNewsArticle || hasBlogPosting || hasFAQPage;

    expect(
      hasArticleType,
      `Article, NewsArticle, BlogPosting, or FAQPage should exist on /${post.slug}-${post.id}.html`,
    ).toBe(true);
  });

  test('should have correct og:type', async ({ page }) => {
    const post = await getRandomPost();

    if (!post || !post.slug || !post.id) {
      test.skip();
      return;
    }

    await page.goto(`/${post.slug}-${post.id}.html`);

    // Check og:type
    const ogType = await page.locator('meta[property="og:type"]').getAttribute('content');
    expect(ogType).toBe('article');
  });
});
