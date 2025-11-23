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

  const tag = await (async () => {
    try {
      const t = await api.get<Butterfly.Term>({
        fetch,
        endpoint: 'taxonomies/tags/relationships/terms',
        id,
      });
      return t;
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
          'terms<tags>': tag.data.id,
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
      'content.type': 'tag',
      'content.id': tag.data.id,
    },
    meta: {
      url: `${PUBLIC_BASE_URL}/tags/${id}` + (page > 1 ? `?page=${page}` : ''),
      title: tag.data.attributes.name + (page > 1 ? ` - Page ${page}` : ''),
      description:
        page > 1
          ? `Browse all articles about ${tag.data.attributes.name} (page ${page}).`
          : tag.data.attributes.description ||
            `Browse all articles about ${tag.data.attributes.name}.`,
    },
    scope: tag,
    feeds: {
      posts: isDataRequest ? posts : await posts,
    },
  };
};
