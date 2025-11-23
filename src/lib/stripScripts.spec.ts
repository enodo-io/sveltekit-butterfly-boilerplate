import { describe, it, expect } from 'vitest';
import stripScripts from './stripScripts';

describe('stripScripts', () => {
  it('should be importable', () => {
    expect(typeof stripScripts).toBe('function');
  });

  it('should remove simple script tags', () => {
    const html = '<p>Hello</p><script>alert("xss")</script><p>World</p>';
    const result = stripScripts(html);
    expect(result).toBe('<p>Hello</p><p>World</p>');
    expect(result).not.toContain('<script>');
    expect(result).not.toContain('</script>');
  });

  it('should remove script tags with attributes', () => {
    const html = '<div><script src="evil.js" type="text/javascript"></script></div>';
    const result = stripScripts(html);
    expect(result).toBe('<div></div>');
    expect(result).not.toContain('<script');
  });

  it('should remove script tags with complex attributes', () => {
    const html =
      '<p>Text</p><script id="test" data-x="y" src="file.js" defer async></script><p>More</p>';
    const result = stripScripts(html);
    expect(result).toBe('<p>Text</p><p>More</p>');
  });

  it('should handle case-insensitive script tags', () => {
    const html = '<p>Test</p><SCRIPT>alert(1)</SCRIPT><p>Done</p>';
    const result = stripScripts(html);
    expect(result).toBe('<p>Test</p><p>Done</p>');
  });

  it('should handle script tags with nested content', () => {
    const html = '<div><script>if (true) { console.log("test"); }</script></div>';
    const result = stripScripts(html);
    expect(result).toBe('<div></div>');
  });

  it('should handle multiple script tags', () => {
    const html =
      '<p>Start</p><script>alert(1)</script><p>Middle</p><script src="evil.js"></script><p>End</p>';
    const result = stripScripts(html);
    expect(result).toBe('<p>Start</p><p>Middle</p><p>End</p>');
    expect(result.match(/<script/gi)).toBeNull();
  });

  it('should preserve HTML without script tags', () => {
    const html = '<div><p>Hello</p><span>World</span></div>';
    const result = stripScripts(html);
    expect(result).toBe(html);
  });

  it('should handle empty strings', () => {
    expect(stripScripts('')).toBe('');
  });

  it('should handle strings with only script tags', () => {
    expect(stripScripts('<script>test</script>')).toBe('');
    expect(stripScripts('<script src="file.js"></script>')).toBe('');
  });

  it('should handle script tags with nested angle brackets', () => {
    const html = '<p>Before</p><script>if (x < 10 && y > 5) { }</script><p>After</p>';
    const result = stripScripts(html);
    expect(result).toBe('<p>Before</p><p>After</p>');
  });

  it('should handle malformed script tags gracefully', () => {
    const html = '<p>Text</p><script>incomplete';
    const result = stripScripts(html);
    // Should handle gracefully without breaking
    expect(typeof result).toBe('string');
  });

  it('should not remove other tags containing "script"', () => {
    const html = '<noscript>Content</noscript><div data-script="value">Text</div>';
    const result = stripScripts(html);
    expect(result).toBe('<noscript>Content</noscript><div data-script="value">Text</div>');
  });
});
