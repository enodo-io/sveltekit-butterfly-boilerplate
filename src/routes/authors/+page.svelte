<script lang="ts">
  import type { PageProps } from './$types';
  import type { Graph, WithContext, Thing } from 'schema-dts';
  import type * as Butterfly from '@enodo/butterfly-ts';

  import { resolve } from '$app/paths';
  import { getRelated } from '@enodo/butterfly-ts';
  import Image from '$components/Image.svelte';
  import { UserRound as Avatar } from '@lucide/svelte';
  import { generateJsonLd } from '$lib/JsonLD';

  let { data }: PageProps = $props();
  let jsonLd: Graph | WithContext<Thing> | null = $derived(generateJsonLd(data, ['WebPage']));
</script>

<svelte:head>
  <meta property="og:type" content="website" />
  {#if jsonLd}
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html '<scr' + 'ipt type="application/ld+json">' + JSON.stringify(jsonLd) + '</scr' + 'ipt>'}
  {/if}
</svelte:head>

<section class="flex flex-col gap-7">
  <header class="flex flex-col gap-4">
    <h1 class="flex items-center justify-center fs-foolscap font-bold text-light-700">
      {data.meta.title}
    </h1>
  </header>

  <div id="authors" class="grid gap-4 sm:grid-cols-2">
    {#await data.feeds.authors}
      <!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
      {#each Array.from({ length: 8 }) as _, i (i)}
        {@const width = (Math.random() * (80 - 30) + 30).toFixed(2)}
        <div class="flex flex-row-reverse items-center justify-end gap-4">
          <span class="shimmer fs-trafalgar" style:width="{width}%">&nbsp;</span>
          <div class="shimmer rounded-full" style:width="64px" style:height="64px"></div>
        </div>
      {/each}
    {:then authors}
      {#each authors.data as author, i (author.id)}
        {@const thumb: Butterfly.Media | undefined = getRelated(author.relationships.thumbnail.data, authors.included)}
        <div class="relative flex flex-row-reverse items-center justify-end gap-4">
          <h2 class="fs-trafalgar font-bold text-light-700">
            <a class="link--overlay" href={resolve(`/authors/${author.id}`)}
              >{author.attributes.name}</a
            >
          </h2>
          {#if thumb}
            <picture
              class="shrink-0 overflow-hidden rounded-full border border-light-075 bg-light text-light-600"
            >
              <Image
                lazyload={i > 3}
                media={thumb}
                width={64}
                widths={[64]}
                sizes="64px"
                alt={thumb?.attributes.description || author.attributes.name}
                format="square"
                class="bg-light-100"
              />
            </picture>
          {:else}
            <div class="shrink-0 rounded-full border border-light-075 bg-light p-3 text-light-600">
              <Avatar size={40} />
            </div>
          {/if}
        </div>
      {/each}
    {/await}
  </div>
</section>
