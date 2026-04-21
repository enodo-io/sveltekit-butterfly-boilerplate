<script lang="ts">
  import { PUBLIC_GTM_ID } from '$env/static/public';
  import { version, dev } from '$app/environment';
  import { page } from '$app/state';
  import { push, track } from '$lib/dataLayer';

  let isInit = false;
  $effect(() => {
    if (!isInit) {
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

<svelte:head>
  {#if PUBLIC_GTM_ID}
    <script async src="https://www.googletagmanager.com/gtag/js?id={PUBLIC_GTM_ID}"></script>
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html '<scr' +
      'ipt>' +
      `window.dataLayer=window.dataLayer||[];window.dataLayer.push({'gtm.start':new Date().getTime(),event:'gtm.js'});` +
      '</scr' +
      'ipt>'}
  {/if}
</svelte:head>

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
