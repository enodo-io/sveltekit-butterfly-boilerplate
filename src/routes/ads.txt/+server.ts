import type { RequestHandler } from './$types';
import { txtFileResponse } from '$lib/server/txtFile';

/** The ads.txt of the txt-files plugin (404 when not configured). */
export const GET: RequestHandler = ({ fetch }) => txtFileResponse(fetch, 'ads.txt');
