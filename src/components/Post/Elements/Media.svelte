<script lang="ts">
  import type * as Butterfly from '@enodo/butterfly-ts';
  import type { Snippet } from 'svelte';

  type Props = { element: Butterfly.PostBody.Media; content: Snippet };
  const { element, content }: Props = $props();
</script>

<figure class="post--media post--{element.type}">
  {@render content()}

  {#if element.data.caption.length || element.data.credits.length}
    <figcaption class="post--media--caption">
      {#if element.data.caption.length}
        <p class="">{element.data.caption}</p>
      {/if}
      {#if element.data.credits.length}
        <p class="post--media--credits">{element.data.credits}</p>
      {/if}
    </figcaption>
  {/if}
</figure>
