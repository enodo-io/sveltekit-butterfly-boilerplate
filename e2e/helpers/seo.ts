import type { Page } from '@playwright/test';

interface SEOTestResult {
  passed: boolean;
  message: string;
}

export async function testHtmlLang(page: Page): Promise<SEOTestResult> {
  const htmlLang = await page.getAttribute('html', 'lang');

  if (!htmlLang) {
    return { passed: false, message: 'HTML element missing lang attribute' };
  }

  if (typeof htmlLang !== 'string' || htmlLang.trim() === '') {
    return { passed: false, message: 'HTML lang attribute is empty' };
  }

  return { passed: true, message: `HTML lang is "${htmlLang}"` };
}

export async function testHasH1(page: Page): Promise<SEOTestResult> {
  const h1Count = await page.locator('h1').count();

  if (h1Count === 0) {
    return { passed: false, message: 'Page is missing an H1 element' };
  }

  if (h1Count > 1) {
    return { passed: false, message: `Page has ${h1Count} H1 elements (should be 1)` };
  }

  return { passed: true, message: 'Page has exactly 1 H1 element' };
}

export async function testOgLocale(page: Page): Promise<SEOTestResult> {
  const ogLocale = await page.locator('meta[property="og:locale"]').getAttribute('content');

  if (!ogLocale) {
    return { passed: false, message: 'Missing og:locale meta tag' };
  }

  // Validate locale format (e.g., en_US, fr_FR, etc.)
  const localePattern = /^[a-z]{2}_[A-Z]{2}$/;
  if (!localePattern.test(ogLocale)) {
    return { passed: false, message: `Invalid og:locale format: "${ogLocale}"` };
  }

  return { passed: true, message: `og:locale is valid: "${ogLocale}"` };
}

export async function testOgSiteName(page: Page): Promise<SEOTestResult> {
  const ogSiteName = await page.locator('meta[property="og:site_name"]').getAttribute('content');

  if (!ogSiteName) {
    return { passed: false, message: 'Missing og:site_name meta tag' };
  }

  if (ogSiteName.trim() === '') {
    return { passed: false, message: 'og:site_name is empty' };
  }

  return { passed: true, message: `og:site_name: "${ogSiteName}"` };
}

export async function testTitle(page: Page): Promise<SEOTestResult> {
  const title = await page.locator('title').textContent();

  if (!title) {
    return { passed: false, message: 'Missing <title> tag' };
  }

  if (title.trim() === '') {
    return { passed: false, message: '<title> is empty' };
  }

  return { passed: true, message: `Title: "${title.trim()}"` };
}

export async function testOgTitle(page: Page): Promise<SEOTestResult> {
  const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');

  if (!ogTitle) {
    return { passed: false, message: 'Missing og:title meta tag' };
  }

  if (ogTitle.trim() === '') {
    return { passed: false, message: 'og:title is empty' };
  }

  return { passed: true, message: `og:title: "${ogTitle.trim()}"` };
}

export async function testMetaDescription(page: Page): Promise<SEOTestResult> {
  const metaDesc = await page.locator('meta[name="description"]').getAttribute('content');

  if (!metaDesc) {
    return { passed: false, message: 'Missing meta description' };
  }

  if (metaDesc.trim() === '') {
    return { passed: false, message: 'Meta description is empty' };
  }

  return { passed: true, message: `Meta description present (${metaDesc.length} chars)` };
}

export async function testOgDescription(page: Page): Promise<SEOTestResult> {
  const ogDesc = await page.locator('meta[property="og:description"]').getAttribute('content');

  if (!ogDesc) {
    return { passed: false, message: 'Missing og:description meta tag' };
  }

  if (ogDesc.trim() === '') {
    return { passed: false, message: 'og:description is empty' };
  }

  return { passed: true, message: `og:description present (${ogDesc.length} chars)` };
}

export async function testCanonical(page: Page): Promise<SEOTestResult> {
  const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');

  if (!canonical) {
    return { passed: false, message: 'Missing canonical link' };
  }

  if (canonical.trim() === '') {
    return { passed: false, message: 'Canonical URL is empty' };
  }

  return { passed: true, message: `Canonical: "${canonical}"` };
}

export async function testOgUrl(page: Page): Promise<SEOTestResult> {
  const ogUrl = await page.locator('meta[property="og:url"]').getAttribute('content');

  if (!ogUrl) {
    return { passed: false, message: 'Missing og:url meta tag' };
  }

  if (ogUrl.trim() === '') {
    return { passed: false, message: 'og:url is empty' };
  }

  return { passed: true, message: `og:url: "${ogUrl}"` };
}

