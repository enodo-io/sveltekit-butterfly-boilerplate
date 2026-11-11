/**
 * WebPage JSON-LD Schema Generator
 *
 * A page of the website (`isPartOf` the WebSite), with its breadcrumb.
 * `CollectionPage` for the listings: their posts as an `ItemList` when the feed
 * is resolved (SSR, what crawlers get).
 *
 * @module WebPage
 */

import type { CollectionPage, ItemList, WebPage } from 'schema-dts';
import type * as Butterfly from '@enodo/butterfly-ts';
import { absoluteUrl } from '$lib/seo';
import { postPath } from '$lib/posts';
import BreadcrumbList from './BreadcrumbList';
import { WEBSITE_ID } from './ids';

export default function getWebPage(data: App.PageData): WebPage {
  const breadcrumb = BreadcrumbList(data);
  return {
    '@type': 'WebPage',
    '@id': `${data.meta.url}#page`,
    url: data.meta.url,
    name: data.meta.title,
    description: data.meta.description || undefined,
    isPartOf: { '@id': WEBSITE_ID },
    breadcrumb: (breadcrumb.itemListElement as unknown[]).length > 1 ? breadcrumb : undefined,
  };
}

function itemList(data: App.PageData): ItemList | undefined {
  const feed = data.feeds?.posts as Butterfly.ApiResponse<Butterfly.Post[]> | undefined;
  // a promise on client navigations: the list is only for the SSR document
  if (!feed || typeof (feed as unknown as Promise<unknown>).then === 'function') return undefined;
  if (!feed.data?.length) return undefined;
  return {
    '@type': 'ItemList',
    itemListElement: feed.data.map((post, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: absoluteUrl(postPath(post)),
    })),
  };
}

export function getCollectionPage(data: App.PageData): CollectionPage {
  return {
    ...(getWebPage(data) as object),
    '@type': 'CollectionPage',
    mainEntity: itemList(data),
  } as CollectionPage;
}
