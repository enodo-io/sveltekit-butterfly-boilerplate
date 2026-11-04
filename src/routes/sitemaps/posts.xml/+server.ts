import type { RequestHandler } from '@sveltejs/kit';
import type * as Butterfly from '@enodo/butterfly-ts';

import { SitemapStream, streamToPromise } from 'sitemap';
import { Readable } from 'stream';
import { PUBLIC_BASE_URL } from '$env/static/public';
import { CACHE_CONTROL } from '$lib/cacheControl';
import api from '$lib/api';
import { postPath } from '$lib/posts';

export const GET: RequestHandler = async ({ fetch }) => {
  const posts = await api.get<Butterfly.SyndicatePost[]>({
    fetch,
    endpoint: 'syndication/posts',
    query: {
      filter: {
        types: '-page',
      },
    },
  });

  const routes = posts.data.map((post: Butterfly.SyndicatePost) => ({
    url: postPath(post),
    lastmod: new Date(post.attributes.updatedAt),
    changefreq: 'daily',
    priority: 0.8,
  }));

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
      'Cache-Control': CACHE_CONTROL.long,
    },
  });
};
