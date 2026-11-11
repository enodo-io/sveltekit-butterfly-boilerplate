<script lang="ts">
  import type * as Butterfly from '@enodo/butterfly-ts';

  type Props = { element: Butterfly.PostBody.Iframe };
  const { element }: Props = $props();

  // an iframe needs an accessible name: the CMS title, else its host
  const title = $derived.by(() => {
    if (element.data.title) return element.data.title;
    try {
      return `Embedded content from ${new URL(element.data.src).hostname}`;
    } catch {
      return 'Embedded content';
    }
  });
</script>

<div class="post--iframe">
  <iframe
    width={element.data.width || 660}
    height={element.data.height || 400}
    src={element.data.src}
    title={title}
    loading="lazy"
  ></iframe>
</div>
