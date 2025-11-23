import type { RequestHandler } from '@sveltejs/kit';
import type * as Butterfly from '@enodo/butterfly-ts';

import { SitemapStream, streamToPromise } from 'sitemap';
import { Readable } from 'stream';
import { PUBLIC_BASE_URL } from '$env/static/public';
import api from '$lib/api';

export const GET: RequestHandler = async ({ fetch }) => {
  const posts = await api.get<Butterfly.SyndicatePost[]>({
    fetch,
    endpoint: 'syndication/posts',
    query: {
      filter: {
        types: 'page',
      },
    },
  });

  const routes = posts.data.map((post: Butterfly.SyndicatePost) => ({
    url:
      post.attributes.canonical && post.attributes.canonical.startsWith(PUBLIC_BASE_URL)
        ? post.attributes.canonical.replace(PUBLIC_BASE_URL, '')
        : `/${post.attributes.slug}-${post.id}.html`,
    lastmod: new Date(post.attributes.updatedAt),
    changefreq: 'weekly',
    priority: 0.5,
  }));
  routes.push({
    url: '/rss.html',
    lastmod: new Date(),
    changefreq: 'daily',
    priority: 0.5,
  });
  routes.push({
    url: '/atom.html',
    lastmod: new Date(),
    changefreq: 'daily',
    priority: 0.5,
  });
  routes.push({
    url: '/search',
    lastmod: new Date(),
    changefreq: 'weekly',
    priority: 0.5,
  });
  routes.push({
    url: '/articles',
    lastmod: new Date(),
    changefreq: 'daily',
    priority: 0.8,
  });
  routes.push({
    url: '/tags',
    lastmod: new Date(),
    changefreq: 'daily',
    priority: 0.5,
  });
  routes.push({
    url: '/',
    lastmod: new Date(),
    changefreq: 'daily',
    priority: 1.0,
  });

  const stream = new SitemapStream({
    hostname: PUBLIC_BASE_URL,
    xmlns: {
      xhtml: false,
      news: false,
      image: false,
      video: false,
    },
  });
  const xml = await streamToPromise(Readable.from(routes).pipe(stream)).then((data) =>
    data.toString(),
  );

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'max-age=86400',
    },
  });
};
