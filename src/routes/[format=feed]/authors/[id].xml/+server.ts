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
    const [settings, author, posts] = await Promise.all([
      feedSettings(fetch),
      api.get<Butterfly.Author>({ fetch, endpoint: 'authors', id }),
      feedPosts(fetch, { authors: id }),
    ]);
    const { name, resume } = author.data.attributes;
    return feedResponse({
      format: params.format as FeedFormat,
      settings,
      posts,
      title: name,
      description: resume || `All articles by ${name}`,
      path: `/authors/${author.data.id}`,
      feedPath: `authors/${author.data.id}`,
    });
  } catch (err) {
    feedError(err);
  }
};
