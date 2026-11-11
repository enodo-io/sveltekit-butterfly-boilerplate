import { PUBLIC_BASE_URL } from '$env/static/public';

/**
 * Classifies a link of the CMS content (post body, quote source…).
 *
 * Internal = same host as `PUBLIC_BASE_URL` (www. or not, http or https) or a
 * relative URL: rendered as a path (client-side navigation, no new tab, never
 * `rel="sponsored"`). External http(s) links open in a new tab. `mailto:`,
 * `tel:`… stay as they are. An empty href is `null`: render the text, no link.
 */
export type ContentLink = { href: string; internal: boolean; web: boolean };

const bare = (host: string) => host.toLowerCase().replace(/^www\./, '');

export function contentLink(raw: string | null | undefined): ContentLink | null {
  const value = (raw || '').trim();
  if (!value || value === '#') return null;
  const base = new URL(PUBLIC_BASE_URL);
  let url: URL;
  try {
    url = new URL(value, base);
  } catch {
    return null;
  }
  const web = url.protocol === 'http:' || url.protocol === 'https:';
  if (web && bare(url.host) === bare(base.host)) {
    return { href: `${url.pathname}${url.search}${url.hash}` || '/', internal: true, web };
  }
  return { href: url.href, internal: false, web };
}

/** `rel` of an external link: noopener, plus the qualifiers Google asks for paid / user / untrusted links */
export function externalRel({
  sponsored = false,
  ugc = false,
  nofollow = false,
}: {
  sponsored?: boolean;
  ugc?: boolean;
  nofollow?: boolean;
}): string {
  return [sponsored && 'sponsored', ugc && 'ugc', nofollow && 'nofollow', 'noopener']
    .filter(Boolean)
    .join(' ');
}
