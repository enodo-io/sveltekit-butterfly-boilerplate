import { CACHE_CONTROL } from '$lib/cacheControl';
import { getApiFile } from './apiFiles';
import { cacheTags } from './cacheTags';

const TEXT = 'text/plain; charset=utf-8';

/**
 * `/robots.txt`, `/ads.txt`, `/app-ads.txt`: the file of the Butterfly API
 * (txt-files plugin) when it serves one, else `fallback` (404 when none).
 */
export async function txtFileResponse(
  fetch: typeof globalThis.fetch,
  name: 'robots.txt' | 'ads.txt' | 'app-ads.txt',
  fallback: string | null = null,
): Promise<Response> {
  const file = await getApiFile(fetch, `/v1/txt-files/${name}`);

  if (file.status === 200) {
    return new Response(file.body, {
      headers: {
        'Content-Type': TEXT,
        'Cache-Control': CACHE_CONTROL.longer,
        // purged when the « Fichiers .txt » settings change
        ...cacheTags(`txtfile:${name}`),
      },
    });
  }

  // Not configured (404) or API unreachable: the local file. A robots.txt
  // must not answer 5xx, crawlers would stop crawling the site. Short TTL so
  // that the API file shows up quickly once configured.
  if (fallback !== null) {
    return new Response(fallback, {
      headers: { 'Content-Type': TEXT, 'Cache-Control': CACHE_CONTROL.medium },
    });
  }

  return new Response('Not found', {
    status: file.status === 404 ? 404 : 502,
    headers: { 'Content-Type': TEXT, 'Cache-Control': 'no-store' },
  });
}
