<script lang="ts">
  import type * as Butterfly from '@enodo/butterfly-ts';

  type Props = { element: Butterfly.PostBody.Dailymotion };
  const { element }: Props = $props();
</script>

<div class="post--dailymotion">
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html element.data.oembed?.html}
</div>
