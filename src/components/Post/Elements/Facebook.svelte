<script lang="ts">
  import type * as Butterfly from '@enodo/butterfly-ts';

  import { PUBLIC_LOCALE } from '$env/static/public';
  import OEmbed from './OEmbed.svelte';

  type Props = { element: Butterfly.PostBody.Facebook };
  const { element }: Props = $props();

  const cleanElement = element;
  if (element.data.oembed) {
    cleanElement.data.oembed.html = element.data.oembed.html.replace(
      '<div id="fb-root"></div>',
      '',
    );
  }

  const beforeCreate = () => {
    if (document?.getElementById('fb-root')) return;

    const fbRoot = document.createElement('div');
    fbRoot.id = 'fb-root';
    document.body.appendChild(fbRoot);
  };
</script>

<div class="post--facebook">
  <OEmbed
    element={cleanElement}
    script={`https://connect.facebook.net/${PUBLIC_LOCALE || 'en_US'}/sdk.js#xfbml=1&amp;version=v24.0`}
    draw={() => window.FB.XFBML.parse()}
    test={() => !!window.FB}
    beforeCreate={beforeCreate}
  />
</div>
