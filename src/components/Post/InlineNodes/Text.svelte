<script lang="ts">
  import type * as Butterfly from '@enodo/butterfly-ts';

  type Props = {
    node: Butterfly.PostBody.TextNode;
  };
  const { node }: Props = $props();
</script>

{node.value}
