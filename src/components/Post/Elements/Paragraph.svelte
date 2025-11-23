<script lang="ts">
  import type * as Butterfly from '@enodo/butterfly-ts';
  import InlineNodes from '../InlineNodes.svelte';

  type Props = { element: Butterfly.PostBody.Paragraph };
  const { element }: Props = $props();
</script>

<p class="post--paragraph">
  <InlineNodes nodes={element.data} />
</p>
