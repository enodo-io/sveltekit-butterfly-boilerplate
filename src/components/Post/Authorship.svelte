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
  <div class="fl1 d-flex ai-center fw-wrap sm:fw-nowrap g2 fs-long-primer">
    <div class="d-flex">
      {#each authors as author, i (author.id)}
        {@const media = author.relationships.thumbnail.data
          ? (getRelated(author.relationships.thumbnail.data, resources) as Butterfly.Media)
          : null}
        {#if !media}
          <div
            class="fl-shrink0 bar-circle bg-light p2 ba bc-light-075 fc-light-600"
            class:mln4={i > 0}
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
            class="fl-shrink0 bar-circle bg-light-100 ba bc-light-075{i > 0 ? ' mln4' : ''}"
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
