<script lang="ts">
  import type * as Butterfly from '@enodo/butterfly-ts';
  import type { HTMLAttributes } from 'svelte/elements';

  import { PUBLIC_BASE_URL } from '$env/static/public';
  import { resolve } from '$app/paths';
  import { getRelated } from '@enodo/butterfly-ts';
  import { breakpoints } from '$lib/breakpoints';
  import Image from './Image.svelte';

  type Props = HTMLAttributes<HTMLElement> & {
    post: Butterfly.Post;
    included: Butterfly.Resource[];
    width?: number;
    heading?: 'h1' | 'h2' | 'h3' | 'h4';
    format?: 'default' | 'source' | 'thumb' | 'square' | 'cover' | 'stories';
    lazyload?: boolean;
    thumbnail?: boolean;
    resume?: boolean;
    widths?: number[];
    sizes?: string;
    // sizes: { query: string; width: string }[];
  };
  const {
    post,
    included = [],
    width = 380,
    format = 'thumb',
    heading = 'h3',
    lazyload = true,
    thumbnail = true,
    resume = true,
    sizes = `(min-width: ${breakpoints.md}px) 320px, ` +
      `(min-width: ${breakpoints.sm}px) and (max-width: ${breakpoints.md}px) 50vw, ` +
      `100vw`,
    widths = [320, 380, 480, 540],
    ...others
  }: Props = $props();

  const url: `/${string}` = post.attributes.canonical?.startsWith(PUBLIC_BASE_URL)
    ? (post.attributes.canonical.replace(PUBLIC_BASE_URL, '') as `/${string}`)
    : `/${post.attributes.slug}-${post.id}.html`;
  const thumb = getRelated<Butterfly.Media>(post.relationships.thumbnail.data, included);
</script>

<article class="card" {...others}>
  <div class="card--content">
    <svelte:element this={heading} class="card--title">
      <a href={resolve(url)}>{post.attributes.title}</a>
    </svelte:element>
    {#if resume}
      <p class="card--resume">{post.attributes.resume}</p>
    {/if}
  </div>
  {#if thumbnail}
    <picture
      class="card--thumb"
      class:card--thumb__square={format === 'square'}
      class:card--thumb__cover={format === 'cover'}
      class:card--thumb__stories={format === 'stories'}
    >
      <Image
        lazyload={lazyload}
        media={thumb}
        width={width}
        widths={widths}
        sizes={sizes}
        alt={thumb?.attributes.description || post.attributes.title}
        format={format}
      />
    </picture>
  {/if}
</article>
