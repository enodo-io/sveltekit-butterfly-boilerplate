<script lang="ts">
  import Image from './Image.svelte';
  import { getMediaUrl } from '$lib/getMediaUrl';

  import type * as Butterfly from '@enodo/butterfly-ts';

  type Props = {
    media?: Butterfly.Media;
    lazyload?: boolean;
    format?: 'default' | 'source' | 'thumb' | 'square' | 'cover' | 'stories';
    width?: number;
    srcset?: { query: string; width: number }[];
    alt?: string;
  };

  const {
    media,
    lazyload = true,
    format = 'default',
    width = 380,
    srcset = [],
    alt,
    ...others
  }: Props = $props();
</script>

<picture {...others}>
  {#if media}
    {#each srcset as src (src.query)}
      <source
        media={src.query}
        srcset={getMediaUrl({ media, format, width: src.width }) +
          ' 1x, ' +
          getMediaUrl({ media, format, width: src.width * 2 }) +
          ' 2x'}
      />
    {/each}
  {/if}
  <Image
    media={media}
    lazyload={lazyload}
    format={format}
    width={width}
    widths={[]}
    alt={alt}
    {...others}
  />
</picture>
