/**
 * Article JSON-LD Schema Generator
 *
 * `AdvertiserContentArticle` (flag `sponso`, with its `sponsor` custom field),
 * `NewsArticle` (flag `news`) or `Article`:
 *
 * - image: the thumbnail in 1:1 and 16:9, 1200px wide (Google Discover / Top
 *   Stories: several ratios, at least 1200px);
 * - author: the author nodes shared with the profile pages (`@id`, see Person);
 * - publisher: the site's Organization (`@id`, see Organization);
 * - mainEntityOfPage: the WebPage (breadcrumb).
 *
 * @module Article
 */

import type { AdvertiserContentArticle, Article, NewsArticle } from 'schema-dts';
import type * as Butterfly from '@enodo/butterfly-ts';

import { getRelated } from '@enodo/butterfly-ts';
import { getMediaUrl } from '$lib/getMediaUrl';
import { customString } from '$lib/posts';
import generateWebPage from './WebPage';
import generateOrganization from './Organization';
import getAuthor from './Person';

type ArticleLike = Article | NewsArticle | AdvertiserContentArticle;

const articleType = (post: Butterfly.Post): ArticleLike['@type'] => {
  if (post.attributes.flags.includes('sponso')) return 'AdvertiserContentArticle';
  if (post.attributes.flags.includes('news')) return 'NewsArticle';
  return 'Article';
};

/** The thumbnail in the ratios Google asks for (1:1, 16:9), 1200px wide at most the source */
export function articleImages(media: Butterfly.Media | undefined): string[] | undefined {
  if (!media) return undefined;
  const width = Math.min(1200, (media.attributes as { width?: number }).width || 1200);
  return (['square', 'thumb'] as const).map((format) =>
    getMediaUrl({ media, format, width, ext: 'jpg' }),
  );
}

export default function getArticle(data: App.PageData): ArticleLike {
  const post = data.scope?.data as Butterfly.Post;
  const included = (data.scope?.included || []) as Butterfly.Resource[];
  const sponsor = post.attributes.flags.includes('sponso') ? customString(post, 'sponsor') : null;
  const section = post.relationships.category.data
    ? getRelated<Butterfly.Category>(post.relationships.category.data, data.categories.data)
    : undefined;
  const tags = post.relationships.terms.data
    .filter((t) => t.type === 'term<tags>')
    .map((t) => getRelated<Butterfly.Term>(t, included)?.attributes.name)
    .filter(Boolean) as string[];

  const scheme: ArticleLike = {
    '@type': articleType(post),
    '@id': `${data.meta.url}#scope`,
    headline: post.attributes.title,
    description: post.attributes.resume || undefined,
    mainEntityOfPage: generateWebPage(data),
    datePublished: post.attributes.publishedAt,
    dateModified:
      post.attributes.updatedAt > post.attributes.publishedAt
        ? post.attributes.updatedAt
        : post.attributes.publishedAt,
    url: data.meta.url,
    image: articleImages(getRelated<Butterfly.Media>(post.relationships.thumbnail.data, included)),
    articleSection: section?.attributes.name,
    keywords: tags.length ? tags.join(', ') : undefined,
    publisher: generateOrganization(data),
    sponsor: sponsor ? { '@type': 'Organization', name: sponsor } : undefined,
  };

  if (post.relationships.authors.data.length) {
    scheme.author = post.relationships.authors.data
      .map((a) => getRelated<Butterfly.Author>(a, included))
      .filter((a): a is Butterfly.Author => !!a)
      .map((author) => getAuthor(author, included));
  }

  return scheme;
}
