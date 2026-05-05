<script lang="ts">
  import type * as Butterfly from '@enodo/butterfly-ts';

  import InlineNodes from '../InlineNodes.svelte';

  // Per-property named visual style applied as an inline mark (like
  // <strong>) on a substring. The slug travels in `node.key`; the visual
  // treatment is up to this site to provide via CSS — typically a rule of
  // the shape:
  //
  //   [data-customstyle="<key>"] { color: …; font-weight: …; }
  //
  // The Butterfly admin lists every customstyle slug defined for the
  // property; coordinate with whoever maintains the editor to know which
  // keys exist. Unknown keys render with no styling, which is the right
  // fallback (orphan after a customstyle deletion).
  //
  // Local type since `Butterfly.PostBody.CustomStyleNode` is exposed only
  // from butterfly-ts ≥ 1.1.2; older installs still resolve `node.value`
  // through the InlineNodes recursion above.
  type CustomStyleNode = {
    type: 'customstyle';
    key: string;
    value: string | Butterfly.PostBody.BodyInlineNode[];
  };

  type Props = { node: CustomStyleNode };
  const { node }: Props = $props();
</script>

<span data-customstyle={node.key}><InlineNodes nodes={node.value} /></span>
