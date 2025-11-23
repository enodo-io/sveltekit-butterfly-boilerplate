<script lang="ts">
  import type * as Butterfly from '@enodo/butterfly-ts';

  type Props = { element: Butterfly.PostBody.Vimeo };
  const { element }: Props = $props();
</script>

<div class="post--vimeo">
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html element.data.oembed?.html}
</div>
