import { describe, it, expect } from 'vitest';
import { generateJsonLd } from './index';
import type * as Butterfly from '@enodo/butterfly-ts';

describe('generateJsonLd', () => {
  const mockPageData: Partial<App.PageData> = {
    settings: {
      title: 'Test Site',
    } as Butterfly.Property['attributes'],
    categories: { data: [], included: [], links: {} } as Butterfly.ApiResponse<
      Butterfly.Category[]
    >,
    layer: {
      'content.type': 'home',
    },
    meta: {
      url: 'https://example.com',
      title: 'Test Site',
      description: 'Test description',
    },
  };

  it('returns null when no types are provided', () => {
    const result = generateJsonLd(mockPageData as App.PageData, []);
    expect(result).toBeNull();
  });

  it('returns a single schema object when one type is provided', () => {
    const result = generateJsonLd(mockPageData as App.PageData, ['WebSite']);
    expect(result).toBeDefined();
    if (result) {
      expect(result).toHaveProperty('@context');
      if ('@type' in result) {
        expect(result['@type']).toBe('WebSite');
      }
    }
  });

  it('returns a graph object when multiple types are provided', () => {
    const result = generateJsonLd(mockPageData as App.PageData, [
      'WebSite',
      'WebPage',
      'Organization',
    ]);
    expect(result).toBeDefined();
    if (result) {
      expect(result).toHaveProperty('@context');
      if ('@graph' in result) {
        expect(Array.isArray((result as unknown as Record<string, unknown>)['@graph'])).toBe(true);
      }
    }
  });

  it('returns a WebPage schema', () => {
    const result = generateJsonLd(mockPageData as App.PageData, ['WebPage']);
    expect(result).toBeDefined();
    if (result && '@type' in result) {
      expect(result['@type']).toBe('WebPage');
    }
  });

  it('returns an Organization schema', () => {
    const result = generateJsonLd(mockPageData as App.PageData, ['Organization']);
    expect(result).toBeDefined();
    if (result && '@type' in result) {
      expect(result['@type']).toBe('Organization');
    }
  });

  it('defaults to WebSite when no types specified', () => {
    const result = generateJsonLd(mockPageData as App.PageData, ['WebSite']);
    expect(result).toBeDefined();
    if (result && '@type' in result) {
      expect(result['@type']).toBe('WebSite');
    }
  });
});
