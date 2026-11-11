import { error, redirect } from '@sveltejs/kit';
import httpErrors from '$lib/httpErrors';
import api from '$lib/api';
import { PUBLIC_BASE_URL } from '$env/static/public';
import { CACHE_CONTROL } from '$lib/cacheControl';
import { cacheTags, taggedCacheControl } from '$lib/server/cacheTags';
import { absoluteUrl, ROBOTS_INDEX, ROBOTS_NOINDEX } from '$lib/seo';
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

    // redirect to correct canonical if it is on domain. Compared with PUBLIC_BASE_URL,
    // not url.origin: behind a proxy the origin is internal and every post would 301 to itself
    if (
      post.data.attributes.canonical &&
      post.data.attributes.canonical !== absoluteUrl(url.pathname) &&
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

    let robots = ROBOTS_INDEX;
    if (
      !post.data.attributes.publishedAt ||
      new Date() < new Date(post.data.attributes.publishedAt)
    )
      robots = ROBOTS_NOINDEX;
    else if (post.data.attributes.body?.find((item) => item.type === 'video'))
      robots = robots + ',max-video-preview:10';

    // Related: the posts sharing a tag, else the posts of the same category. The
    // relationship type is `term<tags>` (singular), the filter `terms<tags>` (plural).
    const tagIds = post.data.relationships.terms.data
      .filter((t: Butterfly.Related) => t.type === 'term<tags>')
      .map((t) => t.id);
    const categoryId = post.data.relationships.category.data?.id;
    const related = api.get<Butterfly.Post[]>({
      fetch,
      endpoint: 'posts',
      query: {
        filter: {
          id: `-${id}`,
          types: '-page',
          ...(tagIds.length
            ? { 'terms<tags>': tagIds.join(',') }
            : categoryId
              ? { categories: String(categoryId) }
              : {}),
        },
        page: {
          size: 3,
        },
      },
    });

    // tagged: purged by Butterfly when the post changes, so long in the shared caches
    setHeaders({
      'cache-control': taggedCacheControl(CACHE_CONTROL.short),
      ...cacheTags(`post:${post.data.id}`),
    });
    return {
      layer: {
        'content.type': 'post',
        'content.id': post.data.id,
      },
      meta: {
        title: post.data.attributes.title,
        description: post.data.attributes.resume,
        // the canonical of the page: the CMS one when set (e.g. syndicated content), so
        // canonical, og:url and the JSON-LD url always agree
        url:
          post.data.attributes.canonical ||
          `${PUBLIC_BASE_URL}/${post.data.attributes.slug}-${post.data.id}.html`,
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
