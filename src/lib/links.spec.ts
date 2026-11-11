import { describe, expect, it, vi } from 'vitest';

vi.mock('$env/static/public', () => ({ PUBLIC_BASE_URL: 'https://www.site.test' }));

const { contentLink, externalRel } = await import('./links');

describe('contentLink', () => {
  it('treats relative, www / non-www, http / https same-host links as internal paths', () => {
    expect(contentLink('/a-1.html')).toEqual({ href: '/a-1.html', internal: true, web: true });
    expect(contentLink('http://site.test/x?y=1#z')?.href).toBe('/x?y=1#z');
    expect(contentLink('https://www.site.test/')?.internal).toBe(true);
  });

  it('keeps other hosts and schemes external, drops empty links', () => {
    expect(contentLink('https://other.test/p')).toEqual({
      href: 'https://other.test/p',
      internal: false,
      web: true,
    });
    expect(contentLink('mailto:a@b.c')?.web).toBe(false);
    expect(contentLink('')).toBeNull();
    expect(contentLink('#')).toBeNull();
  });

  it('builds rel', () => {
    expect(externalRel({})).toBe('noopener');
    expect(externalRel({ sponsored: true, nofollow: true })).toBe('sponsored nofollow noopener');
  });
});
