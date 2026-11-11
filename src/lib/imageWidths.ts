/**
 * The widths the media CDN is asked for, snapped up to a fixed ladder: every
 * component requests the same few variants (640/760/768 → 768), so the CDN
 * cache is shared between pages and components instead of fragmented.
 */
export const WIDTH_LADDER = [160, 240, 320, 400, 480, 640, 768, 960, 1080, 1280, 1536, 1920, 2560];

/** The ladder step at or above `width` (the largest step beyond the ladder). */
export function snapWidth(width: number): number {
  return WIDTH_LADDER.find((step) => step >= width) ?? WIDTH_LADDER[WIDTH_LADDER.length - 1];
}

/**
 * srcset widths for the rendered `widths` (and their 2x), snapped to the ladder,
 * deduplicated, never above the source width (the largest step kept when even
 * the smallest is above it, the CDN does not upscale).
 */
export function srcsetWidths(widths: number[], sourceWidth: number): number[] {
  const steps = [...new Set(widths.flatMap((w) => [w, w * 2]).map(snapWidth))].sort(
    (a, b) => a - b,
  );
  const fit = steps.filter((w) => w <= sourceWidth);
  return fit.length ? fit : steps.slice(0, 1);
}
