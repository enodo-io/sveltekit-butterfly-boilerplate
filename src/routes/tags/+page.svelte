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

<section class="flex flex-col gap-7">
  <header>
    <h1 class="fs-foolscap font-bold text-light-700">{data.meta.title}</h1>
  </header>

  <ul class="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-4">
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
    padding: 0.25rem 0;
  }
</style>
