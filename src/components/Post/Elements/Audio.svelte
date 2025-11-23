<script lang="ts">
  import type * as Butterfly from '@enodo/butterfly-ts';
  import Media from './Media.svelte';
  import { getRelated } from '@enodo/butterfly-ts';
  import { getMediaUrl } from '$lib/getMediaUrl';

  type Props = { element: Butterfly.PostBody.Audio; resources: Butterfly.Resource[] };
  const { element, resources }: Props = $props();

  const media = getRelated<Butterfly.Audio>({ type: 'audio', id: element.data.mediaId }, resources);
</script>

{#snippet content()}
  {#if media}
    <audio controls>
      <source src={getMediaUrl({ media, definition: 'hd', ext: 'mp3' })} type="audio/mp3" />
      <track kind="captions" />
    </audio>
  {:else}
    <p class="error">Audio not available</p>
  {/if}
{/snippet}

<Media element={element} content={content} />
