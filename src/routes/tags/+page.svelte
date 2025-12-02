<script lang="ts">
  import type { PageProps } from './$types';
  import type { Graph, WithContext, Thing } from 'schema-dts';

  import { resolve } from '$app/paths';
  import { generateJsonLd } from '$lib/JsonLD';

  let { data }: PageProps = $props();
  // svelte-ignore state_referenced_locally
  let jsonLd: Graph | WithContext<Thing> | null = generateJsonLd(data, ['WebPage']);
</script>

<svelte:head>
  <meta property="og:type" content="website" />
  {#if jsonLd}
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html '<scr' + 'ipt type="application/ld+json">' + JSON.stringify(jsonLd) + '</scr' + 'ipt>'}
  {/if}
</svelte:head>

<section class="d-flex fd-column g7">
  <header>
    <h1 class="fs-foolscap fw-700 fc-light-700">{data.meta.title}</h1>
  </header>

  <ul class="d-grid grid__1 sm:grid__2 md:grid__4 g2">
    {#await data.feeds.tags then tags}
      {#each tags.data as tag (tag.id)}
        <li>
          <a href={resolve(`/tags/${tag.id}`)}>{tag.attributes.name}</a>
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
