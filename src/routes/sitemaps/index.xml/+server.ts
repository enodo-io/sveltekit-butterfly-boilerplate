import type { RequestHandler } from '@sveltejs/kit';

import { SitemapIndexStream, streamToPromise } from 'sitemap';
import { Readable } from 'stream';
import { PUBLIC_BASE_URL } from '$env/static/public';

export const GET: RequestHandler = async () => {
  const lastmod = new Date();
  const sitemaps = [
    { url: `${PUBLIC_BASE_URL}/sitemaps/news.xml`, lastmod },
    { url: `${PUBLIC_BASE_URL}/sitemaps/posts.xml`, lastmod },
    { url: `${PUBLIC_BASE_URL}/sitemaps/sections.xml`, lastmod },
    { url: `${PUBLIC_BASE_URL}/sitemaps/tags.xml`, lastmod },
    { url: `${PUBLIC_BASE_URL}/sitemaps/authors.xml`, lastmod },
    { url: `${PUBLIC_BASE_URL}/sitemaps/pages.xml`, lastmod },
  ];

  const stream = new SitemapIndexStream();
  const xml = await streamToPromise(Readable.from(sitemaps).pipe(stream)).then((data) =>
    data.toString(),
  );

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'max-age=86400',
    },
  });
};
