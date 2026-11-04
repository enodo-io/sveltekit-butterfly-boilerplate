/**
 * Cache presets of the routes. `max-age` for the browser and the shared
 * caches alike (Varnish, a CDN edge), and `stale-while-revalidate`: past the
 * TTL, a cache may serve its copy at once and fetch the fresh one in the
 * background, for as long again (an hour on the daily preset). Without it a
 * CDN edge far from the origin waits for it at every expiry. No `s-maxage`:
 * Cloudflare takes it as proxy-revalidate and then never serves stale (its
 * docs: "s-maxage disables stale-while-revalidate"); Varnish reads max-age
 * instead, same value, and keeps its own grace. A page is thus at most two
 * TTLs old.
 */
export const CACHE_CONTROL = {
  /** a page whose content may change any minute (a live, a countdown) */
  minute: 'public, max-age=60, stale-while-revalidate=60',
  short: 'public, max-age=120, stale-while-revalidate=120',
  medium: 'public, max-age=300, stale-while-revalidate=300',
  long: 'public, max-age=900, stale-while-revalidate=900',
  longer: 'public, max-age=3600, stale-while-revalidate=3600',
  day: 'public, max-age=86400, stale-while-revalidate=3600',
} as const;
