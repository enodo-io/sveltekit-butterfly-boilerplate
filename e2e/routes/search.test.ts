import { expect, test } from '@playwright/test';
import { runAllSEOTests } from '../helpers/seo';
import { runAllAccessibilityTests } from '../helpers/accessibility';
import { hasJsonLd, hasJsonLdType } from '../helpers/jsonld';

test.describe('Search Page', () => {
  test('should load', async ({ page }) => {
    await page.goto('/search');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should pass SEO tests', async ({ page }) => {
    await page.goto('/search');

    const seoTests = await runAllSEOTests(page);

    for (const test of seoTests) {
      expect(test.passed, `${test.name}: ${test.message}`).toBeTruthy();
    }
  });

  test('should pass accessibility tests', async ({ page }) => {
    await page.goto('/search');

    const a11yTests = await runAllAccessibilityTests(page);

    for (const test of a11yTests) {
      expect(test.passed, `${test.name}: ${test.message}`).toBeTruthy();
    }
  });

  test('should have JSON-LD structured data', async ({ page }) => {
    await page.goto('/search');
    const hasJsonLdData = await hasJsonLd(page);
    expect(hasJsonLdData).toBe(true);
  });

  test('should have WebPage in JSON-LD', async ({ page }) => {
    await page.goto('/search');
    const hasWebPage = await hasJsonLdType(page, 'WebPage');
    expect(hasWebPage).toBe(true);
  });

  test('should have BreadcrumbList in JSON-LD', async ({ page }) => {
    await page.goto('/search');
    const hasBreadcrumbList = await hasJsonLdType(page, 'BreadcrumbList');
    expect(hasBreadcrumbList).toBe(true);
  });
});
