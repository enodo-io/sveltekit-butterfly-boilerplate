import * as env from '$env/static/private';

/**
 * Cache tags: Butterfly purges them on every change of the tagged content, so
 * a tagged page can stay long in a shared cache (Varnish, a CDN) and still be
 * fresh. Only the pages of one object are tagged (a post: `post:{id}`); the
 * lists keep their short TTL (see the README, « Cache and purges »).
 *
 * .env: `BUTTERFLY_PROPERTY_ID` (no tag without it) and `CACHE_TAGS`, the
 * cache in front of the website: `xkey` (default, Varnish),
 * `cloudflare`, `fastly`, `vercel`, `netlify` or `none`.
 */

const HEADERS: Record<string, [header: string, separator: string]> = {
  xkey: ['xkey', ' '],
  cloudflare: ['cache-tag', ','],
  fastly: ['surrogate-key', ' '],
  vercel: ['vercel-cache-tag', ','],
  netlify: ['netlify-cache-tag', ','],
};

// read like this, an absent variable is undefined instead of a build error
const { BUTTERFLY_PROPERTY_ID: propertyId, CACHE_TAGS: mode = 'xkey' } = env as Record<
  string,
  string | undefined
>;
const tagHeader = propertyId ? HEADERS[mode.trim().toLowerCase()] : undefined;

/** Shared cache TTL of a tagged page (6 hours): the purges keep it fresh. */
const TAGGED_S_MAXAGE = 6 * 3600;

/** The tag header of these keys (`post:123` → `42:post:123`), `{}` when tags are off. */
export function cacheTags(...keys: string[]): Record<string, string> {
  if (!tagHeader) return {};
  const [header, separator] = tagHeader;
  return { [header]: keys.map((key) => `${propertyId}:${key}`).join(separator) };
}

/** `cacheControl` plus a long `s-maxage` when the page is tagged (purged), else as is. */
export const taggedCacheControl = (cacheControl: string) =>
  tagHeader ? `${cacheControl}, s-maxage=${TAGGED_S_MAXAGE}` : cacheControl;
