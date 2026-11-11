<script lang="ts">
  import Image from './Image.svelte';
  import { getMediaUrl } from '$lib/getMediaUrl';
  import { snapWidth } from '$lib/imageWidths';

  import type * as Butterfly from '@enodo/butterfly-ts';

  type Props = {
    media?: Butterfly.Media;
    lazyload?: boolean;
    /**
     * LCP candidate: one preload per <source> (with its media query, so only
     * the matching one downloads) and fetchpriority="high" on the <img>.
     */
    priority?: boolean;
    format?: 'default' | 'source' | 'thumb' | 'square' | 'cover' | 'stories';
    width?: number;
    srcset?: { query: string; width: number }[];
    alt?: string;
  };

  const {
    media,
    lazyload = true,
    priority = false,
    format = 'default',
    width = 380,
    srcset = [],
    alt,
    ...others
  }: Props = $props();
</script>

<svelte:head>
  {#if priority && media}
    {#each srcset as src (src.query)}
      <link
        rel="preload"
        as="image"
        fetchpriority="high"
        media={src.query}
        imagesrcset={getMediaUrl({ media, format, width: snapWidth(src.width) }) +
          ' 1x, ' +
          getMediaUrl({ media, format, width: snapWidth(src.width * 2) }) +
          ' 2x'}
      />
    {/each}
  {/if}
</svelte:head>

<picture {...others}>
  {#if media}
    {#each srcset as src (src.query)}
      <source
        media={src.query}
        srcset={getMediaUrl({ media, format, width: snapWidth(src.width) }) +
          ' 1x, ' +
          getMediaUrl({ media, format, width: snapWidth(src.width * 2) }) +
          ' 2x'}
      />
    {/each}
  {/if}
  <Image
    media={media}
    lazyload={lazyload && !priority}
    fetchpriority={priority ? 'high' : undefined}
    format={format}
    width={width}
    widths={[]}
    alt={alt}
    {...others}
  />
</picture>
