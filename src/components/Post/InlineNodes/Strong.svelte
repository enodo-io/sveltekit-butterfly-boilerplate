<script lang="ts">
  import type * as Butterfly from '@enodo/butterfly-ts';

  import InlineNodes from '../InlineNodes.svelte';

  type Props = {
    node: Butterfly.PostBody.StrongNode;
  };
  const { node }: Props = $props();
</script>

<strong><InlineNodes nodes={node.value} /></strong>
