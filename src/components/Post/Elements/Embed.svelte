<script lang="ts">
  import type * as Butterfly from '@enodo/butterfly-ts';
  import embedHtml from '$lib/embedHtml';

  type Props = { element: Butterfly.PostBody.Embed };
  const { element }: Props = $props();
</script>

<!-- eslint-disable-next-line svelte/no-at-html-tags -->
<div class="post--embed">{@html embedHtml(element.data)}</div>
