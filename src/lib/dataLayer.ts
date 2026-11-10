/**
 * Data layer helpers.
 *
 * Two sinks behind one API:
 *   1. GTM — thin wrappers over `window.dataLayer.push` that:
 *      - no-op on the server (SSR-safe)
 *      - lazily initialise `window.dataLayer`
 *      - normalise common fields (stringifies `content.id` so GTM matches it consistently)
 *   2. Butterfly tracker — every `track('pageview', layer)` also sends a first-party,
 *      cookieless hit to the Butterfly tracker (see {@link sendHit}, {@link trackerUrl}).
 *
 * See the `gtm-events` skill for event naming conventions and the hit payload.
 *
 * @module dataLayer
 */

import { dev } from '$app/environment';
import { env } from '$env/dynamic/public';

export type LayerData = Record<string, unknown>;

/**
 * Push an arbitrary payload to the GTM dataLayer. Use for app-scope metadata
 * without an `event` field (e.g. app.version, app.platform on init).
 * For named events, prefer {@link track}.
 */
export function push(data: LayerData): void {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(normalise(data));
}

/**
 * Push a named event with an optional payload.
 * Equivalent to `push({ event, ...payload })`, plus a Butterfly tracker hit for `pageview`.
 */
export function track(event: string, payload: LayerData = {}): void {
  push({ event, ...payload });
  if (event === 'pageview') sendHit(payload);
}

function normalise(data: LayerData): LayerData {
  if (data['content.id'] != null && typeof data['content.id'] !== 'string') {
    return { ...data, 'content.id': String(data['content.id']) };
  }
  return data;
}

/** Body of a Butterfly tracker hit (keys are short on purpose). */
export type Hit = {
  /** `content.type` (home | articles | post | page | author | category | tag | search…) */
  t: string;
  /** `content.id` */
  id?: string;
  /** `content.taxonomy` — taxonomy slug of a term page */
  tx?: string;
  /** `page.index` */
  pi?: number;
  /** `page.query` */
  q?: string;
  /** Entry: `1` on the first hit sent after a full page load (set by {@link sendHit}) */
  e?: 1;
  /** Referrer HOSTNAME of the entry hit, never the full URL; absent for a direct visit */
  r?: string;
};

/** Maps a `pageview` layer to a tracker hit, `null` when there is nothing to count. */
export function toHit(layer: LayerData): Hit | null {
  const t = layer['content.type'];
  if (typeof t !== 'string' || !t) return null;
  const hit: Hit = { t };
  if (layer['content.id'] != null) hit.id = String(layer['content.id']);
  if (typeof layer['content.taxonomy'] === 'string') hit.tx = layer['content.taxonomy'];
  if (typeof layer['page.index'] === 'number') hit.pi = layer['page.index'];
  if (typeof layer['page.query'] === 'string') hit.q = layer['page.query'];
  return hit;
}

let lastHit: string | undefined;
// The first hit sent after the page load is the entry (landing or full navigation)
let entrySent = false;

/** Tests only: forget the last hit and the entry, as after a new page load. */
export function resetTrackerState(): void {
  lastHit = undefined;
  entrySent = false;
}

/** Hostname of `document.referrer`, lowercase, `undefined` when empty or unparseable. */
export function referrerHost(
  referrer: string = typeof document === 'undefined' ? '' : document.referrer,
): string | undefined {
  if (!referrer) return undefined;
  try {
    return new URL(referrer).hostname.toLowerCase() || undefined;
  } catch {
    return undefined;
  }
}

/**
 * Tracker URL derived from the Butterfly API URL, following the domain convention:
 *   https://{id}.pubbtf.eno.do      -> https://{id}.tbtf.eno.do
 *   https://api{x}.example.com      -> https://t{x}.example.com  (api. -> t., apibe. -> tbe.)
 * `null` when the API URL follows neither pattern.
 */
