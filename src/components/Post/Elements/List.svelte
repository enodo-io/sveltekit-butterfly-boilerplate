<script lang="ts">
  import type * as Butterfly from '@enodo/butterfly-ts';

  import InlineNodes from '../InlineNodes.svelte';

  type Props = { element: Butterfly.PostBody.List };
  const { element }: Props = $props();

  const nodeName = $derived(element.type === 'bulletList' ? 'ul' : 'ol');
</script>

<svelte:element
  this={nodeName}
  class="post--list"
  reversed={element.type === 'reversedList' || undefined}
>
  {#each element.data as item, i (i)}
    <li><InlineNodes nodes={item as unknown as Butterfly.PostBody.BodyInlineNode[]} /></li>
  {/each}
</svelte:element>
