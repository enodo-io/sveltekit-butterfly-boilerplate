import { PUBLIC_BASE_URL } from '$env/static/public';
import api from '$lib/api';

import type { PageServerLoad } from './$types';
import type * as Butterfly from '@enodo/butterfly-ts';

export const load: PageServerLoad = async ({ fetch, params, isDataRequest, setHeaders }) => {
  const format = params.format as 'atom' | 'rss' | 'json';

  const authors = api.get<Butterfly.SyndicateAuthor[]>({
    fetch,
    endpoint: 'syndication/authors',
  });

  const tags = api.get<Butterfly.SyndicateTerm[]>({
    fetch,
    endpoint: 'syndication/terms',
    query: {
      filter: {
        taxonomies: 'tags',
      },
    },
  });

  setHeaders({ 'cache-control': 'public, max-age=3600' });
  return {
    layer: {
      'content.type': format,
    },
    meta: {
      url: `${PUBLIC_BASE_URL}/${format}.html`,
      title: format === 'atom' ? 'Atom Feeds' : 'RSS Feeds',
      description: `Browse all ${format === 'atom' ? 'Atom' : 'RSS'} feeds from our website and stay up to date.`,
    },
    feeds: {
      tags: isDataRequest ? tags : await tags,
      authors: isDataRequest ? authors : await authors,
    },
  };
};
