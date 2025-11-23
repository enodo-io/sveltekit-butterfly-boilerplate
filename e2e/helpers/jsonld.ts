import type { Page } from '@playwright/test';

/**
 * Type definitions from schema-dts for validation
 */
export type JsonLdType =
  | 'BreadcrumbList'
  | 'Article'
  | 'NewsArticle'
  | 'BlogPosting'
  | 'WebPage'
  | 'WebSite'
  | 'ProfilePage'
  | 'Organization'
  | 'FAQPage';

interface JsonLdObject {
  '@type'?: string | string[];
  '@graph'?: JsonLdObject[];
  [key: string]: unknown;
}

/**
 * Extract all JSON-LD objects from the page
 */
export async function extractAllJsonLd(page: Page): Promise<JsonLdObject[]> {
  const jsonLdElements = await page.locator('script[type="application/ld+json"]').all();
  const allJsonLd: JsonLdObject[] = [];

  for (const element of jsonLdElements) {
    const jsonContent = await element.textContent();
    if (!jsonContent) continue;

    try {
      const parsed = JSON.parse(jsonContent);

      // Handle array of JSON-LD objects
      if (Array.isArray(parsed)) {
        allJsonLd.push(...parsed);
      } else {
        allJsonLd.push(parsed);
      }
    } catch (error) {
      console.warn('Failed to parse JSON-LD:', error);
    }
  }

  return allJsonLd;
}

/**
 * Check if a JSON-LD object matches a specific type
 */
function hasType(obj: JsonLdObject, type: JsonLdType): boolean {
  const objType = obj['@type'];
  if (!objType) return false;

  if (Array.isArray(objType)) {
    return objType.includes(type);
  }

  return objType === type;
}

/**
 * Recursively search for a specific type in a JSON-LD object
 * This handles nested structures, @graph arrays, and properties
 */
function findTypeInObject(
  obj: JsonLdObject,
  type: JsonLdType,
  visited = new Set<JsonLdObject>(),
): JsonLdObject | null {
  // Prevent infinite loops
  if (visited.has(obj)) {
    return null;
  }
  visited.add(obj);

  // Check if this object matches the type
  if (hasType(obj, type)) {
    return obj;
  }

  // Check @graph array (common pattern)
  if (obj['@graph'] && Array.isArray(obj['@graph'])) {
    for (const item of obj['@graph']) {
      const found = findTypeInObject(item, type, visited);
      if (found) return found;
    }
  }

  // Recursively search in all properties
  for (const key in obj) {
    if (key === '@type' || key === '@graph') continue;

    const value = obj[key];
    if (!value || typeof value !== 'object') continue;

    // Handle arrays
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item && typeof item === 'object') {
          const found = findTypeInObject(item as JsonLdObject, type, visited);
          if (found) return found;
        }
      }
    }
    // Handle nested objects
    else if (typeof value === 'object') {
      const found = findTypeInObject(value as JsonLdObject, type, visited);
      if (found) return found;
    }
  }

  return null;
}

/**
 * Find a JSON-LD object of a specific type in the page
 * Searches through all JSON-LD scripts and nested structures
 */
export async function findJsonLdType(page: Page, type: JsonLdType): Promise<JsonLdObject | null> {
  const allJsonLd = await extractAllJsonLd(page);

  for (const jsonLd of allJsonLd) {
    const found = findTypeInObject(jsonLd, type);
    if (found) return found;
  }

  return null;
}

/**
 * Check if the page has at least one JSON-LD script
 */
export async function hasJsonLd(page: Page): Promise<boolean> {
  const count = await page.locator('script[type="application/ld+json"]').count();
  return count > 0;
}

/**
 * Check if the page has a specific JSON-LD type
 */
export async function hasJsonLdType(page: Page, type: JsonLdType): Promise<boolean> {
  const found = await findJsonLdType(page, type);
  return found !== null;
}
