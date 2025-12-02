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
  // svelte-ignore state_referenced_locally
  const jsonLd: Graph | WithContext<Thing> | null = generateJsonLd(data, ['WebPage']);
</script>

<svelte:head>
  <meta property="og:type" content="website" />
  {#if jsonLd}
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html '<scr' + 'ipt type="application/ld+json">' + JSON.stringify(jsonLd) + '</scr' + 'ipt>'}
  {/if}
</svelte:head>

<section class="d-flex fd-column g7">
  <header class="d-flex fd-column g4">
    <h1 class="fs-foolscap fw-700 d-flex ai-center jc-center fc-light-700">{data.meta.title}</h1>
  </header>

  <div id="authors" class="d-grid sm:grid__2 g4">
    {#await data.feeds.authors}
      <!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
      {#each Array.from({ length: 8 }) as _, i (i)}
        {@const width = (Math.random() * (80 - 30) + 30).toFixed(2)}
        <div class="d-flex fd-row-reverse g4 ai-center jc-end">
          <span class="fs-trafalgar shimmer" style:width="{width}%">&nbsp;</span>
          <div class="bar-circle shimmer" style:width="64px" style:height="64px"></div>
        </div>
      {/each}
    {:then authors}
      {#each authors.data as author, i (author.id)}
        {@const thumb: Butterfly.Media | undefined = getRelated(author.relationships.thumbnail.data, authors.included)}
        <div class="ps-relative d-flex fd-row-reverse g4 ai-center jc-end">
          <h2 class="fs-trafalgar fw-700 fc-light-700">
            <a class="link--overlay" href={resolve(`/authors/${author.id}`)}
              >{author.attributes.name}</a
            >
          </h2>
          {#if thumb}
            <picture
              class="fl-shrink0 bar-circle overflow-hidden bg-light ba bc-light-075 fc-light-600"
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
            <div class="fl-shrink0 bar-circle p3 bg-light ba bc-light-075 fc-light-600">
              <Avatar size={40} />
            </div>
          {/if}
        </div>
      {/each}
    {/await}
  </div>
</section>
