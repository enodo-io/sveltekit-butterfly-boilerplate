import { expect, test } from '@playwright/test';
import { runAllSEOTests } from '../helpers/seo';
import { getRandomAuthor } from '../helpers/api';
import { runAllAccessibilityTests } from '../helpers/accessibility';
import { hasJsonLd, hasJsonLdType } from '../helpers/jsonld';

test.describe('Author Page', () => {
  test('should load a random author', async ({ page }) => {
    const authorId = await getRandomAuthor();

    if (!authorId) {
      test.skip();
      return;
    }

    await page.goto(`/authors/${authorId}`);
    await expect(page.locator('body')).toBeVisible();
  });

  test('should pass SEO tests on a random author', async ({ page }) => {
    const authorId = await getRandomAuthor();

    if (!authorId) {
      test.skip();
      return;
    }

    await page.goto(`/authors/${authorId}`);

    const seoTests = await runAllSEOTests(page);

    for (const test of seoTests) {
      expect(test.passed, `${test.name} on /authors/${authorId}: ${test.message}`).toBeTruthy();
    }
  });

  test('should pass accessibility tests', async ({ page }) => {
    const authorId = await getRandomAuthor();

    if (!authorId) {
      test.skip();
      return;
    }

    await page.goto(`/authors/${authorId}`);

    const a11yTests = await runAllAccessibilityTests(page);

    for (const test of a11yTests) {
      expect(test.passed, `${test.name}: ${test.message}`).toBeTruthy();
    }
  });

  test('should have JSON-LD structured data', async ({ page }) => {
    const authorId = await getRandomAuthor();

    if (!authorId) {
      test.skip();
      return;
    }

    await page.goto(`/authors/${authorId}`);
    const hasJsonLdData = await hasJsonLd(page);
    expect(hasJsonLdData, `JSON-LD should exist on /authors/${authorId}`).toBe(true);
  });

  test('should have ProfilePage in JSON-LD', async ({ page }) => {
    const authorId = await getRandomAuthor();

    if (!authorId) {
      test.skip();
      return;
    }

    await page.goto(`/authors/${authorId}`);
    const hasProfilePage = await hasJsonLdType(page, 'ProfilePage');
    expect(hasProfilePage).toBe(true);
  });

  test('should have BreadcrumbList in JSON-LD', async ({ page }) => {
    const authorId = await getRandomAuthor();

    if (!authorId) {
      test.skip();
      return;
    }

    await page.goto(`/authors/${authorId}`);
    const hasBreadcrumbList = await hasJsonLdType(page, 'BreadcrumbList');
    expect(hasBreadcrumbList, `BreadcrumbList should exist on /authors/${authorId}`).toBe(true);
  });
});
