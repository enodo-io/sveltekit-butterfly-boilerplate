<script lang="ts">
  import type { PageProps } from './$types';
  import type { Graph, WithContext, Thing } from 'schema-dts';
  import type * as Butterfly from '@enodo/butterfly-ts';

  import { PUBLIC_BASE_URL } from '$env/static/public';
  import { resolve } from '$app/paths';
  import api from '$lib/api';
  import { generateJsonLd } from '$lib/JsonLD';
  import Feed from '$components/Feed.svelte';
  import Pagination from '$components/Pagination.svelte';

  let { data }: PageProps = $props();
  let jsonLd: Graph | WithContext<Thing> | null = $derived(generateJsonLd(data, ['WebPage']));

  let more: Promise<Butterfly.ApiResponse<Butterfly.Post[]>>[] = $state([]);
  let loading = $state(false);
  // svelte-ignore state_referenced_locally
  let pageIndex = data.layer['page.index'] || 1;

  const loadMore = async () => {
    const next = more.length
      ? (await more[more.length - 1]).links.next
      : (await data.feeds.posts)?.links.next;
    if (!next || loading) {
      return false;
    }
    loading = true;

    const posts = api.get<Butterfly.Post[]>({ path: next });
    more = [...more, posts];

    const p = await posts;
    loading = false;

    (window as Window).dataLayer.push({
      event: 'pageview',
      ...data.layer,
      'page.index': ++pageIndex,
    });

    return !!p.links.next;
  };

  // svelte-ignore state_referenced_locally
  let current = data.layer['page.query'];
  $effect(() => {
    if (data.layer['page.query'] !== current) {
      more = [];
      loading = false;
      current = data.layer['page.query'];
      pageIndex = data.layer['page.index'] || 1;
    }
  });
</script>

<svelte:head>
  <meta property="og:type" content="website" />
  {#if data.feeds.posts}
    {#await data.feeds.posts then posts}
      {#if data.layer['page.index'] === 2}
        <link rel="prev" href="{PUBLIC_BASE_URL}/search" />
      {:else if data.layer['page.index'] > 1}
        <link rel="prev" href="{PUBLIC_BASE_URL}/search?page={data.layer['page.index'] - 1}" />
      {/if}
      {#if !!posts.links?.next}
        <link rel="next" href="{PUBLIC_BASE_URL}/search?page={data.layer['page.index'] + 1}" />
      {/if}
    {/await}
  {/if}

  {#if jsonLd}
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html '<scr' + 'ipt type="application/ld+json">' + JSON.stringify(jsonLd) + '</scr' + 'ipt>'}
  {/if}
</svelte:head>

<section class="flex flex-col gap-7">
  <header class="flex flex-col gap-4">
    <h1 class="fs-foolscap font-bold text-light-700">{data.meta.title}</h1>
    <p class="fs-pica font-medium">{data.meta.description}</p>
    {#if data.layer['page.index'] > 1}
      <span class="fs-minion text-light-500">Page {data.layer['page.index']}</span>
    {/if}

    <form action="/search/" method="GET" role="search" class="flex flex-col gap-2 sm:flex-row">
      <input
        autocomplete="off"
        name="query"
        type="text"
        aria-label="Search news, topics and more"
        placeholder="Search news, topics and more"
        value={data.layer['page.query'] || ''}
        class="flex-auto"
      />
      <input type="submit" value="Search" class="btn min-w-[10.5rem]" />
    </form>
  </header>

  {#if data.feeds.tags}
    {#await data.feeds.tags}
      <ul class="flex flex-wrap gap-2">
        <!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
        {#each Array.from({ length: 3 }) as _, i (i)}
          {@const w = (Math.random() * (110 - 60) + 60).toFixed(2)}
          <li class="tag shimmer" style:width="{w}px">&nbsp;</li>
        {/each}
      </ul>
    {:then tags}
      {#if tags.data.length}
        <ul class="flex flex-wrap gap-2">
          {#each tags.data as tag (tag.id)}
            <li class="tag"><a href={resolve(`/tags/${tag.id}`)}>{tag.attributes.name}</a></li>
          {/each}
        </ul>
      {/if}
    {/await}
  {/if}

  {#if data.feeds.posts}
    <div id="posts" class="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
      <Feed feed={data.feeds.posts} length={18} lazyloadAfter={3} />
      {#each more as posts, i (i)}
        <Feed feed={posts} length={18} />
      {/each}
    </div>

    {#await data.feeds.posts then posts}
      {#if posts.data.length <= 0}
        <p>
          We couldn't find any results for your search. Try adjusting your keywords or explore other
          articles on our website.
        </p>
      {/if}

      <Pagination
        controls="posts"
        label="Load more articles"
        current={data.layer['page.index']}
        onload={loadMore}
        next={!!posts.links?.next}
        max={Math.ceil((posts.meta?.total || 1) / (posts.meta?.size || 1))}
        url={(p) =>
          (`/search?query=${encodeURI(data.layer['page.query'] || '')}` +
            (p > 1 ? `&page=${p}` : '')) as `/${string}`}
      />
    {/await}
  {/if}
</section>
