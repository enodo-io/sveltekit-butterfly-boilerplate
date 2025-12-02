<script lang="ts">
  import slugify from 'slugify';
  import type * as Butterfly from '@enodo/butterfly-ts';

  type Props = { element: Butterfly.PostBody.Title };
  const { element }: Props = $props();

  // svelte-ignore state_referenced_locally
  const id = slugify(element.data, { lower: true, strict: true });
  // svelte-ignore state_referenced_locally
  const nodeName = element.type.replace('title', 'h');
</script>

<svelte:element this={nodeName} id={id} class="post--{element.type}">{element.data}</svelte:element>
