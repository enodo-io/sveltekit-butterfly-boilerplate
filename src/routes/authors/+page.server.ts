import { PUBLIC_BASE_URL } from '$env/static/public';
import { CACHE_CONTROL } from '$lib/cacheControl';
import { error } from '@sveltejs/kit';
import httpErrors from '$lib/httpErrors';
import api from '$lib/api';
import { pageParam } from '$lib/server/pageParam';

import type { PageServerLoad } from './$types';
import type * as Butterfly from '@enodo/butterfly-ts';

/** authors per page: every author is linked from a crawlable page (no orphan after the first 100) */
const SIZE = 50;

export const load: PageServerLoad = async ({ url, fetch, isDataRequest, setHeaders }) => {
  const page = pageParam(url);

  const authors = (async () => {
    const a = await api.get<Butterfly.Author[]>({
      fetch,
      endpoint: 'authors',
      query: { page: { size: SIZE, number: page } },
    });
    if (a.data.length <= 0 && page > 1) {
      error(404, httpErrors[404]);
    }
    return a;
  })();

  setHeaders({ 'cache-control': CACHE_CONTROL.long });
  return {
    layer: {
      'page.index': page,
      'content.type': 'authors',
    },
    meta: {
      url: `${PUBLIC_BASE_URL}/authors` + (page > 1 ? `?page=${page}` : ''),
      title: 'All authors' + (page > 1 ? ` - Page ${page}` : ''),
      description:
        (page > 1 ? `Page ${page}: ` : '') +
        'Browse all authors and discover their articles and contributions.',
    },
    feeds: {
      authors: isDataRequest ? authors : await authors,
    },
  };
};
