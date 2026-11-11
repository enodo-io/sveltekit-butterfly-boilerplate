import { describe, expect, it } from 'vitest';
import getVideoObjects, { isoDuration } from './VideoObject';

const page = (body: unknown[], included: unknown[] = []) =>
  ({
    meta: { url: 'https://site.test/a-1.html', title: 'A', description: '' },
    scope: {
      data: {
        id: 1,
        type: 'post',
        attributes: { title: 'Post title', publishedAt: '2026-01-02T03:04:05.000Z', body },
        relationships: {},
      },
      included,
    },
  }) as unknown as App.PageData;

describe('VideoObject', () => {
  it('formats ISO 8601 durations', () => {
    expect(isoDuration(3723)).toBe('PT1H2M3S');
    expect(isoDuration(60)).toBe('PT1M');
    expect(isoDuration(0)).toBeUndefined();
  });

  it('describes an embed from its oEmbed, skips one without thumbnail', () => {
    const videos = getVideoObjects(
      page([
        {
          type: 'youtube',
          data: {
            url: 'https://youtu.be/x',
            oembed: {
              title: 'Clip',
              thumbnail_url: 'https://i.ytimg.com/vi/x/hqdefault.jpg',
              html: '<iframe src="https://www.youtube.com/embed/x?feature=oembed"></iframe>',
              upload_date: 'not a date',
            },
          },
        },
        { type: 'vimeo', data: { url: 'https://vimeo.com/1', oembed: { title: 'No thumb' } } },
      ]),
    );
    expect(videos).toHaveLength(1);
    expect(videos[0]).toMatchObject({
      '@type': 'VideoObject',
      name: 'Clip',
      embedUrl: 'https://www.youtube.com/embed/x?feature=oembed',
      uploadDate: '2026-01-02T03:04:05.000Z',
    });
  });
});
