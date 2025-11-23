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
    return new Promise((resolve, reject) => {
      if (window.__oembedLoaded && window.__oembedLoaded[script]) {
        resolve();
        return;
      }

      if (beforeCreate) beforeCreate();

      const s = document.createElement('script');
      s.src = script;
      s.async = true;
      s.defer = true;
      s.crossOrigin = element.type === 'tiktok' ? s.crossOrigin : 'anonymous';
      s.onload = () => {
        window.__oembedLoaded = window.__oembedLoaded || {};
        window.__oembedLoaded[script] = true;
        resolve();
      };
      s.onerror = () => reject(new Error(`[OEmbed] Failed to load script ${script}`));

      document.body.appendChild(s);
    });
  };

  onMount(async () => {
    try {
      await createScript();

      if (test()) {
        draw();
      } else {
        console.error(`[OEmbed] Script '${script}' loaded but test() failed.`);
      }
    } catch (err) {
      console.error(err);
    }
  });
</script>

<!-- eslint-disable-next-line svelte/no-at-html-tags -->
{@html stripScripts(element.data.oembed?.html)}
