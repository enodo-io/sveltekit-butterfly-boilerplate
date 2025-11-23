import type { RequestHandler } from '@sveltejs/kit';
import type * as Butterfly from '@enodo/butterfly-ts';

import { SitemapStream, streamToPromise } from 'sitemap';
import { Readable } from 'stream';
import { PUBLIC_BASE_URL } from '$env/static/public';
import api from '$lib/api';

export const GET: RequestHandler = async ({ fetch }) => {
  const categories = await api.get<Butterfly.Category[]>({
    fetch,
    endpoint: 'categories',
    query: { page: { size: 100 } },
  });

  const date = new Date();
  const routes = categories.data.map((category: Butterfly.Category) => ({
    url: category.attributes.path,
    lastmod: date,
    changefreq: 'weekly',
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
      'Cache-Control': 'max-age=86400',
    },
  });
};
