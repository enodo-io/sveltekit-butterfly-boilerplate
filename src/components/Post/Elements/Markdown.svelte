<script lang="ts">
  import type * as Butterfly from '@enodo/butterfly-ts';

  type Props = { element: Butterfly.PostBody.Embed };
  const { element }: Props = $props();
</script>

<pre class="post--markdown"><code>{element.data}</code></pre>
