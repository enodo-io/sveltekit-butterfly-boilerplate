import {
  feedError,
  feedPosts,
  feedResponse,
  feedSettings,
  type FeedFormat,
} from '$lib/server/feed';

import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ fetch, params }) => {
  try {
    const [settings, posts] = await Promise.all([feedSettings(fetch), feedPosts(fetch)]);
    return feedResponse({
      format: params.format as FeedFormat,
      settings,
      posts,
      title: settings.data.attributes.title,
      description: settings.data.attributes.description,
      path: '/',
      feedPath: 'index',
    });
  } catch (err) {
    feedError(err);
  }
};
