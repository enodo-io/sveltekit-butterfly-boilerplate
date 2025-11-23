<script lang="ts">
  import type * as Butterfly from '@enodo/butterfly-ts';

  import InlineNodes from '../InlineNodes.svelte';

  type Props = {
    node: Butterfly.PostBody.EmphasisNode;
  };
  const { node }: Props = $props();
</script>

<em><InlineNodes nodes={node.value} /></em>
