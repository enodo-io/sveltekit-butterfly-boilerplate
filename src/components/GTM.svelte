<script lang="ts">
  import { PUBLIC_GTM_ID } from '$env/static/public';
  import { version, dev } from '$app/environment';
  import { page } from '$app/state';
  import { push, track } from '$lib/dataLayer';
  import { whenCmpReady } from '$lib/consent';

  let isInit = false;
  $effect(() => {
    if (!isInit) {
      // `gtm.js` first in the dataLayer as usual, but the container script only once
      // the consent layer is up (straight away without CMP): its banner comes first
      // on a slow connection, the events queue in the dataLayer meanwhile
      if (PUBLIC_GTM_ID) {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
        whenCmpReady(() => {
          const script = document.createElement('script');
          script.async = true;
          script.src = `https://www.googletagmanager.com/gtm.js?id=${PUBLIC_GTM_ID}`;
          document.head.appendChild(script);
        });
      }
      const n: Navigator = window.navigator;
      push({
        'app.version': version,
        'app.env': dev ? 'development' : 'production',
        'app.platform':
          n.standalone === true || window.matchMedia('(display-mode: standalone)').matches
            ? 'pwa'
            : 'web',
      });
      isInit = true;
    }

    track('pageview', page.data.layer);
  });
</script>

{#if PUBLIC_GTM_ID}
  <noscript
    ><iframe
      title=""
      src="https://www.googletagmanager.com/ns.html?id={PUBLIC_GTM_ID}"
      height="0"
      width="0"
      style="display:none;visibility:hidden"
    ></iframe></noscript
  >
{/if}
