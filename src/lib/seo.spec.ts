import { describe, expect, it } from 'vitest';
import { metaDescription } from './seo';

describe('metaDescription', () => {
  it('keeps short text, collapses whitespace', () => {
    expect(metaDescription('  a\n  b ')).toBe('a b');
    expect(metaDescription(null)).toBe('');
  });

  it('cuts long text at a word boundary with an ellipsis', () => {
    const out = metaDescription(`${'word '.repeat(60)}end`);
    expect(out.length).toBeLessThanOrEqual(160);
    expect(out.endsWith('word…')).toBe(true);
  });
});
