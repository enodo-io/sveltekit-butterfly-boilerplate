<script lang="ts">
  import type { Graph, WithContext, Thing } from 'schema-dts';
  import type { PageProps } from './$types';
  import type * as Butterfly from '@enodo/butterfly-ts';

  import { resolve } from '$app/paths';
  import Feed from '$components/Feed.svelte';
  import { generateJsonLd } from '$lib/JsonLD';

  let { data }: PageProps = $props();
  const jsonLd: Graph | WithContext<Thing> | null = generateJsonLd(data, ['WebSite']);
</script>

<svelte:head>
  <meta property="og:type" content="website" />
  <link rel="apple-touch-icon-precomposed" sizes="60x60" href="/favicon-60.png" />
  <link rel="apple-touch-icon-precomposed" sizes="76x76" href="/favicon-76.png" />
  <link rel="apple-touch-icon-precomposed" sizes="120x120" href="/favicon-120.png" />
  <link rel="apple-touch-icon-precomposed" sizes="152x152" href="/favicon-152.png" />

  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-title" content={data.settings.title} />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

  <meta name="application-name" content={data.settings.title} />

  <meta name="msapplication-tileimage" content="/favicon-558.png" />
  <meta name="msapplication-tileimage" content="/favicon-512.png" />
  <meta name="msapplication-tooltip" content={data.settings.title} />
  <meta name="msapplication-navbutton-color" content="#4bdc9f" />
  <meta name="msapplication-starturl" content="/" />
  <meta name="msapplication-task" content="name=Home;action-uri=/" />
  {#each data.categories.data as task (task.id)}
    {#if !task.relationships.parentCategory.data}
      <meta
        name="msapplication-task"
        content="name={task.attributes.name};action-uri={task.attributes.path}"
      />
    {/if}
  {/each}
  <meta name="msapplication-task" content="name=Search;action-uri=/search" />

  {#if jsonLd}
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html '<scr' + 'ipt type="application/ld+json">' + JSON.stringify(jsonLd) + '</scr' + 'ipt>'}
  {/if}
</svelte:head>

<section id="featured">
  <Feed feed={data.feeds.featured} format="square" length={1} heading="h1" lazyloadAfter={3} />
</section>

{#each Object.entries(data.feeds.categories) as [id, feed], i (id)}
  {@const category = data.categories.data.find(
    (c: Butterfly.Category) => c.id === parseInt(id, 10),
  ) as Butterfly.Category}
  <section class="d-flex fd-column g4">
    <header>
      <h2 class="fs-trafalgar fw-700 fc-light-700">
        <a href={resolve(category.attributes.path)}>{category.attributes.name}</a>
      </h2>
    </header>
    <div class="d-grid g4 sm:grid__2 md:grid__3">
      <!-- prettier-ignore -->
      <Feed feed={feed as Promise<Butterfly.ApiResponse<Butterfly.Post[]>>} length={4} lazyloadAfter={i > 0 ? 0 : 3} />
    </div>
  </section>
{/each}

<style lang="scss">
  @use 'sass:map';
  @use '@enodo/foundation-css/variables/breakpoints' as *;

  section > header > h2 > a {
    display: flex;
    justify-content: space-between;
    text-decoration: none;
    &:after {
      content: 'See all articles';
      font-size: 1rem;
      font-weight: 400;
    }
  }

  :global(#featured .card--thumb) {
    border-radius: var(--br-lg);
  }
  :global(#featured .card--content:before) {
    content: 'FEATURED';
    border-radius: var(--br-sm);
    background: var(--flash-050);
    border: 2px solid var(--flash);
    color: var(--flash-900);
    padding: var(--su1) var(--su3);
    font-size: 0.825rem;
    font-weight: 700;
    margin-right: auto;
  }

  :global(#featured .card__loading .card--content:before) {
    color: transparent;
    background: var(--shimmer);
    border: transparent;
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }

  @media (min-width: map.get($breakpoints, 'sm')) {
    :global(#featured .card) {
      padding: 0;

      display: grid;
      grid-template-columns: 5fr 7fr;
      grid-template-areas: 'thumb content';
      align-items: center;
    }
    :global(#featured .card--content) {
      padding: var(--su4) 0;
      padding-right: var(--su4);
    }
  }
</style>
