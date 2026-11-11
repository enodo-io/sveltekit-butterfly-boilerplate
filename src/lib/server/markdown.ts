import { marked } from 'marked';
import stripScripts from '$lib/stripScripts';
import type * as Butterfly from '@enodo/butterfly-ts';

/**
 * Markdown blocks of a post body rendered to HTML on the server (`html` next to
 * `data`), so crawlers get real headings, lists and links, and the client ships
 * no Markdown parser (`Markdown.svelte` renders `html`, the hydration keeps it).
 *
 * Headings are shifted one level down when the Markdown uses `#`: the page title
 * is the only h1. Scripts are stripped (same rule as the other HTML blocks).
 */
export function renderMarkdown(source: string): string {
  let html = marked.parse(source, { async: false, gfm: true }) as string;
  if (/<h1[\s>]/i.test(html)) {
    html = html.replace(
      /<(\/?)h([1-6])(\s|>)/gi,
      (_, slash: string, level: string, end: string) =>
        `<${slash}h${Math.min(6, Number(level) + 1)}${end}`,
    );
  }
  return stripScripts(html);
}

export function withRenderedMarkdown(
  body: Butterfly.PostBody.BodyData[] | undefined,
): Butterfly.PostBody.BodyData[] | undefined {
  return body?.map((element) =>
    element.type === 'markdown'
      ? ({ ...element, html: renderMarkdown(element.data) } as Butterfly.PostBody.BodyData)
      : element,
  );
}
