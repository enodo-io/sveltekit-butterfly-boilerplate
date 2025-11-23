import { PUBLIC_BASE_URL } from '$env/static/public';
import { error, redirect } from '@sveltejs/kit';
import httpErrors from '$lib/httpErrors';
import api from '$lib/api';
import { ApiError, RedirectError } from '@enodo/butterfly-ts';

import type { PageServerLoad } from './$types';
import type * as Butterfly from '@enodo/butterfly-ts';

export const load: PageServerLoad = async ({ url, params, fetch, isDataRequest, setHeaders }) => {
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
  const { id } = params;

  if (!id || !id.length) {
    error(404, httpErrors[404]);
  }

  const author = await (async () => {
    try {
      const a = await api.get<Butterfly.Author>({ fetch, endpoint: 'authors', id });
      return a;
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        error(err.status, httpErrors[err.status]);
      }
      if (err instanceof RedirectError) {
        redirect(err.status, err.location);
      }
      error(500, httpErrors[500]);
    }
  })();

  const posts = (async () => {
    const p = await api.get<Butterfly.Post[]>({
      fetch,
      endpoint: 'posts',
      query: {
        filter: {
          types: '-page',
          authors: author.data.id,
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

  setHeaders({ 'cache-control': 'public, max-age=300' });
  return {
    layer: {
      'page.index': page,
      'content.type': 'author',
      'content.id': author.data.id,
    },
    meta: {
      url: `${PUBLIC_BASE_URL}/authors/${id}` + (page > 1 ? `?page=${page}` : ''),
      title: author.data.attributes.name + (page > 1 ? ` - Page ${page}` : ''),
      description:
        page > 1
          ? `Browse all articles by ${author.data.attributes.name} (page ${page}).`
          : author.data.attributes.resume ||
            `Browse all articles by ${author.data.attributes.name}.`,
    },
    scope: author,
    feeds: {
      posts: isDataRequest ? posts : await posts,
    },
  };
};
