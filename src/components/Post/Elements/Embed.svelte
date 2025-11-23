<script lang="ts">
  import type * as Butterfly from '@enodo/butterfly-ts';

  type Props = { element: Butterfly.PostBody.Embed };
  const { element }: Props = $props();
</script>

<!-- eslint-disable-next-line svelte/no-at-html-tags -->
<div class="post--embed">{@html element.data}</div>
