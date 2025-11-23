import { error, redirect } from '@sveltejs/kit';
import httpErrors from '$lib/httpErrors';
import api from '$lib/api';
import { PUBLIC_BASE_URL, PUBLIC_STATIC_PAGES } from '$env/static/public';
import { ApiError, RedirectError } from '@enodo/butterfly-ts';

import type { PageServerLoad } from './$types';
import type * as Butterfly from '@enodo/butterfly-ts';

const pages = JSON.parse(PUBLIC_STATIC_PAGES || '{}');

export const load: PageServerLoad = async ({ fetch, params, setHeaders }) => {
  const id = pages[params.slug];
  if (!id) {
    error(404, httpErrors[404]);
  }

  try {
    const post = await api.get<Butterfly.Post>({
      fetch,
      endpoint: 'posts',
      id,
    });

    setHeaders({ 'cache-control': 'public, max-age=120' });
    return {
      layer: {
        'content.type': 'page',
        'content.id': post.data.id,
      },
      meta: {
        title: post.data.attributes.title,
        description: post.data.attributes.resume,
        url: `${PUBLIC_BASE_URL}/${params.slug}.html`,
      },
      scope: post,
    };
  } catch (err: unknown) {
    if (err instanceof ApiError) {
      error(err.status, httpErrors[err.status]);
    }
    if (err instanceof RedirectError) {
      redirect(err.status, err.location);
    }
    console.error(err);
    error(500, httpErrors[500]);
  }
};
