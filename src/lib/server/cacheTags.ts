import * as env from '$env/static/private';

/**
 * Cache tags: Butterfly purges them on every change of the tagged content, so
 * a tagged page can stay long in a shared cache (Varnish, a CDN) and still be
 * fresh. Only the pages of one object are tagged (a post: `post:{id}`); the
 * lists keep their short TTL (see the README, « Cache and purges »).
 *
 * .env: `PRIVATE_BUTTERFLY_PROPERTY_ID` (no tag without it) and `PRIVATE_CACHE_TAGS`, the
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
const vars = env as Record<string, string | undefined>;
// BUTTERFLY_PROPERTY_ID / CACHE_TAGS: former names, still read for the sites set up before
const propertyId = vars.PRIVATE_BUTTERFLY_PROPERTY_ID || vars.BUTTERFLY_PROPERTY_ID;
const mode = vars.PRIVATE_CACHE_TAGS || vars.CACHE_TAGS || 'xkey';
const tagHeader = propertyId ? HEADERS[mode.trim().toLowerCase()] : undefined;

/** Shared cache TTL of a tagged page (6 hours): the purges keep it fresh. */
const TAGGED_TTL = 6 * 3600;

/**
 * The CDN-only TTL of a tagged page. Varnish reads `s-maxage`; the CDNs get
 * their own header instead, because `s-maxage` turns off stale-while-revalidate
 * on Cloudflare. The browser keeps the short `cache-control` of the route.
 */
const CDN_TTL = `max-age=${TAGGED_TTL}, stale-while-revalidate=${TAGGED_TTL}`;
const CDN_HEADERS: Record<string, [header: string, value: string]> = {
  cloudflare: ['cloudflare-cdn-cache-control', CDN_TTL],
  fastly: ['surrogate-control', CDN_TTL],
  vercel: ['vercel-cdn-cache-control', CDN_TTL],
  netlify: ['netlify-cdn-cache-control', `public, durable, ${CDN_TTL}`],
};

/** The tag header of these keys (`post:123` → `42:post:123`), `{}` when tags are off. */
export function cacheTags(...keys: string[]): Record<string, string> {
  if (!tagHeader) return {};
  const [header, separator] = tagHeader;
  return { [header]: keys.map((key) => `${propertyId}:${key}`).join(separator) };
}

/**
 * Headers of a page tagged with these keys: the route's `cacheControl` for the
 * browser, the tags, and the long shared TTL the purges allow (`s-maxage` for
 * Varnish/xkey, the CDN's own header otherwise). Tags off: `cacheControl` only.
 */
export function taggedCacheHeaders(
  cacheControl: string,
  ...keys: string[]
): Record<string, string> {
  if (!tagHeader) return { 'cache-control': cacheControl };
  const key = mode.trim().toLowerCase();
  const cdn = CDN_HEADERS[key];
  return {
    'cache-control': cdn ? cacheControl : `${cacheControl}, s-maxage=${TAGGED_TTL}`,
    ...(cdn ? { [cdn[0]]: cdn[1] } : {}),
    ...cacheTags(...keys),
  };
}
