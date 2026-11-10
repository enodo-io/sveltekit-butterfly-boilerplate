<script lang="ts">
  import type * as Butterfly from '@enodo/butterfly-ts';

  import { PUBLIC_BASE_URL } from '$env/static/public';
  import { resolve } from '$app/paths';
  import InlineNodes from '../InlineNodes.svelte';

  type Props = { element: Butterfly.PostBody.Quote };
  const { element }: Props = $props();
  // a quote may have no source: the page must not crash on `source.author`
  const source = $derived(element.data.source ?? {});
</script>

<figure class="post--quote">
  <blockquote cite={source.url}>
    <p><InlineNodes nodes={element.data.value} /></p>
  </blockquote>

  {#if source.author || source.title}
    <figcaption class="post--quote--credits">
      {#if source.author}
        — {source.author}{/if}{#if source.title},
        {#if source.url && source.url.length}
          <cite>
            <!-- eslint-disable svelte/no-navigation-without-resolve -->
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={source.url.startsWith(PUBLIC_BASE_URL)
                ? resolve(source.url.replace(PUBLIC_BASE_URL, '') as `/${string}`)
                : source.url}
              title={source.title}>{source.title}</a
            >
            <!-- eslint-enable svelte/no-navigation-without-resolve -->
          </cite>
        {:else}
          <cite>{source.title}</cite>
        {/if}
      {/if}
    </figcaption>
  {/if}
</figure>
