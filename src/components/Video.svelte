<script lang="ts">
  import { onMount } from 'svelte';
  import { getMediaUrl } from '$lib/getMediaUrl';

  import type { HTMLVideoAttributes } from 'svelte/elements';
  import type * as Butterfly from '@enodo/butterfly-ts';

  type Props = HTMLVideoAttributes & {
    media?: Butterfly.Media;
    // lazyload?: boolean;
    alt?: string;
  };

  const {
    media,
    // lazyload = true,
    alt,
    ...others
  }: Props = $props();

  let video = $state<HTMLVideoElement | undefined>(undefined);

  onMount(() => {
    const connection =
      navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (media && video && connection && connection.downlink && connection.downlink < 2) {
      video.src = getMediaUrl({ media, definition: 'sd', ext: 'mp4' });
    }
  });
</script>

{#if media}
  <video
    bind:this={video}
    controls
    preload="metadata"
    poster={getMediaUrl({ media, width: 1080 })}
    playsinline
    aria-label={alt}
    {...others}
  >
    <source src={getMediaUrl({ media, definition: 'hd', ext: 'mp4' })} type="video/mp4" />
    <source src={getMediaUrl({ media, definition: 'sd', ext: 'mp4' })} type="video/mp4" />
    <track kind="captions" />
  </video>
{:else}
  <div class="error">Video not available</div>
{/if}