export async function testOgImage(page: Page): Promise<SEOTestResult> {
  const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');

  if (!ogImage) {
    return { passed: false, message: 'Missing og:image meta tag' };
  }

  if (ogImage.trim() === '') {
    return { passed: false, message: 'og:image is empty' };
  }

  return { passed: true, message: `og:image: "${ogImage}"` };
}

export async function testOgType(page: Page): Promise<SEOTestResult> {
  const ogType = await page.locator('meta[property="og:type"]').getAttribute('content');

  if (!ogType) {
    return { passed: false, message: 'Missing og:type meta tag' };
  }

  if (ogType.trim() === '') {
    return { passed: false, message: 'og:type is empty' };
  }

  return { passed: true, message: `og:type: "${ogType}"` };
}

export async function testJsonLd(page: Page): Promise<SEOTestResult> {
  const jsonLdElements = await page.locator('script[type="application/ld+json"]').count();

  if (jsonLdElements === 0) {
    return { passed: false, message: 'Missing JSON-LD structured data' };
  }

  // Validate JSON-LD
  for (let i = 0; i < jsonLdElements; i++) {
    const jsonContent = await page
      .locator('script[type="application/ld+json"]')
      .nth(i)
      .textContent();

    if (!jsonContent) {
      return { passed: false, message: `JSON-LD element ${i + 1} is empty` };
    }

    try {
      JSON.parse(jsonContent);
    } catch {
      return { passed: false, message: `JSON-LD element ${i + 1} has invalid JSON` };
    }
  }

  return { passed: true, message: `Valid JSON-LD found (${jsonLdElements} element(s))` };
}

export async function testPreloadLinks(page: Page): Promise<SEOTestResult> {
  // Get all img tags that are NOT lazy loaded
  const nonLazyImages = await page.locator('img:not([loading="lazy"])').all();

  const missingPreloads: string[] = [];

  for (const img of nonLazyImages) {
    const src = await img.getAttribute('src');

    if (!src) continue;

    // Skip inline data URIs
    if (src.startsWith('data:')) {
      continue;
    }

    // Skip thumb.jpg (now in assets, may have hash in filename)
    if (src?.includes('thumb.jpg')) {
      continue;
    }

    // Skip SVG files (small and fast to load)
    if (src.endsWith('.svg') || src.includes('.svg')) {
      continue;
    }

    // Skip favicon and small icons
    if (src.includes('favicon') || src.includes('logo-88x31')) {
      continue;
    }

    // Skip small assets
    if (src.includes('/_app/immutable/assets/')) {
      continue;
    }

    // Check if there's a corresponding preload link
    const hasPreload =
      (await page.locator(`link[rel="preload"][as="image"][href="${src}"]`).count()) > 0;

    if (!hasPreload) {
      missingPreloads.push(src);
    }
  }

  if (missingPreloads.length > 0) {
    return {
      passed: false,
      message: `Missing preload links for ${missingPreloads.length} image(s): ${missingPreloads.slice(0, 3).join(', ')}${missingPreloads.length > 3 ? '...' : ''}`,
    };
  }

  return { passed: true, message: 'All non-lazy images have preload links' };
}

export async function runAllSEOTests(page: Page): Promise<Array<SEOTestResult & { name: string }>> {
  return [
    { name: 'HTML lang', ...(await testHtmlLang(page)) },
    { name: 'Has H1', ...(await testHasH1(page)) },
    { name: 'og:locale', ...(await testOgLocale(page)) },
    { name: 'og:site_name', ...(await testOgSiteName(page)) },
    { name: '<title>', ...(await testTitle(page)) },
    { name: 'og:title', ...(await testOgTitle(page)) },
    { name: 'meta description', ...(await testMetaDescription(page)) },
    { name: 'og:description', ...(await testOgDescription(page)) },
    { name: 'canonical', ...(await testCanonical(page)) },
    { name: 'og:url', ...(await testOgUrl(page)) },
    { name: 'og:image', ...(await testOgImage(page)) },
    { name: 'og:type', ...(await testOgType(page)) },
    { name: 'JSON-LD', ...(await testJsonLd(page)) },
    { name: 'preload links', ...(await testPreloadLinks(page)) },
  ];
}
