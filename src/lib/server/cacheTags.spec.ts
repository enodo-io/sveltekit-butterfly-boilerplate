import { afterEach, describe, expect, it, vi } from 'vitest';

const load = async (env: Record<string, string>) => {
  vi.resetModules();
  const keys = [
    'PRIVATE_BUTTERFLY_PROPERTY_ID',
    'BUTTERFLY_PROPERTY_ID',
    'PRIVATE_CACHE_TAGS',
    'CACHE_TAGS',
  ];
  vi.doMock('$env/static/private', () => ({
    ...Object.fromEntries(keys.map((k) => [k, undefined])),
    ...env,
  }));
  return import('./cacheTags');
};

afterEach(() => vi.doUnmock('$env/static/private'));

describe('taggedCacheHeaders', () => {
  it('only the route cache-control without a property id', async () => {
    const { taggedCacheHeaders } = await load({});
    expect(taggedCacheHeaders('public, max-age=120', 'post:1')).toEqual({
      'cache-control': 'public, max-age=120',
    });
  });

  it('xkey (Varnish): tags + s-maxage', async () => {
    const { taggedCacheHeaders } = await load({ PRIVATE_BUTTERFLY_PROPERTY_ID: '42' });
    expect(taggedCacheHeaders('public, max-age=120', 'post:1')).toEqual({
      'cache-control': 'public, max-age=120, s-maxage=21600',
      xkey: '42:post:1',
    });
  });

  it('cloudflare: no s-maxage (it disables stale-while-revalidate), its own TTL header', async () => {
    const { taggedCacheHeaders } = await load({
      PRIVATE_BUTTERFLY_PROPERTY_ID: '42',
      PRIVATE_CACHE_TAGS: 'cloudflare',
    });
    expect(taggedCacheHeaders('public, max-age=120', 'post:1', 'sitemap')).toEqual({
      'cache-control': 'public, max-age=120',
      'cloudflare-cdn-cache-control': 'max-age=21600, stale-while-revalidate=21600',
      'cache-tag': '42:post:1,42:sitemap',
    });
  });

  it('still reads the former variable names', async () => {
    const { cacheTags } = await load({ BUTTERFLY_PROPERTY_ID: '7', CACHE_TAGS: 'fastly' });
    expect(cacheTags('post:1')).toEqual({ 'surrogate-key': '7:post:1' });
  });
});
