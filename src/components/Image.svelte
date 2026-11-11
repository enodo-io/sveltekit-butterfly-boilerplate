<script lang="ts">
  import { onMount } from 'svelte';
  import { getMediaUrl } from '$lib/getMediaUrl';
  import defaultThumb from '$assets/images/thumb.jpg';

  import type { HTMLImgAttributes } from 'svelte/elements';
  import type * as Butterfly from '@enodo/butterfly-ts';

  type Props = HTMLImgAttributes & {
    media?: Butterfly.Media;
    lazyload?: boolean;
    /**
     * The LCP candidate: preloaded and fetched first (`fetchpriority="high"`).
     * One per page at most; other above-the-fold images are just not lazy.
     */
    priority?: boolean;
    format?: 'default' | 'source' | 'thumb' | 'square' | 'cover' | 'stories';
    width?: number;
    height?: number;
    widths?: number[];
    sizes?: string;
    alt?: string;
    srcset?: string;
  };

  const ratio = {
    thumb: 1366 / 768,
    square: 1,
    cover: 850 / 315,
    stories: 1080 / 1920,
  };

  const {
    media,
    lazyload = true,
    priority = false,
    format = 'default',
    width = 380,
    height = Math.round(
      ['default', 'source'].includes(format)
        ? width / ((media?.attributes.width || 1366) / (media?.attributes.height || 768))
        : width / ratio[format as 'thumb' | 'square' | 'cover' | 'stories'],
    ),
    sizes = '100vw',
    widths = [320, 380, 480, 768, 990],
    alt,
    srcset = media
      ? [...new Set(widths.flatMap((w) => [w, w * 2]))]
          .filter((w) => w <= media.attributes.width)
          .map((w) => `${getMediaUrl({ media, format, width: w })} ${w}w`)
          .join(', ')
      : '',
    ...others
  }: Props = $props();

  let element: HTMLImageElement;
  let loaded = $state(false);

  onMount(() => {
    if (element && element.complete) {
      loaded = true;
    }
  });
</script>

<svelte:head>
  {#if priority && media}
    <link
      rel="preload"
      as="image"
      fetchpriority="high"
      href={getMediaUrl({ media, format, width })}
      imagesrcset={media && srcset.length ? srcset : undefined}
      imagesizes={media && srcset.length ? sizes : undefined}
    />
  {/if}
</svelte:head>

<img
  src={media ? getMediaUrl({ media, format, width }) : defaultThumb}
  srcset={media && srcset.length ? srcset : undefined}
  sizes={media && srcset.length ? sizes : undefined}
  width={width}
  height={height}
  alt={alt || media?.attributes.description || ''}
  loading={lazyload && !priority ? 'lazy' : undefined}
  fetchpriority={priority ? 'high' : undefined}
  onload={() => (loaded = true)}
  class:loaded={loaded}
  bind:this={element}
  {...others}
/>

<!-- No fade-in: an image kept at opacity 0 until hydration sets .loaded is
     invisible before the JS runs, and not counted as the LCP by Chrome.
     `.loaded` only stops the placeholder shimmer (base.css). -->
