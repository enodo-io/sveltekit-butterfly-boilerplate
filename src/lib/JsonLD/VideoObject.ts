/**
 * VideoObject JSON-LD Schema Generator
 *
 * One VideoObject per video of a post body: native Butterfly videos (contentUrl)
 * and YouTube / Vimeo / Dailymotion embeds (embedUrl, from their oEmbed). Google
 * requires name, thumbnailUrl and uploadDate: a video without a thumbnail is
 * skipped. Makes the post eligible to video results and video indexing.
 *
 * @module VideoObject
 */

import type { VideoObject } from 'schema-dts';
import type * as Butterfly from '@enodo/butterfly-ts';
import { getRelated } from '@enodo/butterfly-ts';
import { getMediaUrl } from '$lib/getMediaUrl';

/** seconds -> ISO 8601 duration (PT1H2M3S) */
export function isoDuration(seconds: number | undefined): string | undefined {
  if (!seconds || seconds <= 0) return undefined;
  const s = Math.round(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  return `PT${h ? `${h}H` : ''}${m ? `${m}M` : ''}${r || (!h && !m) ? `${r}S` : ''}`;
}

/** oEmbed upload_date ('2024-05-01 10:00:00', ISO…) -> ISO 8601, undefined when unreadable */
function isoDate(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const d = new Date(value.includes('T') ? value : value.replace(' ', 'T'));
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

const iframeSrc = (html: string | undefined) => /<iframe[^>]+src="([^"]+)"/i.exec(html || '')?.[1];

export default function getVideoObjects(data: App.PageData): VideoObject[] {
  const post = data.scope?.data as Butterfly.Post;
  const included = (data.scope?.included || []) as Butterfly.Resource[];
  const body = (post.attributes.body || []) as Butterfly.PostBody.BodyData[];
  const videos: VideoObject[] = [];

  body.forEach((item) => {
    if (item.type === 'video') {
      const media = getRelated<Butterfly.Video>({ type: 'video', id: item.data.mediaId }, included);
      if (!media) return;
      videos.push({
        '@type': 'VideoObject',
        name: item.data.description || media.attributes.description || media.attributes.name,
        description: item.data.caption || media.attributes.description || post.attributes.title,
        thumbnailUrl: getMediaUrl({ media, width: 1280, ext: 'jpg' }),
        uploadDate: media.attributes.createdAt,
        contentUrl: getMediaUrl({ media, definition: 'hd', ext: 'mp4' }),
        duration: isoDuration(media.attributes.duration),
        width: String(media.attributes.width),
        height: String(media.attributes.height),
      });
    } else if (item.type === 'youtube' || item.type === 'vimeo' || item.type === 'dailymotion') {
      const o = item.data.oembed as Butterfly.PostBody.OEmbed | undefined;
      if (!o?.thumbnail_url) return;
      videos.push({
        '@type': 'VideoObject',
        name: o.title || post.attributes.title,
        description: o.description || o.title || post.attributes.title,
        thumbnailUrl: o.thumbnail_url,
        uploadDate: isoDate(o.upload_date) || post.attributes.publishedAt,
        embedUrl: iframeSrc(o.html),
        url: item.data.url,
        duration: isoDuration(o.duration),
      });
    }
  });

  return videos;
}
