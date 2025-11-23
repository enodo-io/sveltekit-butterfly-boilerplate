/**
 * WebSite JSON-LD Schema Generator
 *
 * Generates structured data for the website itself.
 * Includes site name, URL, and search action functionality.
 *
 * @module WebSite
 * @param {App.PageData} data - Page data containing site settings
 * @returns {WebSite} - Structured website data
 */

import type { WebSite, SearchAction } from 'schema-dts';
import { PUBLIC_BASE_URL } from '$env/static/public';

type SearchActionQuery = SearchAction & {
  'query-input': string;
};

export default function getWebSite(data: App.PageData): WebSite {
  return {
    '@type': 'WebSite',
    name: data.settings.title,
    url: PUBLIC_BASE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${PUBLIC_BASE_URL}/search?query={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    } as SearchActionQuery,
    // sameAs: [],
  };
}
