<script lang="ts">
  import type * as Butterfly from '@enodo/butterfly-ts';

  import InlineNodes from '../InlineNodes.svelte';

  type Props = {
    node: Butterfly.PostBody.StrikethroughNode;
  };
  const { node }: Props = $props();
</script>

<s><InlineNodes nodes={node.value} /></s>
