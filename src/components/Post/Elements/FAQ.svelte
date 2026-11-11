<script lang="ts">
  import type * as Butterfly from '@enodo/butterfly-ts';
  import InlineNodes from '../InlineNodes.svelte';

  // id: unique anchor from the post outline (lib/postOutline, set by Body)
  type Props = { element: Butterfly.PostBody.FAQ; id?: string };
  const { element, id }: Props = $props();
</script>

<div class="post--faq">
  <h2 id={id} class="post--title2">{element.data.question}</h2>

  <p class="post--paragraph">
    <InlineNodes nodes={element.data.value} />
  </p>
</div>
