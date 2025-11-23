<script lang="ts">
  import type { PageProps } from './$types';
  import type { Graph, WithContext, Thing } from 'schema-dts';

  import { resolve } from '$app/paths';
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

<section class="d-flex fd-column g4">
  <header>
    <h1 class="fs-foolscap fw-700 fc-light-700">{data.meta.title}</h1>
  </header>

  <h2 class="fs-paragon">
    <a href={resolve(`/${data.layer['content.type']}/index.xml`)}>The full feed</a>
  </h2>
</section>

<section class="d-flex fd-column g4">
  <header>
    <h3 class="fs-trafalgar fw-700 fc-light-700">Sections</h3>
  </header>

  <ul class="d-grid grid__1 sm:grid__2 md:grid__4 g2">
    {#each data.categories.data as category (category.id)}
      <li>
        <a href={resolve(`/${data.layer['content.type']}/sections${category.attributes.path}.xml`)}
          >{category.attributes.name}</a
        >
      </li>
    {/each}
  </ul>
</section>

<section class="d-flex fd-column g4">
  <header>
    <h3 class="fs-trafalgar fw-700 fc-light-700">Authors</h3>
  </header>

  <ul class="d-grid grid__1 sm:grid__2 md:grid__4 g2">
    {#await data.feeds.authors}
      <!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
      {#each Array.from({ length: 8 }) as _, i (i)}
        {@const width = (Math.random() * (80 - 30) + 30).toFixed(2)}
        <li><span class="d-inline-block shimmer" style:width="{width}%">&nbsp;</span></li>
      {/each}
    {:then authors}
      {#each authors.data as author (author.id)}
        <li>
          <a href={resolve(`/${data.layer['content.type']}/authors/${author.id}.xml`)}
            >{author.attributes.name}</a
          >
        </li>
      {/each}
    {/await}
  </ul>
</section>

<section class="d-flex fd-column g4">
  <header>
    <h3 class="fs-trafalgar fw-700 fc-light-700">Tags</h3>
  </header>

  <ul class="d-grid grid__1 sm:grid__2 md:grid__4 g2">
    {#await data.feeds.tags}
      <!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
      {#each Array.from({ length: 8 }) as _, i (i)}
        {@const width = (Math.random() * (80 - 30) + 30).toFixed(2)}
        <li><span class="d-inline-block shimmer" style:width="{width}%">&nbsp;</span></li>
      {/each}
    {:then tags}
      {#each tags.data as tag (tag.id)}
        <li>
          <a href={resolve(`/${data.layer['content.type']}/tags/${tag.id}.xml`)}
            >{tag.attributes.name}</a
          >
        </li>
      {/each}
    {/await}
  </ul>
</section>

<style lang="scss">
  a {
    padding: var(--su1) 0;
  }
</style>
