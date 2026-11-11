import { PUBLIC_BASE_URL } from '$env/static/public';
import { CACHE_CONTROL } from '$lib/cacheControl';
import { pageParam } from '$lib/server/pageParam';
import { ROBOTS_NOINDEX } from '$lib/seo';
import { error } from '@sveltejs/kit';
import httpErrors from '$lib/httpErrors';
import api from '$lib/api';

import type { PageServerLoad } from './$types';
import type * as Butterfly from '@enodo/butterfly-ts';

export const load: PageServerLoad = async ({ url, fetch, isDataRequest, setHeaders }) => {
  const page = pageParam(url);

  const posts = (async () => {
    const p = await api.get<Butterfly.Post[]>({
      fetch,
      endpoint: 'posts',
      query: {
        filter: {
          types: '-page',
        },
        page: {
          size: 18,
          number: page,
        },
        sort: '-date',
      },
    });

    if (p.data.length <= 0 && page > 1) {
      error(404, httpErrors[404]);
    }
    return p;
  })();

  // an empty listing (page 1, page 2+ already 404s) is a thin page: not indexed
  const empty = !isDataRequest && (await posts).data.length === 0;

  setHeaders({ 'cache-control': CACHE_CONTROL.medium });
  return {
    layer: {
      'page.index': page,
      'content.type': 'articles',
    },
    meta: {
      robots: empty ? ROBOTS_NOINDEX : undefined,
      url: `${PUBLIC_BASE_URL}/articles` + (page > 1 ? `?page=${page}` : ''),
      title: 'All articles' + (page > 1 ? ` - Page ${page}` : ''),
      description:
        page > 1
          ? `Continue exploring our articles (page ${page}). Discover the latest posts, updates, and insights from our website.`
          : 'Browse all our articles in one place. Explore the latest posts, updates, and insights from our website.',
    },
    feeds: {
      posts: isDataRequest ? posts : await posts,
    },
  };
};
