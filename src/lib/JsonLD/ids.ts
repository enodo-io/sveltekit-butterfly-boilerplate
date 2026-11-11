/**
 * Stable `@id`s of the nodes shared between pages: Google merges the nodes with
 * the same `@id` (the publisher of every article is the site's Organization, the
 * author of an article is the Person of its profile page).
 *
 * @module JsonLD/ids
 */

import { PUBLIC_BASE_URL } from '$env/static/public';

const base = PUBLIC_BASE_URL.replace(/\/+$/, '');

export const ORGANIZATION_ID = `${base}/#organization`;
export const WEBSITE_ID = `${base}/#website`;

/** URL of an author's profile page on the site */
export const authorUrl = (id: string) => `${base}/authors/${id}`;
/** `@id` of the Person / Organization of an author (article author = profile mainEntity) */
export const authorId = (id: string) => `${authorUrl(id)}#author`;
