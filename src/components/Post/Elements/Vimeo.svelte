<script lang="ts">
  import type * as Butterfly from '@enodo/butterfly-ts';
  import embedHtml from '$lib/embedHtml';
  import stripScripts from '$lib/stripScripts';

  type Props = { element: Butterfly.PostBody.Vimeo };
  const { element }: Props = $props();
</script>

<div class="post--vimeo">
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html embedHtml(stripScripts(element.data.oembed?.html ?? ''), element.data.oembed?.title)}
</div>
