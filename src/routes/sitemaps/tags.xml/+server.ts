import type { RequestHandler } from '@sveltejs/kit';
import type * as Butterfly from '@enodo/butterfly-ts';

import { SitemapStream, streamToPromise } from 'sitemap';
import { Readable } from 'stream';
import { PUBLIC_BASE_URL } from '$env/static/public';
import api from '$lib/api';

export const GET: RequestHandler = async ({ fetch }) => {
  const tags = await api.get<Butterfly.SyndicateTerm[]>({
    fetch,
    endpoint: 'syndication/terms',
    query: {
      filter: {
        taxonomies: 'tags',
      },
    },
  });

  const date = new Date();
  const routes = tags.data.map((tag: Butterfly.SyndicateTerm) => ({
    url: `/tags/${tag.id}.html`,
    lastmod: date,
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
      'Cache-Control': 'max-age=86400',
    },
  });
};
