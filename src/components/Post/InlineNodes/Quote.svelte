<script lang="ts">
  import type * as Butterfly from '@enodo/butterfly-ts';

  import InlineNodes from '../InlineNodes.svelte';

  type Props = {
    node: Butterfly.PostBody.QuoteNode;
  };
  const { node }: Props = $props();
</script>

<!-- <q>: the cite attribute takes a URL; a source name goes in title -->
<q
  cite={node.cite && /^https?:\/\//.test(node.cite) ? node.cite : undefined}
  title={node.cite || undefined}><InlineNodes nodes={node.value} /></q
>
