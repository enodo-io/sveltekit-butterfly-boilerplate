<script lang="ts">
  import type * as Butterfly from '@enodo/butterfly-ts';

  import { resolve } from '$app/paths';
  import { getRelated } from '@enodo/butterfly-ts';
  import Image from '$components/Image.svelte';
  import { UserRound as Avatar } from '@lucide/svelte';

  type Props = {
    authors: Butterfly.Author[];
    resources: Butterfly.Resource[];
  };

  const { authors, resources }: Props = $props();
</script>

{#if authors.length}
  <div class="flex flex-auto flex-wrap items-center gap-2 fs-long-primer sm:flex-nowrap">
    <div class="flex">
      {#each authors as author, i (author.id)}
        {@const media = author.relationships.thumbnail.data
          ? (getRelated(author.relationships.thumbnail.data, resources) as Butterfly.Media)
          : null}
        {#if !media}
          <div
            class="shrink-0 rounded-full border border-light-075 bg-light p-2 text-light-600"
            class:-ml-4={i > 0}
          >
            <Avatar size={32} />
          </div>
        {:else}
          <Image
            lazyload={false}
            media={media}
            format="square"
            width={48}
            widths={[48]}
            sizes="48px"
            class="shrink-0 rounded-full border bg-light-100 border-light-075{i > 0
              ? ' -ml-4'
              : ''}"
            alt={author.attributes.name}
          />
        {/if}
      {/each}
    </div>
    <p>
      By
      {#each authors as author, i (author.id)}
        <a href={resolve(`/authors/${author.id}`)}>{author.attributes.name}</a>{i <
        authors.length - 2
          ? ', '
          : i === authors.length - 2
            ? ' and '
            : ''}
      {/each}
    </p>
  </div>
{/if}
