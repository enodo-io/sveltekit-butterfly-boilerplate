/**
 * Article JSON-LD Schema Generator
 *
 * Generates structured data for Article or NewsArticle schema types.
 * Includes author information, publication dates, thumbnails, and publisher data.
 *
 * @module Article
 * @param {App.PageData} data - Page data containing the post
 * @returns {Article|NewsArticle} - Structured article data
 */

import type { Article, NewsArticle, Organization, Person } from 'schema-dts';
import type * as Butterfly from '@enodo/butterfly-ts';

import { getRelated } from '@enodo/butterfly-ts';
import { getMediaUrl } from '$lib/getMediaUrl';
import { PUBLIC_BASE_URL } from '$env/static/public';
import generateWebPage from './WebPage';
import generateOrganization from './Organization';

export default function getArticle(data: App.PageData): Article | NewsArticle {
  const post = data.scope?.data as Butterfly.Post;
  const scheme: Article | NewsArticle = {
    '@type': post.attributes.flags.includes('news') ? 'NewsArticle' : 'Article',
    '@id': `${data.meta.url}#scope`,
    headline: post.attributes.title,
    description: post.attributes.resume,
    mainEntityOfPage: generateWebPage(data),
    datePublished: post.attributes.publishedAt,
    url: data.meta.url,
    publisher: generateOrganization(data),
  };

  if (post.attributes.publishedAt < post.attributes.updatedAt) {
    scheme.dateModified = post.attributes.updatedAt;
  }

  if (post.relationships.thumbnail.data?.id) {
    const media = data.scope?.included.find(
      (i: Butterfly.Resource) =>
        i.id === post.relationships.thumbnail.data?.id &&
        i.type === post.relationships.thumbnail.data?.type,
    ) as Butterfly.Media;
    scheme.image = [getMediaUrl({ media, format: 'thumb', ext: 'jpg' })];
  }

  if (post.relationships.authors.data.length) {
    scheme.author = post.relationships.authors.data.map((a: Butterfly.Related) => {
      const author = getRelated<Butterfly.Author>(
        a,
        data.scope?.included as Butterfly.Resource[],
      ) as Butterfly.Author;
      const authorLd: Person | Organization = {
        '@type': author.attributes.type === 'person' ? 'Person' : 'Organization',
        name: author.attributes.name,
        jobTitle: author.attributes.jobTitle || undefined,
        url: author.attributes.url || `${PUBLIC_BASE_URL}/authors/${author.id}`,
      };

      return authorLd;
    });
  }

  return scheme;
}
