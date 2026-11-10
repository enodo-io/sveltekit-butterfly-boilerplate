/**
 * Downstream TTL of a sitemap file: news 300s; index, current period posts,
 * categories, tags, authors, pages 3600s; closed periods 86400s.
 *
 * The API tells the kind of file through its own `max-age` (300 for news,
 * 86400 for a closed period, 3600 otherwise). Without it, a file named after
 * a past year / month is a closed period.
 */
export function sitemapMaxAge(file: string, apiMaxAge: number | null, now = new Date()): number {
  if (apiMaxAge !== null) {
    if (apiMaxAge <= 300) return 300;
    if (apiMaxAge >= 86400) return 86400;
    return 3600;
  }

  const period = /-(\d{4})(?:-(\d{2}))?(?:-\d+)?\.xml$/.exec(file);
  if (period) {
    const year = Number(period[1]);
    const month = period[2] ? Number(period[2]) : null;
    const current = now.getUTCFullYear();
    const closed =
      year < current || (month !== null && year === current && month < now.getUTCMonth() + 1);
    if (closed) return 86400;
  }
  return 3600;
}
