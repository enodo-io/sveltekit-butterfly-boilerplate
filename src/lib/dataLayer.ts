/**
 * GTM dataLayer helpers.
 *
 * Thin wrappers over `window.dataLayer.push` that:
 *   - no-op on the server (SSR-safe)
 *   - lazily initialise `window.dataLayer`
 *   - normalise common fields (stringifies `content.id` so GTM matches it consistently)
 *
 * See the `gtm-events` skill for event naming conventions.
 *
 * @module dataLayer
 */

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
 * Equivalent to `push({ event, ...payload })`.
 */
export function track(event: string, payload: LayerData = {}): void {
  push({ event, ...payload });
}

function normalise(data: LayerData): LayerData {
  if (data['content.id'] != null && typeof data['content.id'] !== 'string') {
    return { ...data, 'content.id': String(data['content.id']) };
  }
  return data;
}
