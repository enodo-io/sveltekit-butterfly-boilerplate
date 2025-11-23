import type { ParamMatcher } from '@sveltejs/kit';

export const match: ParamMatcher = (param) =>
  !!parseInt(param.split('/').pop()!.split(/[-]+/).pop()!, 10);
