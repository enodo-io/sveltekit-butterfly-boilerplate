import { PUBLIC_BASE_URL } from '$env/static/public';
import { error } from '@sveltejs/kit';
import httpErrors from '$lib/httpErrors';
import api from '$lib/api';

import type { PageServerLoad } from './$types';
import type * as Butterfly from '@enodo/butterfly-ts';

export const load: PageServerLoad = async ({ url, fetch, isDataRequest, setHeaders }) => {
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));

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

  setHeaders({ 'cache-control': 'public, max-age=300' });
  return {
    layer: {
      'page.index': page,
      'content.type': 'articles',
    },
    meta: {
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
