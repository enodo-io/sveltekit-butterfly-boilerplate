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

/**
 * Meta description: whitespace collapsed, at most `max` characters (Google shows
 * ~155-160), cut at a word boundary with an ellipsis. Empty input → empty string.
 */
export function metaDescription(text: string | null | undefined, max = 160): string {
  const clean = (text || '').replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const space = cut.lastIndexOf(' ');
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[\s,;:.!?-]+$/, '')}…`;
}
