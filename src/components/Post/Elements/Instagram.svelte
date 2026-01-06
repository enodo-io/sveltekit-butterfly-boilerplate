<script lang="ts">
  import type * as Butterfly from '@enodo/butterfly-ts';

  import OEmbed from './OEmbed.svelte';

  type Props = { element: Butterfly.PostBody.Instagram };
  const { element }: Props = $props();

  const beforeCreate = () => {
    if (window.FB) {
      // FIX Instagram embeds don't load if Facebook JS SDK was loaded first
      // see https://developers.facebook.com/community/threads/167685065704089/
      window.FB.__buffer = true;
    }
  };
</script>

<div class="post--instagram">
  <OEmbed
    element={element}
    script="https://www.instagram.com/embed.js"
    draw={() => window.instgrm.Embeds.process()}
    test={() => !!window.instgrm}
    beforeCreate={beforeCreate}
  />
</div>
