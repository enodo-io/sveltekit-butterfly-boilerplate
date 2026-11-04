/**
 * Article JSON-LD Schema Generator
 *
 * `AdvertiserContentArticle` (flag `sponso`, with its `sponsor` custom field),
 * `NewsArticle` (flag `news`) or `Article`, with author information,
 * publication dates, thumbnail and publisher data.
 *
 * @module Article
 * @param {App.PageData} data - Page data containing the post
 * @returns {ArticleLike} - Structured article data
 */

import type {
  AdvertiserContentArticle,
  Article,
  NewsArticle,
  Organization,
  Person,
} from 'schema-dts';
import type * as Butterfly from '@enodo/butterfly-ts';

import { getRelated } from '@enodo/butterfly-ts';
import { getMediaUrl } from '$lib/getMediaUrl';
import { PUBLIC_BASE_URL } from '$env/static/public';
import { customString } from '$lib/posts';
import generateWebPage from './WebPage';
import generateOrganization from './Organization';

type ArticleLike = Article | NewsArticle | AdvertiserContentArticle;

const articleType = (post: Butterfly.Post): ArticleLike['@type'] => {
  if (post.attributes.flags.includes('sponso')) return 'AdvertiserContentArticle';
  if (post.attributes.flags.includes('news')) return 'NewsArticle';
  return 'Article';
};

export default function getArticle(data: App.PageData): ArticleLike {
  const post = data.scope?.data as Butterfly.Post;
  const sponsor = post.attributes.flags.includes('sponso') ? customString(post, 'sponsor') : null;
  const scheme: ArticleLike = {
    '@type': articleType(post),
    '@id': `${data.meta.url}#scope`,
    headline: post.attributes.title,
    description: post.attributes.resume,
    mainEntityOfPage: generateWebPage(data),
    datePublished: post.attributes.publishedAt,
    url: data.meta.url,
    publisher: generateOrganization(data),
    sponsor: sponsor ? { '@type': 'Organization', name: sponsor } : undefined,
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
