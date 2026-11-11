/**
 * Author node (Person, or Organization for a non-person author), the same for
 * the article `author` and the profile page `mainEntity`: one `@id`, the
 * profile page as `url`, the author's own site / social profile as `sameAs`.
 * No email or telephone: personal data, and no rich result uses them.
 *
 * @module Person
 */

import type { Organization, Person } from 'schema-dts';
import type * as Butterfly from '@enodo/butterfly-ts';
import { getRelated } from '@enodo/butterfly-ts';
import { getMediaUrl } from '$lib/getMediaUrl';
import { authorId, authorUrl } from './ids';

export default function getAuthor(
  author: Butterfly.Author,
  included: Butterfly.Resource[] = [],
  { full = false }: { full?: boolean } = {},
): Person | Organization {
  const node: Record<string, unknown> = {
    '@type': author.attributes.type === 'organization' ? 'Organization' : 'Person',
    '@id': authorId(author.id),
    name: author.attributes.name,
    url: authorUrl(author.id),
    sameAs: author.attributes.url ? [author.attributes.url] : undefined,
  };
  if (author.attributes.type !== 'organization') {
    node.jobTitle = author.attributes.jobTitle || undefined;
  }
  if (full) {
    node.description = author.attributes.resume || undefined;
    const media = getRelated<Butterfly.Media>(author.relationships.thumbnail?.data, included);
    if (media) node.image = getMediaUrl({ media, format: 'square', width: 400, ext: 'jpg' });
  }
  return node as unknown as Person | Organization;
}
