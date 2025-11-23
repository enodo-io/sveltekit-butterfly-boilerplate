<script lang="ts">
  import type * as Butterfly from '@enodo/butterfly-ts';

  import InlineNodes from '../InlineNodes.svelte';

  type Props = {
    node: Butterfly.PostBody.CodeNode;
  };
  const { node }: Props = $props();
</script>

<code><InlineNodes nodes={node.value} /></code>
