<script lang="ts">
  import type * as Butterfly from '@enodo/butterfly-ts';
  import type { HTMLAttributes } from 'svelte/elements';

  import { breakpoints } from '$lib/breakpoints';
  import Card from '$components/Card.svelte';

  type Props = HTMLAttributes<HTMLElement> & {
    feed:
      | Promise<Butterfly.ApiResponse<Butterfly.Post[]>>
      | Butterfly.ApiResponse<Butterfly.Post[]>;
    length: number;
    width?: number;
    format?: 'default' | 'source' | 'thumb' | 'square' | 'cover' | 'stories';
    heading?: 'h1' | 'h2' | 'h3' | 'h4';
    lazyloadAfter?: number;
    thumbnail?: boolean;
    resume?: boolean;
    widths?: number[];
    sizes?: string;
  };

  const {
    feed,
    length = 6,
    width = 380,
    format = 'thumb',
    heading = 'h3',
    lazyloadAfter = 0,
    thumbnail = true,
    resume = true,
    sizes = `(min-width: ${breakpoints.md}px) 320px, ` +
      `(min-width: ${breakpoints.sm}px) and (max-width: ${breakpoints.md}px) 50vw, ` +
      `100vw`,
    widths = [320, 380, 480, 540],
    ...others
  }: Props = $props();
</script>

{#await feed}
  <!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
  {#each Array.from({ length }) as _, i (i)}
    {@const w1 = (Math.random() * (98 - 60) + 60).toFixed(2)}
    {@const w2 = (Math.random() * (100 - 80) + 80).toFixed(2)}
    {@const w3 = (Math.random() * (100 - 80) + 80).toFixed(2)}
    {@const w4 = (Math.random() * (80 - 10) + 10).toFixed(2)}
    <article class="card card__loading" {...others}>
      <div class="card--content">
        <svelte:element this={heading || 'h3'} class="card--title shimmer" style:width="{w1}%">
          &nbsp;
        </svelte:element>
        {#if resume}
          <p class="card--resume">
            <span class="shimmer" style:width="{w2}%">&nbsp;</span>
            <span class="shimmer" style:width="{w3}%">&nbsp;</span>
            <span class="shimmer" style:width="{w4}%">&nbsp;</span>
          </p>
        {/if}
      </div>
      {#if thumbnail}
        <picture
          class="card--thumb shimmer"
          class:card--thumb__square={format === 'square'}
          class:card--thumb__cover={format === 'cover'}
          class:card--thumb__stories={format === 'stories'}
        >
        </picture>
      {/if}
    </article>
  {/each}
{:then posts}
  {#each posts.data as post, i (post.id)}
    <Card
      post={post}
      included={posts.included}
      width={width}
      format={format}
      heading={heading}
      lazyload={i >= lazyloadAfter}
      thumbnail={thumbnail}
      resume={resume}
      widths={widths}
      sizes={sizes}
      {...others}
    />
  {/each}
{:catch error}
  <p class="error grid--col-all grid--row-all">
    {#if error.message === 'Failed to fetch' || error.message === 'Request timed out'}
      🚨 {error.message}. Check your network connection and try again.
    {:else}
      🚨 An error has occurred while loading data, please try again later.
    {/if}
  </p>
{/await}
