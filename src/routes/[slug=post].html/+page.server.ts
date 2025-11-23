import { error, redirect } from '@sveltejs/kit';
import httpErrors from '$lib/httpErrors';
import api from '$lib/api';
import { PUBLIC_BASE_URL } from '$env/static/public';
import { ApiError, RedirectError } from '@enodo/butterfly-ts';

import type { PageServerLoad } from './$types';
import type * as Butterfly from '@enodo/butterfly-ts';

export const load: PageServerLoad = async ({ fetch, params, isDataRequest, setHeaders, url }) => {
  const id = parseInt(params.slug.split(/[-]+/).pop()!, 10);
  if (!id) {
    error(404, httpErrors[404]);
  }

  try {
    const post = await api.get<Butterfly.Post>({
      fetch,
      endpoint: 'posts',
      id,
    });

    // create 404 for unpublished posts with a bad url
    if (
      (!post.data.attributes.publishedAt ||
        new Date() < new Date(post.data.attributes.publishedAt)) &&
      params.slug !== `${post.data.attributes.slug}-${post.data.id}`
    ) {
      throw new ApiError(404, httpErrors[404]);
    }

    // redirect to correct canonical if it is on domain
    if (
      post.data.attributes.canonical &&
      post.data.attributes.canonical !== `${url.origin}${url.pathname}` &&
      post.data.attributes.canonical.startsWith(PUBLIC_BASE_URL)
    ) {
      throw new RedirectError(301, `${post.data.attributes.canonical}${url.search}`);
    }

    // redirect to correct url if needed
    if (params.slug !== `${post.data.attributes.slug}-${post.data.id}`) {
      throw new RedirectError(
        301,
        `/${post.data.attributes.slug}-${post.data.id}.html${url.search}`,
      );
    }

    let robots = 'index,follow,all,max-snippet:-1,max-image-preview:standard';
    if (
      !post.data.attributes.publishedAt ||
      new Date() < new Date(post.data.attributes.publishedAt)
    )
      robots = 'noindex,follow';
    else if (post.data.attributes.body?.find((item) => item.type === 'video'))
      robots = robots + ',max-video-preview:10';

    const related = api.get<Butterfly.Post[]>({
      fetch,
      endpoint: 'posts',
      query: {
        filter: {
          id: `-${id}`,
          'terms<tags>': post.data.relationships.terms.data
            .filter((t: Butterfly.Related) => t.type === 'terms<tags>')
            .map((t) => t.id)
            .join(','),
        },
        page: {
          size: 3,
        },
      },
    });

    setHeaders({ 'cache-control': 'public, max-age=120' });
    return {
      layer: {
        'content.type': 'post',
        'content.id': post.data.id,
      },
      meta: {
        title: post.data.attributes.title,
        description: post.data.attributes.resume,
        url: `${PUBLIC_BASE_URL}/${post.data.attributes.slug}-${post.data.id}.html`,
        robots,
      },
      scope: post,
      feeds: {
        related: isDataRequest ? related : await related,
      },
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
