import { Feed } from 'feed';
import { getRelated } from '@enodo/butterfly-ts';
import { getMediaUrl } from '$lib/getMediaUrl';
import api from '$lib/api';
import { PUBLIC_BASE_URL } from '$env/static/public';

import type { RequestHandler } from './$types';
import type * as Butterfly from '@enodo/butterfly-ts';

export const GET: RequestHandler = async ({ fetch, params }) => {
  const format = params.format as 'atom' | 'rss' | 'json';
  const [settings, posts] = await Promise.all([
    api.get<Butterfly.Property>({ fetch, path: '/v1/' }),
    api.get<Butterfly.Post[]>({
      fetch,
      endpoint: 'posts',
      query: {
        filter: {
          types: '-page',
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
    title: settings.data.attributes.title,
    description: settings.data.attributes.description,
    id: PUBLIC_BASE_URL,
    link: PUBLIC_BASE_URL,
    language: 'en',
    image: `${PUBLIC_BASE_URL}/logo-88x31.jpg`,
    favicon: `${PUBLIC_BASE_URL}/favicon.ico`,
    copyright: `All rights reserved ${lastBuildDate.getFullYear()}, ${settings.data.attributes.title}`,
    updated: new Date(),
    generator: 'Enodo Butterfly',
    ttl: 120,
    feedLinks: {
      rss: `${PUBLIC_BASE_URL}/rss/index.xml`,
      json: `${PUBLIC_BASE_URL}/json/index.json`,
      atom: `${PUBLIC_BASE_URL}/atom/index.xml`,
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
            media: getRelated(post.relationships.thumbnail.data, posts.included) as Butterfly.Media,
            format: 'thumb',
            ext: 'jpg',
            width: 640,
          })
        : undefined,
      author: [],
    });
  });

  const responses = { atom: feed.atom1, rss: feed.rss2, json: feed.json1 };
  const res = new Response(responses[format]());
  res.headers.set('Expires', new Date(Date.now() + 120).toUTCString());
  res.headers.set('Cache-Control', 'max-age=120');
  res.headers.set('Content-Type', 'text/xml');
  return res;
};
