import { error, redirect } from '@sveltejs/kit';
import httpErrors from '$lib/httpErrors';

/**
 * `?page=N` of a paginated listing, 1 when absent.
 *
 * - `?page=1` 301s to the same URL without it: one URL per page, no duplicate.
 * - Anything but a positive integer (`abc`, `0`, `01`, `-2`, empty) is a 404,
 *   instead of sending `NaN` to the API or serving a duplicate.
 */
export function pageParam(url: URL): number {
  const raw = url.searchParams.get('page');
  if (raw === null) {
    return 1;
  }
  if (!/^[1-9]\d{0,5}$/.test(raw)) {
    error(404, httpErrors[404]);
  }
  const page = Number(raw);
  if (page === 1) {
    const clean = new URL(url);
    clean.searchParams.delete('page');
    redirect(301, `${clean.pathname}${clean.search}`);
  }
  return page;
}
