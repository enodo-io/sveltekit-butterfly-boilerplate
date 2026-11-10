import { describe, expect, it } from 'vitest';
import { sitemapMaxAge } from './sitemapCache';

const now = new Date('2026-11-08T12:00:00Z');

describe('sitemapMaxAge', () => {
  it('follows the kind of file the API tells', () => {
    expect(sitemapMaxAge('news.xml', 300, now)).toBe(300);
    expect(sitemapMaxAge('articles-2019.xml', 86400, now)).toBe(86400);
    expect(sitemapMaxAge('index.xml', 3600, now)).toBe(3600);
    expect(sitemapMaxAge('tags.xml', 3600, now)).toBe(3600);
  });

  it('falls back on the file name', () => {
    expect(sitemapMaxAge('articles-2019.xml', null, now)).toBe(86400);
    expect(sitemapMaxAge('articles-2019-2.xml', null, now)).toBe(86400);
    expect(sitemapMaxAge('articles-2026.xml', null, now)).toBe(3600);
    expect(sitemapMaxAge('articles-2026-10.xml', null, now)).toBe(86400);
    expect(sitemapMaxAge('articles-2026-11-3.xml', null, now)).toBe(3600);
    expect(sitemapMaxAge('pages.xml', null, now)).toBe(3600);
  });
});
