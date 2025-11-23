/**
 * WebPage JSON-LD Schema Generator
 *
 * Generates structured data for standard web pages.
 * Includes page URL, ID, and breadcrumb navigation.
 *
 * @module WebPage
 * @param {App.PageData} data - Page data
 * @returns {WebPage} - Structured web page data
 */

import type { WebPage } from 'schema-dts';
import BreadcrumbList from './BreadcrumbList';

export default function getWebPage(data: App.PageData): WebPage {
  const breadcrumb = BreadcrumbList(data);
  return {
    '@type': 'WebPage',
    '@id': `${data.meta.url}#page`,
    url: data.meta.url,
    breadcrumb: (breadcrumb.itemListElement as unknown[]).length > 1 ? breadcrumb : undefined,
  };
}
