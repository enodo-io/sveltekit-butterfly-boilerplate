/**
 * Normalises the `<iframe>`s of an embed's HTML (oEmbed of YouTube, Vimeo,
 * Dailymotion; raw embeds):
 *
 * - `loading="lazy"`: the player (hundreds of kB of JS per iframe) only loads
 *   near the viewport. The iframe stays in the HTML, so crawlers still see the
 *   video (a click-to-load facade would hide it from video indexing).
 * - `title`: an iframe needs an accessible name.
 * - no `frameborder` (obsolete; borders are CSS).
 */
export default function embedHtml(html: string | undefined, title?: string): string {
  if (!html) return '';
  return html.replace(/<iframe\b([^>]*)>/gi, (_, attrs: string) => {
    let out = attrs.replace(/\s+frameborder\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
    if (!/\sloading\s*=/i.test(out)) out += ' loading="lazy"';
    if (!/\stitle\s*=/i.test(out)) out += ` title="${escapeAttr(title || 'Embedded content')}"`;
    return `<iframe${out}>`;
  });
}

function escapeAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}
