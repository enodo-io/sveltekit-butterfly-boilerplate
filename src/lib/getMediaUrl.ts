/**
 * Media URL Helper
 *
 * Wrapper around the Butterfly media URL generator that automatically
 * injects the media domain from environment variables.
 *
 * @module getMediaUrl
 * @param {MediaUrlOptions} options - Media options (format, width, etc.)
 * @returns {string} - Complete media URL
 */

import { getMediaUrl as get, type GetMediaUrlOptions } from '@enodo/butterfly-ts';
import { PUBLIC_MEDIA_URL } from '$env/static/public';

type MediaUrlOptions = Omit<GetMediaUrlOptions, 'domain'>;

export function getMediaUrl(options: MediaUrlOptions) {
  return get({
    ...options,
    domain: PUBLIC_MEDIA_URL,
  });
}
