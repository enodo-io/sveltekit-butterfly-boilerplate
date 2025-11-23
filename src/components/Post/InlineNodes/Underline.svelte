<script lang="ts">
  import type * as Butterfly from '@enodo/butterfly-ts';

  import InlineNodes from '../InlineNodes.svelte';

  type Props = {
    node: Butterfly.PostBody.UnderlineNode;
  };
  const { node }: Props = $props();
</script>

<u><InlineNodes nodes={node.value} /></u>
