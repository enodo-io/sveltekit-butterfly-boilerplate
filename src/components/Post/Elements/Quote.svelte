<script lang="ts">
  import type * as Butterfly from '@enodo/butterfly-ts';

  import { PUBLIC_BASE_URL } from '$env/static/public';
  import { resolve } from '$app/paths';
  import InlineNodes from '../InlineNodes.svelte';

  type Props = { element: Butterfly.PostBody.Quote };
  const { element }: Props = $props();
</script>

<figure class="post--quote">
  <blockquote cite={element.data.source?.url}>
    <p><InlineNodes nodes={element.data.value} /></p>
  </blockquote>

  {#if element.data.source.author || element.data.source.title}
    <figcaption class="post--quote--credits">
      {#if element.data.source.author}
        — {element.data.source.author}{/if}{#if element.data.source.title},
        {#if element.data.source.url && element.data.source.url.length}
          <cite>
            <!-- eslint-disable svelte/no-navigation-without-resolve -->
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={element.data.source.url.startsWith(PUBLIC_BASE_URL)
                ? resolve(element.data.source.url.replace(PUBLIC_BASE_URL, '') as `/${string}`)
                : element.data.source.url}
              title={element.data.source.title}>{element.data.source.title}</a
            >
            <!-- eslint-enable svelte/no-navigation-without-resolve -->
          </cite>
        {:else}
          <cite>{element.data.source.title}</cite>
        {/if}
      {/if}
    </figcaption>
  {/if}
</figure>
