import { PUBLIC_BASE_URL } from '$env/static/public';
import { error, redirect } from '@sveltejs/kit';
import httpErrors from '$lib/httpErrors';
import api from '$lib/api';

import type { PageServerLoad } from './$types';
import type * as Butterfly from '@enodo/butterfly-ts';

export const load: PageServerLoad = async ({ url, fetch, isDataRequest, setHeaders }) => {
  const page: number = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
  const query: string | null = url.searchParams.get('query');

  if ((query && query.length <= 0) || (!query && page > 1)) {
    redirect(301, `/search`);
  }

  const posts = !query
    ? undefined
    : (async () => {
        const p = await api.get<Butterfly.Post[]>({
          fetch,
          endpoint: 'posts',
          query: {
            filter: {
              types: '-page',
              query,
            },
            page: {
              size: 18,
              number: page,
            },
          },
        });
        if (p.data.length <= 0 && page > 1) {
          error(404, httpErrors[404]);
        }
        return p;
      })();

  const tags =
    !query || page > 1
      ? undefined
      : api.get<Butterfly.Term[]>({
          fetch,
          endpoint: 'taxonomies/tags/relationships/terms',
          query: {
            filter: {
              query,
            },
            page: {
              size: 50,
              number: page,
            },
          },
        });

  const params: string[] = [];
  if (query) params.push(`query=${query}`);
  if (page > 1) params.push(`page=${page}`);

  setHeaders({ 'cache-control': 'public, max-age=120' });
  return {
    layer: {
      'page.index': page,
      'page.query': query || undefined,
      'content.type': 'search',
    },
    meta: {
      robots: query
        ? 'noindex,follow'
        : 'index,follow,all,max-snippet:-1,max-image-preview:standard',
      url: `${PUBLIC_BASE_URL}/search` + (params.length ? `?${params.join('&')}` : ''),
      title: query ? `Search results for ${query}` + (page > 1 ? ` - Page ${page}` : '') : 'Search',
      description:
        page > 1
          ? `Continue searching our articles (page ${page}). Discover the latest posts, updates, and insights from our website.`
          : 'Search through our website to find articles, posts, and content that match your interests. Quickly discover the information you need.',
    },
    feeds: {
      posts: isDataRequest && posts ? posts : await posts,
      tags: isDataRequest && tags ? tags : await tags,
    },
  };
};
