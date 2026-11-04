import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * `/sitemap.xml` is where robots and the SEO tools look first; the sitemaps
 * live under `/sitemaps/` (index, news, sections, tags, authors, pages, posts).
 */
export const GET: RequestHandler = () => redirect(301, '/sitemaps/index.xml');
