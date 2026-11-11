import type { ServerLoad } from '@sveltejs/kit';
import type * as Butterfly from '@enodo/butterfly-ts';

import { PUBLIC_LANGUAGE } from '$env/static/public';
import { error } from '@sveltejs/kit';
import httpErrors from '$lib/httpErrors';
import api from '$lib/api';
import { allCategories } from '$lib/server/categories';

export const load: ServerLoad = async ({ fetch }) => {
  if (!PUBLIC_LANGUAGE) {
    error(500, '`PUBLIC_LANGUAGE` environment variable is undefined');
  }

  try {
    const [settings, categories] = await Promise.all([
      api.get<Butterfly.Property>({ fetch, path: '/v1/' }),
      allCategories(fetch),
    ]);
    return {
      settings: settings.data.attributes,
      categories,
    };
  } catch (err) {
    console.error('[Layout]', err);
    error(500, httpErrors[500]);
  }
};
