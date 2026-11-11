import { describe, it, expect } from 'vitest';
import Organization from './Organization';
import type * as Butterfly from '@enodo/butterfly-ts';

describe('Organization', () => {
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

  it('returns an Organization schema object', () => {
    const result = Organization(mockPageData as App.PageData) as unknown as Record<string, unknown>;
    expect(result['@type']).toBe('Organization');
  });

  it('includes the site name', () => {
    const result = Organization(mockPageData as App.PageData) as unknown as Record<string, unknown>;
    expect(result.name).toBe('Test Site');
  });

  it('has a square logo, an @id and a url', () => {
    const result = Organization(mockPageData as App.PageData) as unknown as Record<string, unknown>;
    const logo = result.logo as Record<string, string>;
    expect(logo['@type']).toBe('ImageObject');
    expect(logo.width).toBe(logo.height);
    expect(String(result['@id'])).toMatch(/\/#organization$/);
    expect(result.url).toBeTruthy();
  });

  it('reads sameAs from the property custom field (list or comma string)', () => {
    const withList = {
      ...mockPageData,
      settings: { title: 'T', custom: { sameAs: ['https://x.com/a', 'not a url'] } },
    } as unknown as App.PageData;
    const withString = {
      ...mockPageData,
      settings: { title: 'T', custom: { sameAs: 'https://a.b, https://c.d' } },
    } as unknown as App.PageData;
    expect((Organization(withList) as unknown as Record<string, unknown>).sameAs).toEqual([
      'https://x.com/a',
    ]);
    expect((Organization(withString) as unknown as Record<string, unknown>).sameAs).toEqual([
      'https://a.b',
      'https://c.d',
    ]);
    expect(
      (Organization(mockPageData as App.PageData) as unknown as Record<string, unknown>).sameAs,
    ).toBeUndefined();
  });
});
