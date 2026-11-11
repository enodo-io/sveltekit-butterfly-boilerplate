import slugify from 'slugify';
import type * as Butterfly from '@enodo/butterfly-ts';

export type HeadingInfo = { level: number; id?: string };

/**
 * The heading outline of a post body, under the page's h1:
 *
 * - levels never skip: an editor's title4 right after a title2 renders as an h3
 *   (a heading is at most one level below the previous one, h2 at least);
 * - FAQ questions are h2;
 * - anchors (`id`) are unique (`intro`, `intro-2`…) and never empty.
 *
 * Returns, per body element, its heading info, or undefined for non-headings.
 */
export function postOutline(
  body: Butterfly.PostBody.BodyData[] | undefined,
): (HeadingInfo | undefined)[] {
  const seen = new Map<string, number>();
  const uniqueId = (text: string) => {
    const slug = slugify(text, { lower: true, strict: true });
    if (!slug) return undefined;
    const n = (seen.get(slug) || 0) + 1;
    seen.set(slug, n);
    return n === 1 ? slug : `${slug}-${n}`;
  };

  let previous = 1; // the page title
  return (body || []).map((element) => {
    const title = /^title([2-6])$/.exec(element.type);
    if (title) {
      const level = Math.max(2, Math.min(Number(title[1]), previous + 1));
      previous = level;
      return { level, id: uniqueId(String((element as Butterfly.PostBody.Title).data)) };
    }
    if (element.type === 'faq') {
      previous = 2;
      return { level: 2, id: uniqueId((element as Butterfly.PostBody.FAQ).data.question) };
    }
    return undefined;
  });
}
