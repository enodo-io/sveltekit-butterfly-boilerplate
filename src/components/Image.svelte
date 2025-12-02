<script lang="ts">
  import { onMount } from 'svelte';
  import { getMediaUrl } from '$lib/getMediaUrl';
  import defaultThumb from '$assets/images/thumb.jpg';

  import type { HTMLImgAttributes } from 'svelte/elements';
  import type * as Butterfly from '@enodo/butterfly-ts';

  type Props = HTMLImgAttributes & {
    media?: Butterfly.Media;
    lazyload?: boolean;
    format?: 'default' | 'source' | 'thumb' | 'square' | 'cover' | 'stories';
    width?: number;
    widths?: number[];
    sizes?: string;
    alt?: string;
  };

  const {
    media,
    lazyload = true,
    format = 'default',
    width = 380,
    sizes = '100vw',
    widths = [320, 380, 480, 768, 990],
    alt,
    ...others
  }: Props = $props();

  let element: HTMLImageElement;
  let loaded = $state(false);

  const ratio = {
    thumb: 1366 / 768,
    square: 1,
    cover: 850 / 315,
    stories: 1080 / 1920,
  };
  // svelte-ignore state_referenced_locally
  const height = Math.round(
    ['default', 'source'].includes(format)
      ? width / ((media?.attributes.width || 1366) / (media?.attributes.height || 768))
      : width / ratio[format as 'thumb' | 'square' | 'cover' | 'stories'],
  );

  // svelte-ignore state_referenced_locally
  const srcset = media
    ? [...new Set(widths.flatMap((w) => [w, w * 2]))]
        .filter((w) => w <= media.attributes.width)
        .map((w) => `${getMediaUrl({ media, format, width: w })} ${w}w`)
    : [];

  onMount(() => {
    if (element && element.complete) {
      loaded = true;
    }
  });
</script>

<svelte:head>
  {#if !lazyload && media}
    <link
      rel="preload"
      as="image"
      href={getMediaUrl({ media, format, width })}
      imagesrcset={media && srcset.length ? srcset.join(', ') : undefined}
      imagesizes={media && srcset.length ? sizes : undefined}
    />
  {/if}
</svelte:head>

<img
  src={media ? getMediaUrl({ media, format, width }) : defaultThumb}
  srcset={media && srcset.length ? srcset.join(', ') : undefined}
  sizes={media && srcset.length ? sizes : undefined}
  width={width}
  height={height}
  alt={alt || media?.attributes.description}
  loading={lazyload ? 'lazy' : undefined}
  fetchpriority={lazyload ? undefined : 'high'}
  onload={() => (loaded = true)}
  class:loaded={loaded}
  bind:this={element}
  {...others}
/>

<style lang="scss">
  img[loading='lazy'] {
    opacity: 0;
    transition:
      transform 0.5s ease,
      opacity 600ms ease-in-out;
  }
  img.loaded {
    opacity: 1;
  }
  @media (prefers-reduced-motion: reduce) {
    img[loading='lazy'] {
      opacity: 1;
      transition: none !important;
    }
  }
</style>
