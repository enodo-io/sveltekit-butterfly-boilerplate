/**
 * Organization JSON-LD Schema Generator
 *
 * Generates structured data for the site's publishing organization.
 * Used as publisher information in articles and other content.
 *
 * @module Organization
 * @param {App.PageData} data - Page data containing site settings
 * @returns {Organization} - Structured organization data
 */

import type { Organization } from 'schema-dts';
import { PUBLIC_BASE_URL } from '$env/static/public';

export default function getOrganization(data: App.PageData): Organization {
  return {
    '@type': 'Organization',
    name: data.settings.title,
    logo: `${PUBLIC_BASE_URL}/logo-268×60.png`,
  };
}
