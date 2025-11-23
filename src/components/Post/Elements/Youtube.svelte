<script lang="ts">
  import type * as Butterfly from '@enodo/butterfly-ts';

  type Props = { element: Butterfly.PostBody.Youtube };
  const { element }: Props = $props();
</script>

<div class="post--youtube">
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html element.data.oembed?.html}
</div>
