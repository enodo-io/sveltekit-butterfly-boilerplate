import { Feed } from 'feed';
import { getRelated, ApiError, RedirectError } from '@enodo/butterfly-ts';
import { error } from '@sveltejs/kit';
import { getMediaUrl } from '$lib/getMediaUrl';
import api from '$lib/api';
import httpErrors from '$lib/httpErrors';
import { PUBLIC_LANGUAGE, PUBLIC_BASE_URL } from '$env/static/public';

import type { RequestHandler } from './$types';
import type * as Butterfly from '@enodo/butterfly-ts';

export const GET: RequestHandler = async ({ fetch, params }) => {
  const format = params.format as 'atom' | 'rss' | 'json';
  const { id } = params;

  if (!id || !id.length) {
    error(404, 'Not found');
  }

  try {
    const [settings, author, posts] = await Promise.all([
      api.get<Butterfly.Property>({ fetch, path: '/v1/' }),
      api.get<Butterfly.Author>({
        fetch,
        endpoint: 'authors',
        id,
      }),
      api.get<Butterfly.Post[]>({
        fetch,
        endpoint: 'posts',
        query: {
          filter: {
            types: '-page',
            authors: id,
          },
          page: {
            size: 20,
          },
          sort: '-updatedAt',
        },
      }),
    ]);

    const lastBuildDate = new Date();
    const feed = new Feed({
      title: author.data.attributes.name,
      description:
        author.data.attributes.resume || `All articles by ${author.data.attributes.name}`,
      id: `${PUBLIC_BASE_URL}/authors/${author.data.id}`,
      link: `${PUBLIC_BASE_URL}/authors/${author.data.id}`,
      language: PUBLIC_LANGUAGE,
      image: `${PUBLIC_BASE_URL}/logo-88x31.jpg`,
      favicon: `${PUBLIC_BASE_URL}/favicon.ico`,
      copyright: `All rights reserved ${lastBuildDate.getFullYear()}, ${settings.data.attributes.title}`,
      updated: new Date(),
      generator: 'Enodo Butterfly',
      ttl: 120,
      feedLinks: {
        rss: `${PUBLIC_BASE_URL}/rss/authors/${author.data.id}.xml`,
        json: `${PUBLIC_BASE_URL}/json/authors/${author.data.id}.json`,
        atom: `${PUBLIC_BASE_URL}/atom/authors/${author.data.id}.xml`,
      },
    });

    posts.data.forEach((post: Butterfly.Post) => {
      feed.addItem({
        title: post.attributes.title,
        id: post.id.toString(),
        link:
          post.attributes.canonical && post.attributes.canonical.startsWith(PUBLIC_BASE_URL)
            ? post.attributes.canonical
            : `${PUBLIC_BASE_URL}/${post.attributes.slug}-${post.id}.html`,
        description: post.attributes.resume,
        date: new Date(post.attributes.publishedAt),
        image: post.relationships.thumbnail.data?.id
          ? getMediaUrl({
              media: getRelated(
                post.relationships.thumbnail.data,
                posts.included,
              ) as Butterfly.Media,
              format: 'thumb',
              ext: 'jpg',
              width: 640,
            })
          : undefined,
        author: post.relationships.authors.data.map((author: Butterfly.Related) => {
          const a = getRelated(author, posts.included) as Butterfly.Author;
          return {
            name: a.attributes.name,
            email: a.attributes.email || undefined,
            link: `${PUBLIC_BASE_URL}/auteurs/${a.id}`,
          };
        }),
      });
    });

    const responses = { atom: feed.atom1, rss: feed.rss2, json: feed.json1 };
    const res = new Response(responses[format]());
    res.headers.set('Expires', new Date(Date.now() + 120).toUTCString());
    res.headers.set('Cache-Control', 'max-age=120');
    res.headers.set('Content-Type', 'text/xml');
    return res;
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      error(err.status, httpErrors[err.status]);
    }
    if (err instanceof RedirectError) {
      error(410, httpErrors[410]);
    }
    error(500, httpErrors[500]);
  }
};
