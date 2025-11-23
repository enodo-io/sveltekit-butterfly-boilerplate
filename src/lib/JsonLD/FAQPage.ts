/**
 * FAQPage JSON-LD Schema Generator
 *
 * Generates structured data for faq pages.
 * Includes page URL, ID, and breadcrumb navigation.
 *
 * @module FAQPage
 * @param {App.PageData} data - Page data
 * @returns {FAQPage} - Structured web page data
 */

import type { FAQPage, Question } from 'schema-dts';
import type * as Butterfly from '@enodo/butterfly-ts';
import { getRelated } from '@enodo/butterfly-ts';
import { getMediaUrl } from '$lib/getMediaUrl';
import BreadcrumbList from './BreadcrumbList';
import Organization from './Organization';

function inlineNodesToText(nodes: string | Butterfly.PostBody.BodyInlineNode[]): string {
  if (typeof nodes === 'string') return nodes;
  return nodes
    .map((node) => {
      // Most inline nodes carry their content in `value`
      const anyNode = node as unknown as { value?: unknown; type?: string };
      if (anyNode && typeof anyNode.value !== 'undefined') {
        const v = anyNode.value as unknown;
        if (typeof v === 'string') return v;
        if (Array.isArray(v)) return inlineNodesToText(v as Butterfly.PostBody.BodyInlineNode[]);
      }
      // Soft line break handling
      if (anyNode.type === 'break') return '\n';
      return '';
    })
    .join('');
}

export default function getFAQPage(data: App.PageData): FAQPage {
  const post = data.scope?.data as Butterfly.Post;

  const questions: Question[] = (post.attributes.body as Butterfly.PostBody.BodyData[])
    .filter((item: Butterfly.PostBody.BodyData) => item.type === 'faq')
    .map((q: Butterfly.PostBody.FAQ) => ({
      '@type': 'Question',
      name: q.data.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: inlineNodesToText(q.data.value),
      },
    }));

  const breadcrumb = BreadcrumbList(data);

  const scheme: FAQPage = {
    '@type': 'FAQPage',
    '@id': `${data.meta.url}#scope`,
    url: data.meta.url,
    mainEntity: questions ?? [],
    breadcrumb: (breadcrumb.itemListElement as unknown[]).length > 1 ? breadcrumb : undefined,
    headline: post.attributes.title,
    description: post.attributes.resume,
    datePublished: post.attributes.publishedAt,
    publisher: Organization(data),
  };

  if (post.attributes.publishedAt < post.attributes.updatedAt) {
    scheme.dateModified = post.attributes.updatedAt;
  }

  if (post.relationships.thumbnail.data?.id) {
    const media = getRelated<Butterfly.Media>(
      post.relationships.thumbnail.data,
      data.scope?.included || [],
    );
    scheme.image = media ? [getMediaUrl({ media, format: 'thumb', ext: 'jpg' })] : undefined;
  }

  return scheme;
}
