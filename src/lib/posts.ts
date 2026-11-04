import type * as Butterfly from '@enodo/butterfly-ts';
import { getRelated } from '@enodo/butterfly-ts';
import { PUBLIC_BASE_URL } from '$env/static/public';

/**
 * Small accessors around a Butterfly post and the `included` resources of
 * its response: category, authors, thumbnail, custom fields, flags and the
 * public URL. One place for the URL of a post: every card, feed, sitemap and
 * schema reads it here, so a site that adopts category paths or another
 * pattern changes `postPath` only.
 */

const base = PUBLIC_BASE_URL.replace(/\/+$/, '');

export const categoryOf = (
  post: Butterfly.Post,
  included: Butterfly.Resource[],
): Butterfly.Category | undefined =>
  post.relationships.category?.data
    ? getRelated<Butterfly.Category>(post.relationships.category.data, included)
    : undefined;

export const authorsOf = (
  post: Butterfly.Post,
  included: Butterfly.Resource[],
): Butterfly.Author[] =>
  (post.relationships.authors?.data || [])
    .map((a) => getRelated<Butterfly.Author>(a, included))
    .filter((a): a is Butterfly.Author => !!a);

export const thumbnailOf = (
  post: Butterfly.Post,
  included: Butterfly.Resource[],
): Butterfly.Media | undefined =>
  post.relationships.thumbnail?.data
    ? getRelated<Butterfly.Media>(post.relationships.thumbnail.data, included)
    : undefined;

/** A custom field of the post as a string (`sponsor`, `event-date`…), or null. */
export const customString = (
  resource: { attributes: { custom?: Record<string, unknown> } },
  key: string,
): string | null => {
  const value = resource.attributes.custom?.[key];
  return typeof value === 'string' || typeof value === 'number' ? String(value) : null;
};

export const hasFlag = (post: Butterfly.Post, flag: string): boolean =>
  (post.attributes.flags || []).includes(flag);

/** what `postPath` reads: a full post or a `SyndicatePost` of the sitemaps */
type PostLike = { id: number; attributes: { slug: string; canonical?: string | null } };

/** Relative path of a post: its canonical when it is on this site, else `/{slug}-{id}.html`. */
export const postPath = (post: PostLike): `/${string}` => {
  const canonical = post.attributes.canonical;
  if (canonical && canonical.startsWith(`${base}/`)) {
    return canonical.slice(base.length) as `/${string}`;
  }
  return `/${post.attributes.slug}-${post.id}.html`;
};

/** Absolute URL of a post (feeds, sitemaps, schemas). */
export const postHref = (post: PostLike): string => `${base}${postPath(post)}`;
