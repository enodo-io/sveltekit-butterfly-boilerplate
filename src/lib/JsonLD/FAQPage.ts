/**
 * FAQPage JSON-LD Schema Generator
 *
 * The questions of a post's FAQ blocks.
 *
 * @module FAQPage
 * @param {App.PageData} data - Page data
 * @returns {FAQPage} - Structured web page data
 */

import type { FAQPage, Question } from 'schema-dts';
import type * as Butterfly from '@enodo/butterfly-ts';
import { WEBSITE_ID } from './ids';

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

  // emitted with the Article of the post (FAQ rich results are limited to
  // government and health sites since 2023: the Article carries the post)
  return {
    '@type': 'FAQPage',
    '@id': `${data.meta.url}#faq`,
    url: data.meta.url,
    name: post.attributes.title,
    isPartOf: { '@id': WEBSITE_ID },
    mainEntity: questions,
  };
}
