import { describe, expect, it } from 'vitest';
import { isHttpError, isRedirect } from '@sveltejs/kit';
import { pageParam } from './pageParam';

const at = (search: string) => new URL(`https://site.test/tags/svelte${search}`);
const thrown = (fn: () => unknown) => {
  try {
    fn();
  } catch (e) {
    return e;
  }
  return undefined;
};

describe('pageParam', () => {
  it('is 1 without ?page and N for a valid page', () => {
    expect(pageParam(at(''))).toBe(1);
    expect(pageParam(at('?page=2'))).toBe(2);
    expect(pageParam(at('?query=x&page=12'))).toBe(12);
  });

  it('301s ?page=1 to the clean URL, other params kept', () => {
    const e = thrown(() => pageParam(at('?query=a+b&page=1')));
    expect(isRedirect(e)).toBe(true);
    if (isRedirect(e)) {
      expect(e.status).toBe(301);
      expect(e.location).toBe('/tags/svelte?query=a+b');
    }
  });

  it('404s anything but a positive integer', () => {
    for (const bad of ['abc', '0', '01', '-2', '', '2.5', '1e3']) {
      const e = thrown(() => pageParam(at(`?page=${bad}`)));
      expect(isHttpError(e) && e.status, bad).toBe(404);
    }
  });
});
