import { describe, expect, it } from 'vitest';
import { postOutline } from './postOutline';
import type * as Butterfly from '@enodo/butterfly-ts';

const t = (n: number, data: string) => ({ type: `title${n}`, data }) as Butterfly.PostBody.BodyData;

describe('postOutline', () => {
  it('never skips a level', () => {
    const out = postOutline([t(4, 'A'), t(2, 'B'), t(5, 'C'), t(3, 'D')]);
    expect(out.map((h) => h?.level)).toEqual([2, 2, 3, 3]);
  });

  it('gives unique, non-empty ids', () => {
    const out = postOutline([
      t(2, 'Intro'),
      { type: 'paragraph', data: [] } as unknown as Butterfly.PostBody.BodyData,
      t(2, 'Intro'),
      t(2, '!!!'),
      { type: 'faq', data: { question: 'Intro', value: '' } } as Butterfly.PostBody.BodyData,
    ]);
    expect(out.map((h) => h?.id)).toEqual(['intro', undefined, 'intro-2', undefined, 'intro-3']);
  });
});
