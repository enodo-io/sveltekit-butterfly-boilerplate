import { describe, expect, it } from 'vitest';
import { snapWidth, srcsetWidths } from './imageWidths';

describe('imageWidths', () => {
  it('snaps up to the ladder', () => {
    expect(snapWidth(380)).toBe(400);
    expect(snapWidth(768)).toBe(768);
    expect(snapWidth(9999)).toBe(2560);
  });

  it('builds a deduplicated srcset within the source width', () => {
    expect(srcsetWidths([320, 380, 480, 540], 4000)).toEqual([320, 400, 480, 640, 768, 960, 1080]);
    expect(srcsetWidths([320, 380], 700)).toEqual([320, 400, 640]);
    expect(srcsetWidths([64], 50)).toEqual([160]);
  });
});
