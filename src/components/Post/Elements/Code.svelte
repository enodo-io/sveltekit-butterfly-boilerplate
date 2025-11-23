<script lang="ts">
  import type * as Butterfly from '@enodo/butterfly-ts';

  type Props = { element: Butterfly.PostBody.Code };
  const { element }: Props = $props();
</script>

<pre class="post--code"><code>{element.data.value}</code></pre>
