<script lang="ts">
  import type * as Butterfly from '@enodo/butterfly-ts';
  import stripScripts from '$lib/stripScripts';
  import { onMount } from 'svelte';

  type Props = {
    element: { type: string; data: { oembed: Butterfly.PostBody.OEmbed } };
    script: string;
    draw: () => void;
    test: () => boolean;
    beforeCreate?: () => void;
  };
  const { element, script, draw, test, beforeCreate }: Props = $props();

  const createScript = (): Promise<void> => {
    if (window.__oembedLoaded && window.__oembedLoaded[script]) {
      return window.__oembedLoaded[script];
    }
    window.__oembedLoaded = window.__oembedLoaded || {};
    window.__oembedLoaded[script] = new Promise<void>((resolve, reject) => {
      if (beforeCreate) beforeCreate();

      const s = document.createElement('script');
      s.src = script;
      s.async = true;
      s.defer = true;
      s.crossOrigin = element.type === 'tiktok' ? s.crossOrigin : 'anonymous';
      s.onload = () => {
        resolve();
      };
      s.onerror = () => reject(new Error(`[OEmbed] Failed to load script ${script}`));

      document.body.appendChild(s);
    });
    return window.__oembedLoaded[script];
  };

  const render = async () => {
    try {
      await createScript();

      setTimeout(() => {
        if (test()) {
          draw();
        } else {
          console.error(`[OEmbed] Script '${script}' loaded but test() failed.`);
        }
      });
    } catch (err) {
      console.error(err);
    }
  };

  let container: HTMLDivElement;

  // The network SDKs (widgets.js, FB SDK, embed.js…) are heavy main-thread work:
  // loaded when the embed comes near the viewport, not right after hydration.
  onMount(() => {
    if (!('IntersectionObserver' in window)) {
      void render();
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          observer.disconnect();
          void render();
        }
      },
      { rootMargin: '600px 0px' },
    );
    observer.observe(container);
    return () => observer.disconnect();
  });
</script>

<div bind:this={container}>
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html stripScripts(element.data.oembed?.html)}
</div>
