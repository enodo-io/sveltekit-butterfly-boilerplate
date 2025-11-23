import { describe, it, expect, vi } from 'vitest';
import type * as Butterfly from '@enodo/butterfly-ts';

// Mock the env module
vi.mock('$env/static/public', () => ({
  PUBLIC_MEDIA_URL: 'https://media.example.com',
}));

// Mock the Butterfly getMediaUrl function
vi.mock('@enodo/butterfly-ts', async () => {
  const actual = await vi.importActual('@enodo/butterfly-ts');
  return {
    ...actual,
    getMediaUrl: (options: {
      domain: string;
      media: Butterfly.Media;
      format?: string;
      width?: number;
      ext?: string;
    }) => {
      const { media, format, width, ext } = options;
      return `https://media.example.com/${format}/${media?.id || 'default'}-${width || 'default'}${ext ? '.' + ext : ''}`;
    },
  };
});

describe('getMediaUrl', () => {
  it('should be importable', async () => {
    const { getMediaUrl } = await import('./getMediaUrl');
    expect(typeof getMediaUrl).toBe('function');
  });

  it('should return a URL string when called', async () => {
    const { getMediaUrl } = await import('./getMediaUrl');

    const mockMedia: Butterfly.Image = {
      id: 1,
      type: 'image',
      attributes: {
        name: 'Test Image',
        description: 'Test',
        credits: '',
        keywords: ['test'],
        mimetype: 'image/jpeg',
        createdAt: '2024-01-01',
        fingerprints: {
          source: 'test.jpg',
          default: 'test.jpg',
          thumb: 'test.jpg',
          square: 'test.jpg',
          cover: 'test.jpg',
          stories: 'test.jpg',
        },
        width: 1920,
        height: 1080,
      },
      relationships: {},
    } as Butterfly.Image;

    const url = getMediaUrl({
      media: mockMedia,
      format: 'thumb',
      width: 800,
    });

    expect(typeof url).toBe('string');
    expect(url).toContain('media.example.com');
  });
});
