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

  it('includes a logo URL', () => {
    const result = Organization(mockPageData as App.PageData) as unknown as Record<string, unknown>;
    expect(result.logo).toBeDefined();
    expect(typeof result.logo).toBe('string');
  });
});
