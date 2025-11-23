<script lang="ts">
  import type * as Butterfly from '@enodo/butterfly-ts';

  import InlineNodes from '../InlineNodes.svelte';

  type Props = {
    node: Butterfly.PostBody.QuoteNode;
  };
  const { node }: Props = $props();
</script>

<quote title={node.cite}><InlineNodes nodes={node.value} /></quote>
