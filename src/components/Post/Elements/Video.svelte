<script lang="ts">
  import type * as Butterfly from '@enodo/butterfly-ts';

  import { getRelated } from '@enodo/butterfly-ts';
  import Video from '$components/Video.svelte';
  import Media from './Media.svelte';

  type Props = { element: Butterfly.PostBody.Video; resources: Butterfly.Resource[] };
  const { element, resources }: Props = $props();

  const media = getRelated<Butterfly.Video>({ type: 'video', id: element.data.mediaId }, resources);
</script>

{#snippet content()}
  {#if media}
    <Video
      media={media}
      alt={element.data.description || media.attributes.description || undefined}
    />
  {:else}
    <p class="error">Video not available</p>
  {/if}
{/snippet}

<Media element={element} content={content} />
