import type { RequestHandler } from '@sveltejs/kit';
import type * as Butterfly from '@enodo/butterfly-ts';

import { SitemapStream, streamToPromise } from 'sitemap';
import { getRelated } from '@enodo/butterfly-ts';
import { getMediaUrl } from '$lib/getMediaUrl';
import api from '$lib/api';
import { PUBLIC_BASE_URL } from '$env/static/public';

export const GET: RequestHandler = async ({ fetch }) => {
  const getPosts = async (url?: string) => {
    const apiOpt = url
      ? {
          fetch,
          url,
        }
      : {
          fetch,
          endpoint: 'posts',
          query: {
            filter: {
              types: '-page',
            },
            page: {
              size: 100,
            },
            sort: '-publishedAt',
          },
        };

    const p = await api.get<Butterfly.Post[]>(apiOpt);

    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    if (
      !p?.links?.next ||
      p.data.findIndex((pp: Butterfly.Post) => new Date(pp.attributes.publishedAt) < twoDaysAgo) >=
        0
    ) {
      p.data = p.data.filter(
        (pp: Butterfly.Post) => new Date(pp.attributes.publishedAt) > twoDaysAgo,
      );
      return p;
    }

    const next: Butterfly.ApiResponse<Butterfly.Post[]> = await getPosts(p.links.next);
    return {
      data: [...p.data, ...next.data],
      included: [...p.included, ...next.included],
      links: next.links,
    } as Butterfly.ApiResponse<Butterfly.Post[]>;
  };

  const posts = await getPosts();

  const stream = new SitemapStream({
    hostname: PUBLIC_BASE_URL,
    xmlns: {
      xhtml: false,
      news: true,
      image: true,
      video: false,
    },
  });

  posts.data.forEach((post) => {
    const img = post.relationships.thumbnail.data?.id
      ? [
          {
            url: getMediaUrl({
              media: getRelated(
                post.relationships.thumbnail.data,
                posts.included,
              ) as Butterfly.Media,
              format: 'thumb',
              ext: 'jpg',
            }),
          },
        ]
      : [];
    stream.write({
      url:
        post.attributes.canonical && post.attributes.canonical.startsWith(PUBLIC_BASE_URL)
          ? post.attributes.canonical.replace(PUBLIC_BASE_URL, '')
          : `/${post.attributes.slug}-${post.id}.html`,
      lastmod: post.attributes.updatedAt,
      news: {
        publication: {
          name: 'Enodo Blog',
          language: 'en',
        },
        publication_date: post.attributes.publishedAt,
        title: post.attributes.title,
      },
      img,
    });
  });

  stream.end();

  const xml = await streamToPromise(stream).then((sm) => sm.toString());

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'max-age=300',
    },
  });
};
