/**
 * WebSite JSON-LD Schema Generator
 *
 * The website itself (site name in Search), published by the Organization. No
 * SearchAction: Google retired the sitelinks search box in November 2024.
 *
 * @module WebSite
 */

import type { WebSite } from 'schema-dts';
import { PUBLIC_BASE_URL } from '$env/static/public';
import { env } from '$env/dynamic/public';
import { ORGANIZATION_ID, WEBSITE_ID } from './ids';

export default function getWebSite(data: App.PageData): WebSite {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    name: data.settings.title,
    url: `${PUBLIC_BASE_URL.replace(/\/+$/, '')}/`,
    inLanguage: env.PUBLIC_LANGUAGE || undefined,
    publisher: { '@id': ORGANIZATION_ID },
  };
}
