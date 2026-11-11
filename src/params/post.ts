import type { ParamMatcher } from '@sveltejs/kit';

/** `{slug}-{id}` (or a bare `{id}`, redirected to the full URL): the id is a positive integer */
export const match: ParamMatcher = (param) => /^(?:.*-)?[1-9]\d*$/.test(param);
