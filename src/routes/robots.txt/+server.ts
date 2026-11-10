import type { RequestHandler } from './$types';
import { PUBLIC_BASE_URL } from '$env/static/public';
import { txtFileResponse } from '$lib/server/txtFile';
import template from '$lib/server/robots.fallback.txt?raw';

// `{origin}` → the site URL (PUBLIC_BASE_URL)
const fallback = template.replaceAll('{origin}', PUBLIC_BASE_URL.replace(/\/+$/, ''));

/**
 * The robots.txt of the « Fichiers .txt » plugin; `$lib/server/robots.fallback.txt`
 * while the plugin has none or the API is unreachable (a robots.txt must not
 * answer 5xx: crawlers would stop crawling the site).
 */
export const GET: RequestHandler = ({ fetch }) => txtFileResponse(fetch, 'robots.txt', fallback);
