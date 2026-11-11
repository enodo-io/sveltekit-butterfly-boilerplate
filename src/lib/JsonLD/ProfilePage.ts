/**
 * ProfilePage JSON-LD Schema Generator
 *
 * An author's profile page: its `mainEntity` is the author node shared with the
 * articles (same `@id`, see Person), with its image and description.
 *
 * @module ProfilePage
 */

import type { ProfilePage } from 'schema-dts';
import type * as Butterfly from '@enodo/butterfly-ts';
import BreadcrumbList from './BreadcrumbList';
import getAuthor from './Person';
import { WEBSITE_ID } from './ids';

export default function getProfilePage(data: App.PageData): ProfilePage {
  const author = data.scope?.data as Butterfly.Author;
  const breadcrumb = BreadcrumbList(data);

  return {
    '@type': 'ProfilePage',
    '@id': `${data.meta.url}#page`,
    url: data.meta.url,
    name: data.meta.title,
    isPartOf: { '@id': WEBSITE_ID },
    mainEntity: getAuthor(author, data.scope?.included as Butterfly.Resource[], { full: true }),
    breadcrumb: (breadcrumb.itemListElement as unknown[]).length > 1 ? breadcrumb : undefined,
  };
}
