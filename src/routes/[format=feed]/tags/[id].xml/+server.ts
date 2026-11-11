import api from '$lib/api';
import {
  feedError,
  feedPosts,
  feedResponse,
  feedSettings,
  type FeedFormat,
} from '$lib/server/feed';

import type { RequestHandler } from './$types';
import type * as Butterfly from '@enodo/butterfly-ts';

export const GET: RequestHandler = async ({ fetch, params }) => {
  const { id } = params;
  try {
    const [settings, tag, posts] = await Promise.all([
      feedSettings(fetch),
      api.get<Butterfly.Term>({ fetch, endpoint: 'taxonomies/tags/relationships/terms', id }),
      feedPosts(fetch, { 'terms<tags>': id }),
    ]);
    const { name, description } = tag.data.attributes;
    return feedResponse({
      format: params.format as FeedFormat,
      settings,
      posts,
      title: name,
      description: description || `All news about "${name}" on ${settings.data.attributes.title}`,
      path: `/tags/${tag.data.id}`,
      feedPath: `tags/${tag.data.id}`,
    });
  } catch (err) {
    feedError(err);
  }
};
