import type { ParamMatcher } from '@sveltejs/kit';
import { PUBLIC_STATIC_PAGES } from '$env/static/public';

const pages = JSON.parse(PUBLIC_STATIC_PAGES || '{}');

export const match: ParamMatcher = (param) => param in pages;
