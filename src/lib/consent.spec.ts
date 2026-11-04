import { describe, it, expect, beforeEach, vi } from 'vitest';
import { afterChoice, whenCmpReady, withConsent } from './consent';

type Listener = (data: unknown, success: boolean) => void;

const cmp = (displayStatus = 'hidden') => {
  let listener: Listener = () => {};
  const w = globalThis as unknown as { window: Record<string, unknown> };
  w.window = {
    __tcfapi: (cmd: string, _v: number, cb: Listener) =>
      cmd === 'ping' ? cb({ displayStatus }, true) : (listener = cb),
  };
  return (data: unknown) => listener(data, true);
};

const consents = (on: boolean) => ({ 1: on, 7: on });

describe('withConsent', () => {
  beforeEach(() => {
    (globalThis as unknown as { window: Record<string, unknown> }).window = {};
  });

  it('runs straight away without CMP', () => {
    const fn = vi.fn();
    withConsent(fn);
    expect(fn).toHaveBeenCalledOnce();
  });

  it('waits for the choice, then runs once on consent', () => {
    const emit = cmp();
    const fn = vi.fn();
    withConsent(fn);
    emit({ gdprApplies: true, eventStatus: 'cmpuishown', purpose: { consents: {} } });
    expect(fn).not.toHaveBeenCalled();
    emit({
      gdprApplies: true,
      eventStatus: 'useractioncomplete',
      purpose: { consents: consents(true) },
    });
    emit({
      gdprApplies: true,
      eventStatus: 'useractioncomplete',
      purpose: { consents: consents(true) },
    });
    expect(fn).toHaveBeenCalledOnce();
  });

  it('never runs on a refusal', () => {
    const emit = cmp();
    const fn = vi.fn();
    withConsent(fn);
    emit({ gdprApplies: true, eventStatus: 'tcloaded', purpose: { consents: consents(false) } });
    expect(fn).not.toHaveBeenCalled();
  });

  it('runs outside the GDPR', () => {
    const emit = cmp();
    const fn = vi.fn();
    withConsent(fn);
    emit({ gdprApplies: false });
    expect(fn).toHaveBeenCalledOnce();
  });
});

describe('afterChoice', () => {
  it('waits while the banner is open, then runs once whatever the answer', () => {
    const emit = cmp();
    const fn = vi.fn();
    afterChoice(fn);
    emit({ gdprApplies: true, eventStatus: 'cmpuishown', purpose: { consents: {} } });
    expect(fn).not.toHaveBeenCalled();
    emit({ gdprApplies: true, eventStatus: 'useractioncomplete', purpose: { consents: {} } });
    emit({ gdprApplies: true, eventStatus: 'useractioncomplete', purpose: { consents: {} } });
    expect(fn).toHaveBeenCalledOnce();
  });
});

describe('whenCmpReady', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    const w = globalThis as unknown as Record<string, unknown>;
    w.window = {};
    w.document = { querySelector: () => null };
  });

  it('runs straight away without CMP', () => {
    const fn = vi.fn();
    whenCmpReady(fn);
    expect(fn).toHaveBeenCalledOnce();
  });

  it('waits for the banner of InMobi, then runs once', () => {
    const emit = cmp();
    const fn = vi.fn();
    whenCmpReady(fn);
    emit({ gdprApplies: true, eventStatus: 'stub' });
    expect(fn).not.toHaveBeenCalled();
    emit({ gdprApplies: true, eventStatus: 'cmpuishown' });
    emit({ gdprApplies: true, eventStatus: 'useractioncomplete' });
    vi.advanceTimersByTime(10_000);
    expect(fn).toHaveBeenCalledOnce();
  });

  it("waits for Google's CMP when adsbygoogle.js is on the page", () => {
    const w = globalThis as unknown as Record<string, Record<string, unknown>>;
    w.document = { querySelector: () => ({}) };
    const fn = vi.fn();
    whenCmpReady(fn);
    expect(fn).not.toHaveBeenCalled();
    // its __tcfapi a moment later
    const emit = cmp();
    vi.advanceTimersByTime(50);
    emit({ gdprApplies: true, eventStatus: 'cmpuishown' });
    expect(fn).toHaveBeenCalledOnce();
  });

  it("runs on Google's consent data for a visitor it asks nothing", () => {
    const w = globalThis as unknown as Record<string, Record<string, unknown>>;
    w.document = { querySelector: () => ({}) };
    const fn = vi.fn();
    whenCmpReady(fn);
    const [callbacks] = (w.window.googlefc as { callbackQueue: Record<string, () => void>[] })
      .callbackQueue;
    callbacks.CONSENT_DATA_READY();
    expect(fn).toHaveBeenCalledOnce();
  });

  it('runs when it listens once the banner is up (no `cmpuishown` then)', () => {
    const emit = cmp('visible');
    const fn = vi.fn();
    whenCmpReady(fn);
    emit({ gdprApplies: true, cmpStatus: 'loaded' });
    expect(fn).toHaveBeenCalledOnce();
  });

  it('runs after the fallback delay when the CMP never answers', () => {
    cmp();
    const fn = vi.fn();
    whenCmpReady(fn, 5000);
    vi.advanceTimersByTime(4999);
    expect(fn).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(fn).toHaveBeenCalledOnce();
  });
});
