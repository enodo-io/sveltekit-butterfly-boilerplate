<script lang="ts">
  import type * as Butterfly from '@enodo/butterfly-ts';

  import InlineNodes from '../InlineNodes.svelte';

  type Props = {
    node: Butterfly.PostBody.AbbreviationNode;
  };
  const { node }: Props = $props();
</script>

<abbr title={node.title}><InlineNodes nodes={node.value} /></abbr>
