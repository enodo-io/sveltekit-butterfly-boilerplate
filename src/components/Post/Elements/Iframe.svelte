<script lang="ts">
  import type * as Butterfly from '@enodo/butterfly-ts';

  type Props = { element: Butterfly.PostBody.Iframe };
  const { element }: Props = $props();
</script>

<div class="post--iframe">
  <iframe
    width={element.data.width || 660}
    height={element.data.height || 400}
    src={element.data.src}
    title={element.data.title || ''}
  ></iframe>
</div>
