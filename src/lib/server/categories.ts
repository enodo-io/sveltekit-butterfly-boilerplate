import api from '$lib/api';

import type * as Butterfly from '@enodo/butterfly-ts';

/**
 * Every category of the site, all pages followed (the menu, the breadcrumbs and
 * the category routes need the full tree: a site with more than 100 categories
 * lost the rest). Serialised in every page: only id/type/attributes/
 * relationships are kept (no per-item links/meta).
 */
export async function allCategories(
  fetch: typeof globalThis.fetch,
): Promise<Butterfly.ApiResponse<Butterfly.Category[]>> {
  const first = await api.get<Butterfly.Category[]>({
    fetch,
    endpoint: 'categories',
    query: { page: { size: 100 } },
  });
  const data = [...first.data];
  const included = [...(first.included || [])];
  let next = first.links?.next;
  // at most 20 pages (2,000 categories): a guard against a looping `next`
  for (let i = 0; next && i < 20; i += 1) {
    const page = await api.get<Butterfly.Category[]>({ fetch, path: next });
    data.push(...page.data);
    included.push(...(page.included || []));
    next = page.links?.next;
  }
  return {
    meta: first.meta,
    links: {},
    included,
    data: data.map(({ id, type, attributes, relationships }) => ({
      id,
      type,
      attributes,
      relationships,
    })),
  };
}
