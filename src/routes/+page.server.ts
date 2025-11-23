import { error } from '@sveltejs/kit';
import httpErrors from '$lib/httpErrors';
import api from '$lib/api';
import { PUBLIC_BASE_URL } from '$env/static/public';
import { getCategoryChildrenIds } from '@enodo/butterfly-ts';

import type { PageServerLoad } from './$types';
import type * as Butterfly from '@enodo/butterfly-ts';

export const load: PageServerLoad = async ({ parent, fetch, isDataRequest, setHeaders }) => {
  try {
    const featured = api.get<Butterfly.Post[]>({
      fetch,
      endpoint: 'feeds/featured',
    });

    const { settings, categories } = await parent();

    async function promiseAll(obj: Record<string | number, unknown>) {
      const entries = Object.entries(obj);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const results = await Promise.all(entries.map(([key, promise]) => promise));
      return Object.fromEntries(entries.map(([key], i) => [key, results[i]]));
    }

    const categoriesFeed: Record<number, Promise<Butterfly.ApiResponse<Butterfly.Post[]>>> = {};
    categories.data
      .filter((c: Butterfly.Category) => !c.relationships.parentCategory.data)
      .forEach(
        (c: Butterfly.Category) =>
          (categoriesFeed[c.id] = api.get<Butterfly.Post[]>({
            fetch,
            endpoint: 'posts',
            query: {
              filter: {
                types: '-page',
                categories: getCategoryChildrenIds(c, categories.data).join(','),
              },
              page: {
                size: 6,
              },
            },
          })),
      );

    setHeaders({ 'cache-control': 'public, max-age=120' });
    return {
      layer: {
        'content.type': 'home',
      },
      meta: {
        title: settings.title,
        description: settings.description,
        url: `${PUBLIC_BASE_URL}/`,
      },
      feeds: {
        featured: isDataRequest ? featured : await featured,
        categories: isDataRequest ? categoriesFeed : await promiseAll(categoriesFeed),
      },
    };
  } catch (err) {
    console.error('[HOME]', err);
    error(500, httpErrors[500]);
  }
};
