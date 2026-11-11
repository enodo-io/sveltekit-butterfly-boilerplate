<script lang="ts">
  import type * as Butterfly from '@enodo/butterfly-ts';

  // `html`: rendered on the server (lib/server/markdown). Without it (a body that
  // did not go through the post load), the source is shown as is.
  type Props = { element: Butterfly.PostBody.Markdown & { html?: string } };
  const { element }: Props = $props();
</script>

{#if element.html}
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  <div class="post--markdown">{@html element.html}</div>
{:else}
  <pre class="post--markdown"><code>{element.data}</code></pre>
{/if}
