import { PUBLIC_BASE_URL } from '$env/static/public';
import api from '$lib/api';

import type { PageServerLoad } from './$types';
import type * as Butterfly from '@enodo/butterfly-ts';

export const load: PageServerLoad = async ({ fetch, isDataRequest, setHeaders }) => {
  const authors = api.get<Butterfly.Author[]>({
    fetch,
    endpoint: 'authors',
    query: {
      page: {
        size: 100,
      },
    },
  });

  setHeaders({ 'cache-control': 'public, max-age=900' });
  return {
    layer: {
      'content.type': 'authors',
    },
    meta: {
      url: `${PUBLIC_BASE_URL}/authors`,
      title: 'All authors',
      description: 'Browse all authors and discover their articles and contributions.',
    },
    feeds: {
      authors: isDataRequest ? authors : await authors,
    },
  };
};
