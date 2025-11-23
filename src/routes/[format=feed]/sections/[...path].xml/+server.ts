import { Feed } from 'feed';
import { getCategoryChildrenIds, getRelated } from '@enodo/butterfly-ts';
import { error } from '@sveltejs/kit';
import { getMediaUrl } from '$lib/getMediaUrl';
import api from '$lib/api';
import httpErrors from '$lib/httpErrors';
import { PUBLIC_BASE_URL } from '$env/static/public';

import type { RequestHandler } from './$types';
import type * as Butterfly from '@enodo/butterfly-ts';

export const GET: RequestHandler = async ({ fetch, params }) => {
  const format = params.format as 'atom' | 'rss' | 'json';
  const path = `/${params.path}`;

  const [settings, categories] = await Promise.all([
    api.get<Butterfly.Property>({ fetch, path: '/v1/' }),
    api.get<Butterfly.Category[]>({
      fetch,
      endpoint: 'categories',
      query: { page: { size: 100 } },
    }),
  ]);

  const category = {
    ...categories,
    data: categories.data.find((c: Butterfly.Category) => c.attributes.path === path),
  };

  if (!category.data) {
    error(404, httpErrors[404]);
  }

  const posts = await api.get<Butterfly.Post[]>({
    fetch,
    endpoint: 'posts',
    query: {
      filter: {
        types: '-page',
        categories: getCategoryChildrenIds(
          (category as Butterfly.ApiResponse<Butterfly.Category>).data,
          categories.data,
        ).join(','),
      },
      page: {
        size: 20,
      },
      sort: '-updatedAt',
    },
  });

  const lastBuildDate = new Date();
  const feed = new Feed({
    title: category.data.attributes.name,
    description:
      category.data.attributes.description ||
      `All articles about "${category.data.attributes.name}" on ${settings.data.attributes.title}`,
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
      rss: `${PUBLIC_BASE_URL}/rss/sections${category.data.attributes.path}.xml`,
      json: `${PUBLIC_BASE_URL}/json/sections${category.data.attributes.path}.json`,
      atom: `${PUBLIC_BASE_URL}/atom/sections${category.data.attributes.path}.xml`,
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
