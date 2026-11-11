<script lang="ts">
  import type * as Butterfly from '@enodo/butterfly-ts';

  // level / id: from the post outline (lib/postOutline, set by Body): no level
  // skip, unique anchors. Without them, the CMS level as is.
  type Props = { element: Butterfly.PostBody.Title; level?: number; id?: string };
  const { element, level, id }: Props = $props();

  const nodeName = $derived(level ? `h${level}` : element.type.replace('title', 'h'));
</script>

<svelte:element this={nodeName} id={id} class="post--{element.type}">{element.data}</svelte:element>
