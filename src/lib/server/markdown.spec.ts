import { describe, expect, it } from 'vitest';
import { renderMarkdown } from './markdown';

describe('renderMarkdown', () => {
  it('renders Markdown, shifting headings below the page h1', () => {
    const html = renderMarkdown('# Title\n\n## Sub\n\nSee [docs](https://a.b).');
    expect(html).toContain('<h2>Title</h2>');
    expect(html).toContain('<h3>Sub</h3>');
    expect(html).toContain('<a href="https://a.b">docs</a>');
  });

  it('keeps levels when there is no h1, strips scripts', () => {
    const html = renderMarkdown('## Sub\n\n<script>alert(1)</script>');
    expect(html).toContain('<h2>Sub</h2>');
    expect(html).not.toContain('<script');
  });
});
