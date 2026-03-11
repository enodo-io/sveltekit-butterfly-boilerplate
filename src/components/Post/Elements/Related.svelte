<script lang="ts">
  import type * as Butterfly from '@enodo/butterfly-ts';

  import { resolve } from '$app/paths';
  import { PUBLIC_BASE_URL } from '$env/static/public';
  import { getRelated } from '@enodo/butterfly-ts';

  type Props = {
    element: {
      title: string;
      data: { type: string; id: number }[];
    };
    resources: Butterfly.Resource[];
  };
  const { element, resources }: Props = $props();

  function postUrl(post: Butterfly.Post): `/${string}` {
    return (
      post.attributes.canonical?.startsWith(PUBLIC_BASE_URL)
        ? post.attributes.canonical.replace(PUBLIC_BASE_URL, '')
        : `/${post.attributes.slug}-${post.id}.html`
    ) as `/${string}`;
  }
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
          <li><a href={resolve(postUrl(post))}>{post.attributes.title}</a></li>
        {/if}
      {/each}
    </ul>
  </aside>
{/if}
