<script lang="ts">
  import type * as Butterfly from '@enodo/butterfly-ts';

  import { getMediaUrl } from '$lib/getMediaUrl';
  import { breakpoints } from '$lib/breakpoints';
  import Image from '$components/Image.svelte';
  import Video from '$components/Video.svelte';
  import Modal from '$components/Modal.svelte';

  type Props = { element: Butterfly.PostBody.Gallery; resources: Butterfly.Resource[] };
  const { element, resources }: Props = $props();

  let current: { media: Butterfly.Media; item: Butterfly.PostBody.MediaData } | null = $state(null);
  const sizes =
    `(min-width: ${breakpoints.md}px) 100px, ` +
    `(min-width: ${breakpoints.sm}px) and (max-width: ${breakpoints.md}px) 15vw, ` +
    `30vw`;
</script>

<ul class="post--gallery d-grid ai-center grid__3 sm:grid__6 g2">
  {#each element.data as item, i (i)}
    {@const media = resources.find(
      (r: Butterfly.Resource) =>
        ['image', 'video', 'audio'].includes(r.type) && r.id === item.mediaId,
    ) as Butterfly.Media | undefined}
    <figure class="post--gallery--media">
      {#if media}
        <!-- eslint-disable svelte/no-navigation-without-resolve -->
        <a
          onclick={(e) => {
            e.preventDefault();
            current = { media, item };
          }}
          href={getMediaUrl({
            media,
            ext: media.type === 'video' ? 'mp4' : media.type === 'audio' ? 'mp3' : undefined,
            definition: media.type === 'video' ? 'hd' : undefined,
          }) as `https://${string}`}
          target="_blank"
          rel="noopener external"
        >
          <Image
            media={media}
            alt={item.description}
            width={180}
            format="square"
            widths={[180, 120]}
            sizes={sizes}
          />
        </a>
        <!-- eslint-enable svelte/no-navigation-without-resolve -->
      {:else}
        <p class="error ta-center px2 py3">Media not available</p>
      {/if}
    </figure>
  {/each}
</ul>

{#snippet modalcontent()}
  {#if current}
    <div class="post--media">
      <figure class="ps-relative">
        {#if current.media.type === 'image'}
          <Image
            media={current.media}
            widths={[]}
            sizes="100vw"
            width={current.media.attributes.width}
            alt={current.item.description}
          />
        {:else}
          <Video media={current.media} alt={current.item.description} autoplay />
        {/if}
        <figcaption class="post--media--caption ps-absolute b0 r0 ta-right pr5 pb3">
          {#if current.item.caption.length}
            <p class="">{current.item.caption}</p>
          {/if}
          {#if current.item.credits.length}
            <p class="post--media--credits">{current.item.credits}</p>
          {/if}
        </figcaption>
      </figure>
    </div>
  {/if}
{/snippet}

<Modal
  content={modalcontent}
  open={!!current}
  onClose={() => {
    current = null;
  }}
/>

<style lang="scss">
  .post--gallery--media a {
    cursor: zoom-in;
  }
  .post--media {
    &--caption p {
      color: var(--light);
      text-shadow: 0px 0px 2px #000;
    }
    :global(img),
    :global(video) {
      max-height: 100dvh;
      width: auto;
      object-fit: contain;
      border-radius: var(--br-md);
    }
  }
</style>
