/**
 * SEO constants and URL helpers shared by the routes and the layout head.
 *
 * @module seo
 */

import { PUBLIC_BASE_URL } from '$env/static/public';

/**
 * Default robots of an indexable page. `max-image-preview:large` is required for
 * the large cards of Google Discover and the large image previews in Search.
 */
export const ROBOTS_INDEX = 'index,follow,max-snippet:-1,max-image-preview:large';

/** Thin pages (search results, empty listings): not indexed, links still followed. */
export const ROBOTS_NOINDEX = 'noindex,follow';

/**
 * Absolute URL on the public website: always built from `PUBLIC_BASE_URL`, never
 * from the request origin (the server sits behind a proxy, its origin is internal).
 */
export function absoluteUrl(path: string): string {
  return new URL(path, `${PUBLIC_BASE_URL.replace(/\/+$/, '')}/`).href;
}
