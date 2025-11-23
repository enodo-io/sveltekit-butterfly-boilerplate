/**
 * ProfilePage JSON-LD Schema Generator
 *
 * Generates structured data for author profile pages.
 * Includes author information, contact details, profile images, and breadcrumb navigation.
 *
 * @module ProfilePage
 * @param {App.PageData} data - Page data containing author scope
 * @returns {ProfilePage} - Structured profile page data
 */

import type { ProfilePage } from 'schema-dts';
import type * as Butterfly from '@enodo/butterfly-ts';
import { getMediaUrl } from '$lib/getMediaUrl';
import { getRelated } from '@enodo/butterfly-ts';
import BreadcrumbList from './BreadcrumbList';

import { PUBLIC_BASE_URL } from '$env/static/public';

export default function getProfilePage(data: App.PageData): ProfilePage {
  const author: Butterfly.Author = data.scope?.data;

  const breadcrumb = BreadcrumbList(data);

  const scheme: ProfilePage = {
    '@type': 'ProfilePage',
    '@id': `${data.meta.url}#page`,
    url: data.meta.url,
    mainEntity: {
      '@type': author.attributes.type === 'person' ? 'Person' : 'Organization',
      name: author.attributes.name,
      identifier: author.id,
      jobTitle: author.attributes.jobTitle || undefined,
      url: author.attributes.url || `${PUBLIC_BASE_URL}/authors/${author.id}`,
      description: author.attributes.resume || undefined,
      email: author.attributes.email || undefined,
      telephone: author.attributes.telephone || undefined,
    },
    breadcrumb: (breadcrumb.itemListElement as unknown[]).length > 1 ? breadcrumb : undefined,
  };

  if (author.relationships.thumbnail.data?.id) {
    const media = getRelated(
      author.relationships.thumbnail.data,
      data.scope?.included as Butterfly.Resource[],
    ) as Butterfly.Media;
    scheme.image = getMediaUrl({ media, format: 'square', ext: 'jpg' });
  }

  return scheme;
}
