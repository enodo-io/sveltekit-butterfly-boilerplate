import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  push,
  referrerHost,
  resetTrackerState,
  track,
  toHit,
  trackerUrl,
  trackerUrlFromApiUrl,
} from './dataLayer';

const mocks = vi.hoisted(() => ({
  dev: false,
  env: {} as Record<string, string | undefined>,
}));
vi.mock('$app/environment', () => ({
  get dev() {
    return mocks.dev;
  },
}));
vi.mock('$env/dynamic/public', () => ({ env: mocks.env }));

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

describe('dataLayer — Butterfly tracker sink', () => {
  let sendBeacon: ReturnType<typeof vi.fn>;
  let fetch: ReturnType<typeof vi.fn>;
  let href = 0;

  const setWindow = (navigator: Record<string, unknown>) => {
    // a new URL per test so the consecutive-duplicate guard never leaks between tests
    href += 1;
    (globalThis as unknown as { window: unknown }).window = {
      navigator,
      fetch,
      location: { href: `https://site.test/${href}` },
    };
  };
  const sentBody = async (call: unknown[]) => JSON.parse(await (call[1] as Blob).text());

  beforeEach(() => {
    mocks.dev = false;
    mocks.env.PUBLIC_BUTTERFLY_TRACKER_URL = 'https://42.tbtf.eno.do';
    delete mocks.env.PUBLIC_BUTTERFLY_TRACKER_DEV;
    sendBeacon = vi.fn(() => true);
    fetch = vi.fn(() => Promise.resolve(new Response()));
    setWindow({ sendBeacon });
    resetTrackerState();
  });
  afterEach(() => {
    delete mocks.env.PUBLIC_BUTTERFLY_TRACKER_URL;
    delete (globalThis as unknown as { document?: unknown }).document;
  });

  it('maps the layer to the short hit payload', () => {
    expect(
      toHit({
        'content.type': 'tag',
        'content.id': 'svelte',
        'content.taxonomy': 'tags',
        'page.index': 1,
        'content.tags': ['a'],
      }),
    ).toEqual({ t: 'tag', id: 'svelte', tx: 'tags', pi: 1 });
    expect(toHit({ 'content.type': 'post', 'content.id': 42 })).toEqual({ t: 'post', id: '42' });
    expect(toHit({ 'content.type': 'search', 'page.index': 1, 'page.query': 'vélo' })).toEqual({
      t: 'search',
      pi: 1,
      q: 'vélo',
    });
    expect(toHit({ 'content.type': 'home' })).toEqual({ t: 'home' });
    expect(toHit({})).toBeNull();
  });

  it('sends a pageview with sendBeacon as text/plain to {TRACKER_URL}/h', async () => {
    track('pageview', { 'content.type': 'post', 'content.id': 42 });
    expect(sendBeacon).toHaveBeenCalledTimes(1);
    const call = sendBeacon.mock.calls[0];
    expect(call[0]).toBe('https://42.tbtf.eno.do/h');
    expect((call[1] as Blob).type).toBe('text/plain');
    expect(await sentBody(call)).toEqual({ t: 'post', id: '42', e: 1 });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('keeps the GTM push identical', () => {
    track('pageview', { 'content.type': 'post', 'content.id': 42 });
    expect(window.dataLayer).toEqual([
      { event: 'pageview', 'content.type': 'post', 'content.id': '42' },
    ]);
  });

  it('flags only the first sent hit as the entry, with the referrer hostname', async () => {
    (globalThis as unknown as { document: unknown }).document = {
      referrer: 'https://www.Google.fr/search?q=private',
    };
    // A skipped hit (page 2) does not consume the entry
    track('pageview', { 'content.type': 'category', 'content.id': 3, 'page.index': 2 });
    track('pageview', { 'content.type': 'home' });
    setWindow({ sendBeacon });
    track('pageview', { 'content.type': 'post', 'content.id': 7 });
    expect(sendBeacon).toHaveBeenCalledTimes(2);
    expect(await sentBody(sendBeacon.mock.calls[0])).toEqual({
      t: 'home',
      e: 1,
      r: 'www.google.fr',
    });
    expect(await sentBody(sendBeacon.mock.calls[1])).toEqual({ t: 'post', id: '7' });
  });

  it('direct visit: entry without referrer', async () => {
    (globalThis as unknown as { document: unknown }).document = { referrer: '' };
    track('pageview', { 'content.type': 'home' });
    expect(await sentBody(sendBeacon.mock.calls[0])).toEqual({ t: 'home', e: 1 });
    expect(referrerHost('not a url')).toBeUndefined();
  });

  it('falls back to fetch keepalive without sendBeacon', () => {
    setWindow({});
    track('pageview', { 'content.type': 'home' });
    expect(fetch).toHaveBeenCalledWith('https://42.tbtf.eno.do/h', {
      method: 'POST',
      body: '{"t":"home","e":1}',
      keepalive: true,
      credentials: 'omit',
      headers: { 'Content-Type': 'text/plain' },
    });
  });

  it('falls back to fetch when sendBeacon refuses the hit', () => {
    sendBeacon.mockReturnValue(false);
    track('pageview', { 'content.type': 'home' });
    expect(sendBeacon).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('is on by default: URL derived from PUBLIC_API_URL', () => {
    delete mocks.env.PUBLIC_BUTTERFLY_TRACKER_URL;
    mocks.env.PUBLIC_API_URL = 'https://apibe.touslesresultats.com';
    track('pageview', { 'content.type': 'home' });
    expect(sendBeacon).toHaveBeenCalledTimes(1);
    expect(sendBeacon.mock.calls[0][0]).toBe('https://tbe.touslesresultats.com/h');
    delete mocks.env.PUBLIC_API_URL;
  });

  it('is disabled with PUBLIC_BUTTERFLY_TRACKER_URL=off, or without a derivable API URL', () => {
    mocks.env.PUBLIC_BUTTERFLY_TRACKER_URL = 'off';
    mocks.env.PUBLIC_API_URL = 'https://42.pubbtf.eno.do';
    track('pageview', { 'content.type': 'home' });
    delete mocks.env.PUBLIC_BUTTERFLY_TRACKER_URL;
    mocks.env.PUBLIC_API_URL = 'https://cms.example.com';
    track('pageview', { 'content.type': 'post', 'content.id': 1 });
    expect(sendBeacon).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
    expect(window.dataLayer).toHaveLength(2);
    delete mocks.env.PUBLIC_API_URL;
  });

  it('derives the tracker URL from the API URL convention', () => {
    expect(trackerUrlFromApiUrl('https://42.pubbtf.eno.do')).toBe('https://42.tbtf.eno.do');
    expect(trackerUrlFromApiUrl('https://api.touslesresultats.com/')).toBe(
      'https://t.touslesresultats.com',
    );
    expect(trackerUrlFromApiUrl('https://apiqc.touslesresultats.com')).toBe(
      'https://tqc.touslesresultats.com',
    );
    expect(trackerUrlFromApiUrl('https://cms.example.com')).toBeNull();
    expect(trackerUrlFromApiUrl('not a url')).toBeNull();
    expect(trackerUrl('https://stats.example.com', 'https://42.pubbtf.eno.do')).toBe(
      'https://stats.example.com',
    );
    expect(trackerUrl(undefined, 'https://42.pubbtf.eno.do')).toBe('https://42.tbtf.eno.do');
    expect(trackerUrl('off', 'https://42.pubbtf.eno.do')).toBeNull();
  });

  it('is disabled in dev unless PUBLIC_BUTTERFLY_TRACKER_DEV=true', () => {
    mocks.dev = true;
    track('pageview', { 'content.type': 'home' });
    expect(sendBeacon).not.toHaveBeenCalled();
    mocks.env.PUBLIC_BUTTERFLY_TRACKER_DEV = 'true';
    track('pageview', { 'content.type': 'home' });
    expect(sendBeacon).toHaveBeenCalledTimes(1);
  });

  it('skips page.index > 1 client-side (infinite scroll / pagination are not views)', () => {
    track('pageview', { 'content.type': 'articles', 'page.index': 2 });
    expect(sendBeacon).not.toHaveBeenCalled();
    expect(window.dataLayer).toHaveLength(1);
  });

  it('sends page.index 1 with pi', async () => {
    track('pageview', { 'content.type': 'articles', 'page.index': 1 });
    expect(await sentBody(sendBeacon.mock.calls[0])).toEqual({ t: 'articles', pi: 1, e: 1 });
  });

  it('only sends for pageview events', () => {
    track('infinite_scroll', { 'content.type': 'articles', 'page.index': 1 });
    push({ 'content.type': 'home' });
    expect(sendBeacon).not.toHaveBeenCalled();
  });

  it('sends one hit per navigation (same URL + payload twice in a row = one hit)', () => {
    track('pageview', { 'content.type': 'home' });
    track('pageview', { 'content.type': 'home' });
    expect(sendBeacon).toHaveBeenCalledTimes(1);
    track('pageview', { 'content.type': 'articles', 'page.index': 1 });
    expect(sendBeacon).toHaveBeenCalledTimes(2);
  });

  it('never throws, even when sendBeacon does', () => {
    sendBeacon.mockImplementation(() => {
      throw new Error('boom');
    });
    expect(() => track('pageview', { 'content.type': 'home' })).not.toThrow();
    expect(window.dataLayer).toHaveLength(1);
  });

  it('sets no cookie, no storage', () => {
    const w = window as unknown as Record<string, unknown>;
    w.document = { cookie: '' };
    w.localStorage = { setItem: vi.fn() };
    track('pageview', { 'content.type': 'home' });
    expect((w.document as { cookie: string }).cookie).toBe('');
    expect(
      (w.localStorage as { setItem: ReturnType<typeof vi.fn> }).setItem,
    ).not.toHaveBeenCalled();
  });
});
