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
import {
  createTracker,
  resolveTrackerUrl,
  toHit as packageToHit,
  type Hit,
  type Tracker,
} from '@enodo/butterfly-tracker';

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

export type { Hit };
export { referrerHost, trackerUrlFromApiUrl } from '@enodo/butterfly-tracker';

/** Maps a `pageview` layer to a tracker hit, `null` when there is nothing to count. */
export function toHit(layer: LayerData): Hit | null {
  return packageToHit(layer);
}

/**
 * Off unless `PUBLIC_BUTTERFLY_TRACKER=true`. Then `PUBLIC_BUTTERFLY_TRACKER_URL` when
 * set (`off` disables), otherwise derived from `PUBLIC_API_URL`.
 */
export function trackerUrl(
  explicit: string | undefined = env.PUBLIC_BUTTERFLY_TRACKER_URL,
  apiUrl: string | undefined = env.PUBLIC_API_URL,
  on: string | undefined = env.PUBLIC_BUTTERFLY_TRACKER,
): string | null {
  if (on !== 'true') return null;
  return resolveTrackerUrl(explicit, apiUrl);
}

// One tracker per configuration: it holds the last hit and the entry flag
let tracker: Tracker | undefined;
let trackerKey: string | undefined;

/** Tests only: forget the last hit and the entry, as after a new page load. */
export function resetTrackerState(): void {
  tracker = undefined;
  trackerKey = undefined;
}

/**
 * Sends a pageview hit to the Butterfly tracker with `@enodo/butterfly-tracker`:
 * `POST {tracker}/h`, a `text/plain` JSON body (no CORS preflight), via `sendBeacon`
 * with a `fetch` keepalive fallback. Fire-and-forget: never throws, never blocks.
 *
 * NOT consent-gated on purpose (no `withConsent` / `whenCmpReady`): the hit is
 * cookieless and anonymous — no cookie, no storage, no identifier, credentials
 * omitted — so it fits the CNIL exemption for audience measurement and must count
 * every visit, consent given or not. Keep it that way: adding any identifier here
 * would require consent.
 *
 * The package flags the first hit after a full page load as the entry (`e: 1`)
 * with the referrer hostname (`r`), skips `page.index > 1` (pagination, infinite
 * scroll) and sends the same hit for the same URL only once in a row.
 *
 * Off by default: `PUBLIC_BUTTERFLY_TRACKER=true` turns it on (URL derived from
 * `PUBLIC_API_URL` or `PUBLIC_BUTTERFLY_TRACKER_URL`, see {@link trackerUrl}). Never
 * in dev unless `PUBLIC_BUTTERFLY_TRACKER_DEV=true`.
 */
function sendHit(layer: LayerData): void {
  try {
    const url = trackerUrl();
    const enabled = !dev || env.PUBLIC_BUTTERFLY_TRACKER_DEV === 'true';
    const key = `${url}\n${enabled}`;
    if (!tracker || key !== trackerKey) {
      tracker = createTracker({ url: url ?? 'off', enabled });
      trackerKey = key;
    }
    tracker.pageview(layer);
  } catch {
    // analytics must never break the page
  }
}
