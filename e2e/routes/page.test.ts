import { expect, test } from '@playwright/test';
import { runAllSEOTests } from '../helpers/seo';
import { runAllAccessibilityTests } from '../helpers/accessibility';
import { getRandomStaticPage } from '../helpers/api';
import { hasJsonLd, hasJsonLdType } from '../helpers/jsonld';

test.describe('Static Page', () => {
  test('should load a random static page', async ({ page }) => {
    const pageSlug = getRandomStaticPage();

    if (!pageSlug) {
      test.skip();
      return;
    }

    await page.goto(`/${pageSlug}.html`);
    await expect(page.locator('body')).toBeVisible();
  });

  test('should pass SEO tests on a random static page', async ({ page }) => {
    const pageSlug = getRandomStaticPage();

    if (!pageSlug) {
      test.skip();
      return;
    }

    await page.goto(`/${pageSlug}.html`);

    const seoTests = await runAllSEOTests(page);

    for (const test of seoTests) {
      expect(test.passed, `${test.name} on /${pageSlug}.html: ${test.message}`).toBeTruthy();
    }
  });

  test('should pass accessibility tests', async ({ page }) => {
    const pageSlug = getRandomStaticPage();

    if (!pageSlug) {
      test.skip();
      return;
    }

    await page.goto(`/${pageSlug}.html`);

    const a11yTests = await runAllAccessibilityTests(page);

    for (const test of a11yTests) {
      expect(test.passed, `${test.name}: ${test.message}`).toBeTruthy();
    }
  });

  test('should have JSON-LD structured data', async ({ page }) => {
    const pageSlug = getRandomStaticPage();

    if (!pageSlug) {
      test.skip();
      return;
    }

    await page.goto(`/${pageSlug}.html`);
    const hasJsonLdData = await hasJsonLd(page);
    expect(hasJsonLdData, `JSON-LD should exist on /${pageSlug}.html`).toBe(true);
  });

  test('should have WebPage in JSON-LD', async ({ page }) => {
    const pageSlug = getRandomStaticPage();

    if (!pageSlug) {
      test.skip();
      return;
    }

    await page.goto(`/${pageSlug}.html`);
    const hasWebPage = await hasJsonLdType(page, 'WebPage');
    expect(hasWebPage).toBe(true);
  });

  test('should have BreadcrumbList in JSON-LD', async ({ page }) => {
    const pageSlug = getRandomStaticPage();

    if (!pageSlug) {
      test.skip();
      return;
    }

    await page.goto(`/${pageSlug}.html`);
    const hasBreadcrumbList = await hasJsonLdType(page, 'BreadcrumbList');
    expect(hasBreadcrumbList, `BreadcrumbList should exist on /${pageSlug}.html`).toBe(true);
  });
});
