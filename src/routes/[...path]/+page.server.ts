import { PUBLIC_BASE_URL } from '$env/static/public';
import { error } from '@sveltejs/kit';
import httpErrors from '$lib/httpErrors';
import api from '$lib/api';
import { getCategoryChildrenIds } from '@enodo/butterfly-ts';

import type { PageServerLoad } from './$types';
import type * as Butterfly from '@enodo/butterfly-ts';

export const load: PageServerLoad = async ({
  parent,
  params,
  url,
  fetch,
  isDataRequest,
  setHeaders,
}) => {
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
  const { categories } = await parent();

  const path = `/${params.path}`;
  const category = {
    ...categories,
    data: categories.data.find((c: Butterfly.Category) => c.attributes.path === path),
  };

  if (!category.data) {
    error(404, httpErrors[404]);
  }

  const posts = (async () => {
    const p = await api.get<Butterfly.Post[]>({
      fetch,
      endpoint: 'posts',
      query: {
        filter: {
          types: '-page',
          categories: getCategoryChildrenIds(
            (category as Butterfly.ApiResponse<Butterfly.Category>).data,
            categories.data,
          ).join(','),
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
      'content.type': 'category',
    },
    meta: {
      url: `${PUBLIC_BASE_URL}${category.data.attributes.path}` + (page > 1 ? `?page=${page}` : ''),
      title: category.data.attributes.name + (page > 1 ? ` - Page ${page}` : ''),
      description: (page > 1 ? `Page ${page}: ` : '') + category.data.attributes.description,
    },
    scope: category,
    feeds: {
      posts: isDataRequest ? posts : await posts,
    },
  };
};
