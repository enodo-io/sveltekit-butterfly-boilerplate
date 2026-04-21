import { describe, it, expect, beforeEach, vi } from 'vitest';
import { push, track } from './dataLayer';

describe('dataLayer', () => {
  beforeEach(() => {
    (globalThis as unknown as { window: { dataLayer?: unknown[] } }).window = {};
  });

  it('push initialises window.dataLayer lazily', () => {
    push({ 'app.version': '1.2.3' });
    expect(window.dataLayer).toEqual([{ 'app.version': '1.2.3' }]);
  });

  it('push appends rather than replacing', () => {
    push({ a: 1 });
    push({ b: 2 });
    expect(window.dataLayer).toEqual([{ a: 1 }, { b: 2 }]);
  });

  it('track wraps the payload with an event field', () => {
    track('pageview', { 'content.type': 'home' });
    expect(window.dataLayer).toEqual([{ event: 'pageview', 'content.type': 'home' }]);
  });

  it('track works without a payload', () => {
    track('ping');
    expect(window.dataLayer).toEqual([{ event: 'ping' }]);
  });

  it('normalises content.id to a string', () => {
    track('pageview', { 'content.id': 42 });
    expect(window.dataLayer?.[0]).toMatchObject({ 'content.id': '42' });
  });

  it('leaves content.id alone when already a string', () => {
    track('pageview', { 'content.id': 'abc' });
    expect(window.dataLayer?.[0]).toMatchObject({ 'content.id': 'abc' });
  });

  it('does not touch content.id when absent', () => {
    track('pageview', { 'content.type': 'home' });
    expect(window.dataLayer?.[0]).not.toHaveProperty('content.id');
  });

  it('is SSR-safe (no-op when window is undefined)', () => {
    const origWindow = (globalThis as unknown as { window?: unknown }).window;
    delete (globalThis as unknown as { window?: unknown }).window;
    expect(() => push({ a: 1 })).not.toThrow();
    expect(() => track('pageview')).not.toThrow();
    (globalThis as unknown as { window?: unknown }).window = origWindow;
  });

  it('does not mutate the caller payload', () => {
    const payload = { 'content.id': 7 };
    track('pageview', payload);
    expect(payload).toEqual({ 'content.id': 7 });
  });

  it('does not swallow vi mocks on window.dataLayer', () => {
    const spy = vi.fn();
    window.dataLayer = [];
    window.dataLayer.push = spy;
    push({ foo: 'bar' });
    expect(spy).toHaveBeenCalledWith({ foo: 'bar' });
  });
});
