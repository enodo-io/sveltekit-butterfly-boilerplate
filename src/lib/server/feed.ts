import { Feed } from 'feed';
import { error, isHttpError, isRedirect, redirect } from '@sveltejs/kit';
import { ApiError, RedirectError, getRelated } from '@enodo/butterfly-ts';
import { PUBLIC_BASE_URL, PUBLIC_LANGUAGE } from '$env/static/public';
import api from '$lib/api';
import { CACHE_CONTROL } from '$lib/cacheControl';
import { getMediaUrl } from '$lib/getMediaUrl';
import httpErrors from '$lib/httpErrors';
import { postHref } from '$lib/posts';

import type * as Butterfly from '@enodo/butterfly-ts';

/**
 * RSS / Atom feeds (`/{rss|atom}/…xml`), shared by the 4 feed endpoints.
 *
 * - The 20 latest posts by publication date (aggregators and Google News expect
 *   chronological items: sorting by update made old posts jump to the top).
 * - Authors: name and profile URL, never the email (personal data).
 * - `application/rss+xml` / `application/atom+xml`, cached with the `short` preset.
 */

export type FeedFormat = 'rss' | 'atom';

const base = PUBLIC_BASE_URL.replace(/\/+$/, '');

const CONTENT_TYPES: Record<FeedFormat, string> = {
  rss: 'application/rss+xml; charset=utf-8',
  atom: 'application/atom+xml; charset=utf-8',
};

export const feedSettings = (fetch: typeof globalThis.fetch) =>
  api.get<Butterfly.Property>({ fetch, path: '/v1/' });

export const feedPosts = (fetch: typeof globalThis.fetch, filter: Record<string, string> = {}) =>
  api.get<Butterfly.Post[]>({
    fetch,
    endpoint: 'posts',
    query: { filter: { types: '-page', ...filter }, page: { size: 20 }, sort: '-publishedAt' },
  });

export function feedResponse({
  format,
  settings,
  posts,
  title,
  description,
  path,
  feedPath,
}: {
  format: FeedFormat;
  settings: Butterfly.ApiResponse<Butterfly.Property>;
  posts: Butterfly.ApiResponse<Butterfly.Post[]>;
  /** feed title (the site title for the main feed) */
  title: string;
  description: string;
  /** path of the HTML page of the feed (`/`, `/tags/x`…) */
  path: string;
  /** path of the feed after `/{format}/` without extension (`index`, `tags/x`…) */
  feedPath: string;
}): Response {
  const site = settings.data.attributes.title;
  const feed = new Feed({
    title,
    description,
    id: `${base}${path}`,
    link: `${base}${path}`,
    language: PUBLIC_LANGUAGE,
    image: `${base}/logo-88x31.jpg`,
    favicon: `${base}/favicon.ico`,
    copyright: `All rights reserved ${new Date().getFullYear()}, ${site}`,
    updated: posts.data[0] ? new Date(posts.data[0].attributes.publishedAt) : new Date(),
    generator: 'Enodo Butterfly',
    ttl: 2,
    feedLinks: {
      rss: `${base}/rss/${feedPath}.xml`,
      atom: `${base}/atom/${feedPath}.xml`,
    },
  });

  posts.data.forEach((post) => {
    const thumb = getRelated<Butterfly.Media>(post.relationships.thumbnail.data, posts.included);
    feed.addItem({
      title: post.attributes.title,
      id: postHref(post),
      link: postHref(post),
      description: post.attributes.resume || undefined,
      date: new Date(post.attributes.publishedAt),
      published: new Date(post.attributes.publishedAt),
      image: thumb
        ? getMediaUrl({ media: thumb, format: 'thumb', ext: 'jpg', width: 640 })
        : undefined,
      author: post.relationships.authors.data
        .map((a) => getRelated<Butterfly.Author>(a, posts.included))
        .filter((a): a is Butterfly.Author => !!a)
        .map((a) => ({ name: a.attributes.name, link: `${base}/authors/${a.id}` })),
    });
  });

  return new Response(format === 'atom' ? feed.atom1() : feed.rss2(), {
    headers: { 'content-type': CONTENT_TYPES[format], 'cache-control': CACHE_CONTROL.short },
  });
}

/** API errors as HTTP errors / redirects, anything else a 500 */
export function feedError(err: unknown): never {
  // already an HTTP error / redirect (e.g. the 404 of an unknown category)
  if (isHttpError(err) || isRedirect(err)) throw err;
  if (err instanceof ApiError) error(err.status, httpErrors[err.status]);
  if (err instanceof RedirectError) redirect(err.status, err.location);
  console.error(err);
  error(500, httpErrors[500]);
}
