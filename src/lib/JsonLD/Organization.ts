/**
 * Organization JSON-LD Schema Generator
 *
 * The site's publishing organization, referenced by `@id` from the WebSite and as
 * the publisher of every article.
 *
 * - logo: `/favicon-512.png`, square (Google: at least 112x112, square preferred).
 *   Replace the file with the site's square logo.
 * - sameAs: the `sameAs` custom field of the property (back-office settings): the
 *   official profiles (social networks, Wikipedia…), a list or a comma-separated
 *   string.
 *
 * @module Organization
 */

import type { Organization } from 'schema-dts';
import { PUBLIC_BASE_URL } from '$env/static/public';
import { ORGANIZATION_ID } from './ids';

function sameAs(data: App.PageData): string[] | undefined {
  const raw = data.settings.custom?.sameAs;
  const list = Array.isArray(raw) ? raw.map(String) : typeof raw === 'string' ? raw.split(',') : [];
  const urls = list.map((s) => s.trim()).filter((s) => /^https?:\/\//.test(s));
  return urls.length ? urls : undefined;
}

export default function getOrganization(data: App.PageData): Organization {
  const base = PUBLIC_BASE_URL.replace(/\/+$/, '');
  return {
    '@type': 'Organization',
    '@id': ORGANIZATION_ID,
    name: data.settings.title,
    url: `${base}/`,
    logo: {
      '@type': 'ImageObject',
      url: `${base}/favicon-512.png`,
      width: '512',
      height: '512',
    },
    sameAs: sameAs(data),
  };
}
