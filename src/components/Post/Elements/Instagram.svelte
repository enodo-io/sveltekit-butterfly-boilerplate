<script lang="ts">
  import type * as Butterfly from '@enodo/butterfly-ts';

  import OEmbed from './OEmbed.svelte';

  type Props = { element: Butterfly.PostBody.Instagram };
  const { element }: Props = $props();
</script>

<div class="post--instagram">
  <OEmbed
    element={element}
    script="https://www.instagram.com/embed.js"
    draw={() => window.instgrm.Embeds.process()}
    test={() => !!window.instgrm}
  />
</div>
