<script lang="ts">
  import type * as Butterfly from '@enodo/butterfly-ts';
  import Image from '$components/Image.svelte';
  import Media from './Media.svelte';
  import { getRelated } from '@enodo/butterfly-ts';

  // priority: the image opens the post body (set by Body): it is the LCP candidate
  type Props = {
    element: Butterfly.PostBody.Image;
    resources: Butterfly.Resource[];
    priority?: boolean;
  };
  const { element, resources, priority = false }: Props = $props();

  const media = $derived(
    getRelated<Butterfly.Image>({ type: 'image', id: element.data.mediaId }, resources),
  );
</script>

{#snippet content()}
  {#if media}
    <picture>
      <Image
        media={media}
        lazyload={!priority}
        priority={priority}
        width={media.attributes.width}
        sizes="(min-width: 1008px) 656px, calc(100vw - 16px)"
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
