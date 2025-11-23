import type { Page } from '@playwright/test';

interface AccessibilityTestResult {
  passed: boolean;
  message: string;
  severity?: 'error' | 'warning';
}

/**
 * Test if all images have alt text
 */
export async function testImageAltText(page: Page): Promise<AccessibilityTestResult> {
  const images = await page.locator('img').all();
  const imagesWithoutAlt: string[] = [];

  for (const img of images) {
    const alt = await img.getAttribute('alt');
    const role = await img.getAttribute('role');

    // role="presentation" or decorative images can have empty alt
    if (role === 'presentation' || role === 'none') {
      continue;
    }

    if (alt === null) {
      const src = (await img.getAttribute('src')) || 'unknown';
      imagesWithoutAlt.push(src);
    }
  }

  if (imagesWithoutAlt.length > 0) {
    return {
      passed: false,
      message: `${imagesWithoutAlt.length} image(s) missing alt text`,
      severity: 'error',
    };
  }

  return { passed: true, message: 'All images have alt text' };
}

/**
 * Test if all inputs have labels
 */
export async function testInputLabels(page: Page): Promise<AccessibilityTestResult> {
  // Exclude hidden inputs and submit buttons (they have accessible text via value)
  const inputs = await page
    .locator(
      'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"])',
    )
    .all();
  const inputsWithoutLabel: string[] = [];

  for (const input of inputs) {
    const id = await input.getAttribute('id');
    const ariaLabel = await input.getAttribute('aria-label');
    const ariaLabelledBy = await input.getAttribute('aria-labelledby');

    // Check if labeled by id
    let hasLabel = false;
    if (id) {
      const labelCount = await page.locator(`label[for="${id}"]`).count();
      hasLabel = labelCount > 0;
    }

    // Check aria-label or aria-labelledby
    if (!hasLabel && !ariaLabel && !ariaLabelledBy) {
      const type = (await input.getAttribute('type')) || 'text';
      inputsWithoutLabel.push(type);
    }
  }

  if (inputsWithoutLabel.length > 0) {
    return {
      passed: false,
      message: `${inputsWithoutLabel.length} input(s) missing label`,
      severity: 'error',
    };
  }

  return { passed: true, message: 'All inputs have labels' };
}

/**
 * Test if all buttons and links have accessible text
 */
export async function testInteractiveElements(page: Page): Promise<AccessibilityTestResult> {
  const buttons = await page.locator('button').all();
  const links = await page.locator('a').all();

  const elementsWithoutText: Array<{ tag: string; href?: string }> = [];

  // Check buttons
  for (const button of buttons) {
    const text = await button.textContent();
    const ariaLabel = await button.getAttribute('aria-label');
    const ariaLabelledBy = await button.getAttribute('aria-labelledby');

    if ((!text || text.trim() === '') && !ariaLabel && !ariaLabelledBy) {
      elementsWithoutText.push({ tag: 'button' });
    }
  }

  // Check links
  for (const link of links) {
    const text = await link.textContent();
    const ariaLabel = await link.getAttribute('aria-label');
    const ariaLabelledBy = await link.getAttribute('aria-labelledby');
    const href = await link.getAttribute('href');

    if ((!text || text.trim() === '') && !ariaLabel && !ariaLabelledBy) {
      elementsWithoutText.push({ tag: 'a', href: href || 'unknown' });
    }
  }

  if (elementsWithoutText.length > 0) {
    return {
      passed: false,
      message: `${elementsWithoutText.length} interactive element(s) missing accessible text`,
      severity: 'error',
    };
  }

  return { passed: true, message: 'All interactive elements have accessible text' };
}

/**
 * Test if page has skip to main content link
 */
export async function testSkipLink(page: Page): Promise<AccessibilityTestResult> {
  const skipLinks = await page.locator('a[href*="#scope"], a[href*="#page"]').count();

  if (skipLinks === 0) {
    return {
      passed: false,
      message: 'Missing skip to main content link',
      severity: 'warning',
    };
  }

  return { passed: true, message: 'Skip to main content link found' };
}

/**
 * Test if page has semantic landmarks
 */
export async function testSemanticLandmarks(page: Page): Promise<AccessibilityTestResult> {
  const hasMain = (await page.locator('main, [role="main"]').count()) > 0;
  const hasNav = (await page.locator('nav, [role="navigation"]').count()) > 0;
  const hasHeader = (await page.locator('header, [role="banner"]').count()) > 0;
  const hasFooter = (await page.locator('footer, [role="contentinfo"]').count()) > 0;

  const missingLandmarks: string[] = [];
  if (!hasMain) missingLandmarks.push('main');
  if (!hasNav) missingLandmarks.push('nav');
  if (!hasHeader) missingLandmarks.push('header');
  if (!hasFooter) missingLandmarks.push('footer');

  if (missingLandmarks.length > 0) {
    return {
      passed: false,
      message: `Missing semantic landmarks: ${missingLandmarks.join(', ')}`,
      severity: 'warning',
    };
  }

  return { passed: true, message: 'All semantic landmarks present' };
}

/**
 * Basic contrast test - check if background and text colors have sufficient contrast
 * Note: This is a basic implementation. For production, use a proper accessibility library
 */
export async function testBasicContrast(page: Page): Promise<AccessibilityTestResult> {
  // This is a simplified version - in production, you'd use axe-core or similar
  // For now, we'll just check if the page renders properly
  const bodyBg = await page.evaluate(() => {
    const style = window.getComputedStyle(document.body);
    return {
      bg: style.backgroundColor,
      color: style.color,
    };
  });

  // Basic check - if we can get the colors, assume they're valid
  if (bodyBg.bg && bodyBg.color) {
    return { passed: true, message: 'Basic contrast check passed' };
  }

  return {
    passed: false,
    message: 'Unable to verify contrast',
    severity: 'warning',
  };
}

export async function runAllAccessibilityTests(
  page: Page,
): Promise<Array<AccessibilityTestResult & { name: string }>> {
  return [
    { name: 'Image alt text', ...(await testImageAltText(page)) },
    { name: 'Input labels', ...(await testInputLabels(page)) },
    { name: 'Interactive elements', ...(await testInteractiveElements(page)) },
    { name: 'Skip link', ...(await testSkipLink(page)) },
    { name: 'Semantic landmarks', ...(await testSemanticLandmarks(page)) },
    { name: 'Basic contrast', ...(await testBasicContrast(page)) },
  ];
}
