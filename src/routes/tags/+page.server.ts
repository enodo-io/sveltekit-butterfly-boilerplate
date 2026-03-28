import { PUBLIC_BASE_URL } from '$env/static/public';
import { CACHE_CONTROL } from '$lib/cacheControl';
import api from '$lib/api';

import type { PageServerLoad } from './$types';
import type * as Butterfly from '@enodo/butterfly-ts';

export const load: PageServerLoad = async ({ fetch, isDataRequest, setHeaders }) => {
  const tags = api.get<Butterfly.SyndicateTerm[]>({
    fetch,
    endpoint: 'syndication/terms',
    query: {
      filter: {
        taxonomies: 'tags',
      },
    },
  });

  setHeaders({ 'cache-control': CACHE_CONTROL.longer });
  return {
    layer: {
      'content.type': 'tags',
    },
    meta: {
      url: `${PUBLIC_BASE_URL}/tags`,
      title: 'All tags',
      description: 'Browse all tags from our website and stay up to date.',
    },
    feeds: {
      tags: isDataRequest ? tags : await tags,
    },
  };
};
