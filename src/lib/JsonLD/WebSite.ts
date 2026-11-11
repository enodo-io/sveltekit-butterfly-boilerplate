/**
 * WebSite JSON-LD Schema Generator
 *
 * The website itself (site name in Search), published by the Organization, with
 * its SearchAction. Google retired the sitelinks search box (Nov. 2024) and
 * ignores it, but it is kept on purpose for the other engines.
 *
 * @module WebSite
 */

import type { SearchAction, WebSite } from 'schema-dts';
import { PUBLIC_BASE_URL } from '$env/static/public';
import { env } from '$env/dynamic/public';
import { ORGANIZATION_ID, WEBSITE_ID } from './ids';

type SearchActionQuery = SearchAction & { 'query-input': string };

export default function getWebSite(data: App.PageData): WebSite {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: data.settings.title,
    url: `${PUBLIC_BASE_URL.replace(/\/+$/, '')}/`,
    inLanguage: env.PUBLIC_LANGUAGE || undefined,
    publisher: { '@id': ORGANIZATION_ID },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${PUBLIC_BASE_URL.replace(/\/+$/, '')}/search?query={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    } as SearchActionQuery,
  };
}
