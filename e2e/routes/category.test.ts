import { expect, test } from '@playwright/test';
import { runAllSEOTests } from '../helpers/seo';
import { runAllAccessibilityTests } from '../helpers/accessibility';
import { getRandomCategory } from '../helpers/api';
import { hasJsonLd, hasJsonLdType } from '../helpers/jsonld';

test.describe('Category Page', () => {
  test('should load a random category', async ({ page }) => {
    const categoryPath = await getRandomCategory();

    if (!categoryPath) {
      test.skip();
      return;
    }

    await page.goto(categoryPath);
    await expect(page.locator('body')).toBeVisible();
  });

  test('should pass SEO tests on a random category', async ({ page }) => {
    const categoryPath = await getRandomCategory();

    if (!categoryPath) {
      test.skip();
      return;
    }

    await page.goto(categoryPath);

    const seoTests = await runAllSEOTests(page);

    for (const test of seoTests) {
      expect(test.passed, `${test.name} on ${categoryPath}: ${test.message}`).toBeTruthy();
    }
  });

  test('should pass accessibility tests', async ({ page }) => {
    const categoryPath = await getRandomCategory();

    if (!categoryPath) {
      test.skip();
      return;
    }

    await page.goto(categoryPath);

    const a11yTests = await runAllAccessibilityTests(page);

    for (const test of a11yTests) {
      expect(test.passed, `${test.name}: ${test.message}`).toBeTruthy();
    }
  });

  test('should have JSON-LD structured data', async ({ page }) => {
    const categoryPath = await getRandomCategory();

    if (!categoryPath) {
      test.skip();
      return;
    }

    await page.goto(categoryPath);
    const hasJsonLdData = await hasJsonLd(page);
    expect(hasJsonLdData, `JSON-LD should exist on ${categoryPath}`).toBe(true);
  });

  test('should have WebPage in JSON-LD', async ({ page }) => {
    const categoryPath = await getRandomCategory();

    if (!categoryPath) {
      test.skip();
      return;
    }

    await page.goto(categoryPath);
    const hasWebPage = await hasJsonLdType(page, 'WebPage');
    expect(hasWebPage).toBe(true);
  });

  test('should have BreadcrumbList in JSON-LD', async ({ page }) => {
    const categoryPath = await getRandomCategory();

    if (!categoryPath) {
      test.skip();
      return;
    }

    await page.goto(categoryPath);
    const hasBreadcrumbList = await hasJsonLdType(page, 'BreadcrumbList');
    expect(hasBreadcrumbList, `BreadcrumbList should exist on ${categoryPath}`).toBe(true);
  });
});