export function trackerUrlFromApiUrl(apiUrl: string | undefined): string | null {
  if (!apiUrl) return null;
  let host: string;
  try {
    host = new URL(apiUrl).hostname.toLowerCase();
  } catch {
    return null;
  }
  const own = host.match(/^(\d+)\.pubbtf\.eno\.do$/);
  if (own) return `https://${own[1]}.tbtf.eno.do`;
  const custom = host.match(/^api([a-z0-9-]*)\.(.+\..+)$/);
  if (custom) return `https://t${custom[1]}.${custom[2]}`;
  return null;
}

/**
 * `PUBLIC_BUTTERFLY_TRACKER_URL` when set (`off` disables the tracker), otherwise
 * derived from `PUBLIC_API_URL`: the tracker is on by default.
 */
export function trackerUrl(
  explicit: string | undefined = env.PUBLIC_BUTTERFLY_TRACKER_URL,
  apiUrl: string | undefined = env.PUBLIC_API_URL,
): string | null {
  if (explicit === 'off' || explicit === 'false') return null;
  if (explicit) return explicit;
  return trackerUrlFromApiUrl(apiUrl);
}

/**
 * Sends a pageview hit to the Butterfly tracker: `POST {PUBLIC_BUTTERFLY_TRACKER_URL}/h`,
 * a `text/plain` JSON body (a CORS "simple request": no preflight), via `sendBeacon`
 * with a `fetch` keepalive fallback. Fire-and-forget: never throws, never blocks.
 *
 * NOT consent-gated on purpose (no `withConsent` / `whenCmpReady`): the hit is
 * cookieless and anonymous — no cookie, no storage, no identifier, credentials
 * omitted — so it fits the CNIL exemption for audience measurement and must count
 * every visit, consent given or not. Keep it that way: adding any identifier here
 * would require consent.
 *
 * The first hit after a full page load is flagged as the entry (`e: 1`) with the
 * referrer hostname (`r`), so the tracker can count visits by source; later SPA
 * navigations carry neither.
 *
 * One navigation = one hit:
 *   - `page.index > 1` is skipped client-side: infinite-scroll loads and pagination
 *     pages are not new views (the tracker drops them too);
 *   - the same hit for the same URL twice in a row (an effect re-run, a reload of
 *     the data without navigating) is sent once.
 *
 * On by default (URL derived from `PUBLIC_API_URL`, see {@link trackerUrl});
 * `PUBLIC_BUTTERFLY_TRACKER_URL=off` disables it. Never in dev unless
 * `PUBLIC_BUTTERFLY_TRACKER_DEV=true`.
 */
function sendHit(layer: LayerData): void {
  try {
    if (typeof window === 'undefined') return;
    const base = trackerUrl();
    if (!base) return;
    if (dev && env.PUBLIC_BUTTERFLY_TRACKER_DEV !== 'true') return;

    const hit = toHit(layer);
    if (!hit || (hit.pi ?? 1) > 1) return;

    const key = `${window.location?.href}\n${JSON.stringify(hit)}`;
    if (key === lastHit) return;
    lastHit = key;

    // Entry: the referrer HOSTNAME only (sources), never the URL: no consent needed
    if (!entrySent) {
      entrySent = true;
      hit.e = 1;
      const r = referrerHost();
      if (r) hit.r = r;
    }
    const body = JSON.stringify(hit);

    const url = `${base.replace(/\/+$/, '')}/h`;
    const n = window.navigator;
    if (
      typeof n?.sendBeacon === 'function' &&
      n.sendBeacon(url, new Blob([body], { type: 'text/plain' }))
    ) {
      return;
    }
    if (typeof window.fetch === 'function') {
      window
        .fetch(url, {
          method: 'POST',
          body,
          keepalive: true,
          credentials: 'omit',
          headers: { 'Content-Type': 'text/plain' },
        })
        .catch(() => {});
    }
  } catch {
    // analytics must never break the page
  }
}
