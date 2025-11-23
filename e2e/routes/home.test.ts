import { expect, test } from '@playwright/test';
import { runAllSEOTests } from '../helpers/seo';
import { runAllAccessibilityTests } from '../helpers/accessibility';
import { hasJsonLd, hasJsonLdType } from '../helpers/jsonld';

test.describe('Home Page', () => {
  test('should load', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should pass SEO tests', async ({ page }) => {
    await page.goto('/');

    const seoTests = await runAllSEOTests(page);

    for (const test of seoTests) {
      expect(test.passed, `${test.name}: ${test.message}`).toBeTruthy();
    }
  });

  test('should pass accessibility tests', async ({ page }) => {
    await page.goto('/');

    const a11yTests = await runAllAccessibilityTests(page);

    for (const test of a11yTests) {
      expect(test.passed, `${test.name}: ${test.message}`).toBeTruthy();
    }
  });

  test('should have JSON-LD structured data', async ({ page }) => {
    await page.goto('/');
    const hasJsonLdData = await hasJsonLd(page);
    expect(hasJsonLdData).toBe(true);
  });

  test('should have WebSite in JSON-LD', async ({ page }) => {
    await page.goto('/');
    const hasWebSite = await hasJsonLdType(page, 'WebSite');
    expect(hasWebSite).toBe(true);
  });
});
