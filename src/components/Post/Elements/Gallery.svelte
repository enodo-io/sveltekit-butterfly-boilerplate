<script lang="ts">
  import type * as Butterfly from '@enodo/butterfly-ts';

  import { breakpoints } from '$lib/breakpoints';
  import Image from '$components/Image.svelte';
  import Video from '$components/Video.svelte';
  import Dialog from '$components/Dialog.svelte';

  type Props = { element: Butterfly.PostBody.Gallery; resources: Butterfly.Resource[] };
  const { element, resources }: Props = $props();

  let current: { media: Butterfly.Media; item: Butterfly.PostBody.MediaData } | null = $state(null);
  const sizes =
    `(min-width: ${breakpoints.md}px) 100px, ` +
    `(min-width: ${breakpoints.sm}px) and (max-width: ${breakpoints.md}px) 15vw, ` +
    `30vw`;
</script>

<ul class="post--gallery grid grid-cols-3 items-center gap-2 sm:grid-cols-6">
  {#each element.data as item, i (i)}
    {@const media = resources.find(
      (r: Butterfly.Resource) =>
        ['image', 'video', 'audio'].includes(r.type) && r.id === item.mediaId,
    ) as Butterfly.Media | undefined}
    <li>
      <figure class="post--gallery--media">
        {#if media}
          <!-- opens the viewer (<dialog>): an action, so a button, not a link -->
          <button type="button" class="block w-full" onclick={() => (current = { media, item })}>
            <span class="sr-only">Enlarge</span>
            <Image
              media={media}
              alt={item.description}
              width={180}
              format="square"
              widths={[180, 120]}
              sizes={sizes}
            />
          </button>
        {:else}
          <p class="error px-2 py-3 text-center">Media not available</p>
        {/if}
      </figure>
    </li>
  {/each}
</ul>

{#snippet modalcontent()}
  {#if current}
    <div class="post--media">
      <figure class="relative">
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
        <figcaption
          class="post--media--caption absolute right-0 right-5 bottom-0 bottom-3 text-right"
        >
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

<Dialog
  content={modalcontent}
  open={!!current}
  onClose={() => {
    current = null;
  }}
/>

<style lang="scss">
  .post--gallery--media button {
    cursor: zoom-in;
  }
  .post--media {
    &--caption p {
      color: var(--color-light);
      text-shadow: 0px 0px 2px #000;
    }
    :global(img),
    :global(video) {
      max-height: 100dvh;
      width: auto;
      object-fit: contain;
      border-radius: var(--radius-md);
    }
  }
</style>
