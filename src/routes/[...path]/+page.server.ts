import { PUBLIC_BASE_URL } from '$env/static/public';
import { CACHE_CONTROL } from '$lib/cacheControl';
import { pageParam } from '$lib/server/pageParam';
import { ROBOTS_NOINDEX } from '$lib/seo';
import { error, redirect } from '@sveltejs/kit';
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
  const page = pageParam(url);
  const { categories } = await parent();

  const path = `/${params.path}`;
  const category = {
    ...categories,
    data: categories.data.find((c: Butterfly.Category) => c.attributes.path === path),
  };

  if (!category.data) {
    // a miscased inbound link (`/News`): 301 to the real path instead of a 404
    const lower = path.toLowerCase();
    const match = categories.data.find(
      (c: Butterfly.Category) => c.attributes.path.toLowerCase() === lower,
    );
    if (match) redirect(301, `${match.attributes.path}${url.search}`);
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

  // an empty listing (page 1, page 2+ already 404s) is a thin page: not indexed
  const empty = !isDataRequest && (await posts).data.length === 0;

  setHeaders({ 'cache-control': CACHE_CONTROL.medium });
  return {
    layer: {
      'page.index': page,
      'content.type': 'category',
      'content.id': category.data.id,
    },
    meta: {
      robots: empty ? ROBOTS_NOINDEX : undefined,
      url: `${PUBLIC_BASE_URL}${category.data.attributes.path}` + (page > 1 ? `?page=${page}` : ''),
      title: category.data.attributes.name + (page > 1 ? ` - Page ${page}` : ''),
      description:
        (page > 1 ? `Page ${page}: ` : '') +
        (category.data.attributes.description ||
          `All the articles about ${category.data.attributes.name}.`),
    },
    scope: category,
    feeds: {
      posts: isDataRequest ? posts : await posts,
    },
  };
};
