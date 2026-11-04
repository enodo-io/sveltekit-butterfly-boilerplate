<script lang="ts">
  import type * as Butterfly from '@enodo/butterfly-ts';

  import { resolve } from '$app/paths';
  import { getRelated } from '@enodo/butterfly-ts';
  import { postPath } from '$lib/posts';

  type Props = {
    element: {
      title: string;
      data: { type: string; id: number }[];
    };
    resources: Butterfly.Resource[];
  };
  const { element, resources }: Props = $props();
</script>

{#if element.data.length}
  <aside class="post--related">
    {#if element.title}
      <p class="post--related--title">{element.title}</p>
    {/if}

    <ul class="post--related--list post--list">
      {#each element.data as item (item.id)}
        {@const post = getRelated<Butterfly.Post>({ type: item.type, id: item.id }, resources)}
        {#if post}
          <li><a href={resolve(postPath(post))}>{post.attributes.title}</a></li>
        {/if}
      {/each}
    </ul>
  </aside>
{/if}
