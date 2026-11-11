import { describe, expect, it } from 'vitest';
import embedHtml from './embedHtml';

describe('embedHtml', () => {
  it('lazy loads, names the iframe and drops frameborder', () => {
    const out = embedHtml(
      '<iframe width="200" height="113" src="https://www.youtube.com/embed/x?feature=oembed" frameborder="0" allowfullscreen></iframe>',
      'My "video" <1>',
    );
    expect(out).toBe(
      '<iframe width="200" height="113" src="https://www.youtube.com/embed/x?feature=oembed" allowfullscreen loading="lazy" title="My &quot;video&quot; &lt;1>"></iframe>',
    );
  });

  it('keeps an existing loading / title and leaves other markup alone', () => {
    const html = '<div><iframe src="a" title="Player" loading="eager"></iframe><p>x</p></div>';
    expect(embedHtml(html)).toBe(html);
  });

  it('is empty without html', () => {
    expect(embedHtml(undefined)).toBe('');
  });
});
