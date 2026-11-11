import { error } from '@sveltejs/kit';
import { getCategoryChildrenIds } from '@enodo/butterfly-ts';
import { allCategories } from '$lib/server/categories';
import httpErrors from '$lib/httpErrors';
import {
  feedError,
  feedPosts,
  feedResponse,
  feedSettings,
  type FeedFormat,
} from '$lib/server/feed';

import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ fetch, params }) => {
  const path = `/${params.path}`;
  try {
    const [settings, categories] = await Promise.all([feedSettings(fetch), allCategories(fetch)]);
    const category = categories.data.find((c) => c.attributes.path === path);
    if (!category) error(404, httpErrors[404]);

    const posts = await feedPosts(fetch, {
      categories: getCategoryChildrenIds(category, categories.data).join(','),
    });
    const { name, description } = category.attributes;
    return feedResponse({
      format: params.format as FeedFormat,
      settings,
      posts,
      title: name,
      description:
        description || `All articles about "${name}" on ${settings.data.attributes.title}`,
      path: category.attributes.path,
      feedPath: `sections${category.attributes.path}`,
    });
  } catch (err) {
    feedError(err);
  }
};
