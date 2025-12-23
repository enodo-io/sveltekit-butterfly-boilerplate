<script lang="ts">
  import type * as Butterfly from '@enodo/butterfly-ts';
  import slugify from 'slugify';
  import InlineNodes from '../InlineNodes.svelte';

  type Props = { element: Butterfly.PostBody.FAQ; id?: string };
  const { element, id = slugify(element.data.question, { lower: true, strict: true }) }: Props =
    $props();
</script>

<div class="post--faq">
  <h2 id={id} class="post--title2">{element.data.question}</h2>

  <p class="post--paragraph">
    <InlineNodes nodes={element.data.value} />
  </p>
</div>
