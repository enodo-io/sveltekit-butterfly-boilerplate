<script lang="ts">
  import type * as Butterfly from '@enodo/butterfly-ts';
  import Image from '$components/Image.svelte';
  import Media from './Media.svelte';
  import { getRelated } from '@enodo/butterfly-ts';

  type Props = { element: Butterfly.PostBody.Image; resources: Butterfly.Resource[] };
  const { element, resources }: Props = $props();

  // svelte-ignore state_referenced_locally
  const media = getRelated<Butterfly.Image>({ type: 'image', id: element.data.mediaId }, resources);
</script>

{#snippet content()}
  {#if media}
    <picture>
      <Image
        media={media}
        lazyload={true}
        width={media.attributes.width}
        alt={element.data.description.length
          ? element.data.description
          : media.attributes.description || undefined}
      />
    </picture>
  {:else}
    <p class="error">Image not available</p>
  {/if}
{/snippet}
<Media element={element} content={content} />
