<script lang="ts">
  import type * as Butterfly from '@enodo/butterfly-ts';

  import InlineNodes from '../InlineNodes.svelte';

  type Props = {
    node: Butterfly.PostBody.SubscriptNode;
  };
  const { node }: Props = $props();
</script>

<sub><InlineNodes nodes={node.value} /></sub>
