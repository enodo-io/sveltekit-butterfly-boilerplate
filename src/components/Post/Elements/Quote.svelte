<script lang="ts">
  import type * as Butterfly from '@enodo/butterfly-ts';

  import { contentLink, externalRel } from '$lib/links';
  import InlineNodes from '../InlineNodes.svelte';

  type Props = { element: Butterfly.PostBody.Quote };
  const { element }: Props = $props();
  // a quote may have no source: the page must not crash on `source.author`
  const source = $derived(element.data.source ?? {});
  const link = $derived(contentLink(source.url));
</script>

<figure class="post--quote">
  <!-- cite takes a URL: only an http(s) source -->
  <blockquote cite={source.url && /^https?:\/\//.test(source.url) ? source.url : undefined}>
    <p><InlineNodes nodes={element.data.value} /></p>
  </blockquote>

  {#if source.author || source.title}
    <figcaption class="post--quote--credits">
      {#if source.author}
        — {source.author}{/if}{#if source.title},
        {#if link}
          <cite>
            <!-- eslint-disable svelte/no-navigation-without-resolve -->
            <a
              href={link.href}
              target={link.web && !link.internal ? '_blank' : undefined}
              rel={link.internal ? undefined : externalRel({})}>{source.title}</a
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
