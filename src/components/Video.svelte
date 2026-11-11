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

  // preload="none": nothing is downloaded before play (the poster shows the
  // frame), so choosing SD on a slow connection here wastes no request
  onMount(() => {
    const connection =
      navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (media && video && connection && connection.downlink && connection.downlink < 2) {
      video.src = getMediaUrl({ media, definition: 'sd', ext: 'mp4' });
    }
  });
</script>

{#if media}
  <!-- no captions track until the CMS provides a VTT (an empty <track> is invalid HTML) -->
  <video
    bind:this={video}
    controls
    preload="none"
    poster={getMediaUrl({ media, width: 1080 })}
    playsinline
    aria-label={alt}
    {...others}
  >
    <source src={getMediaUrl({ media, definition: 'hd', ext: 'mp4' })} type="video/mp4" />
    <source src={getMediaUrl({ media, definition: 'sd', ext: 'mp4' })} type="video/mp4" />
  </video>
{:else}
  <div class="error">Video not available</div>
{/if}
