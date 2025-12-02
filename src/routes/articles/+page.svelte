<script lang="ts">
  import type { PageProps } from './$types';
  import type { Graph, WithContext, Thing } from 'schema-dts';
  import type * as Butterfly from '@enodo/butterfly-ts';

  import { PUBLIC_BASE_URL } from '$env/static/public';
  import Feed from '$components/Feed.svelte';
  import Pagination from '$components/Pagination.svelte';
  import api from '$lib/api';
  import { generateJsonLd } from '$lib/JsonLD';

  let { data }: PageProps = $props();
  // svelte-ignore state_referenced_locally
  const jsonLd: Graph | WithContext<Thing> | null = generateJsonLd(data, ['WebPage']);

  let more: Promise<Butterfly.ApiResponse<Butterfly.Post[]>>[] = $state([]);
  let loading = $state(false);
  // svelte-ignore state_referenced_locally
  let pageIndex = data.layer['page.index'] || 1;

  const loadMore = async () => {
    const next = more.length
      ? (await more[more.length - 1]).links.next
      : (await data.feeds.posts).links.next;
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
</script>

<svelte:head>
  <meta property="og:type" content="website" />
  {#await data.feeds.posts then posts}
    {#if data.layer['page.index'] === 2}
      <link rel="prev" href="{PUBLIC_BASE_URL}/articles" />
    {:else if data.layer['page.index'] > 1}
      <link rel="prev" href="{PUBLIC_BASE_URL}/articles?page={data.layer['page.index'] - 1}" />
    {/if}
    {#if !!posts.links?.next}
      <link rel="next" href="{PUBLIC_BASE_URL}/articles?page={data.layer['page.index'] + 1}" />
    {/if}
  {/await}

  {#if jsonLd}
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html '<scr' + 'ipt type="application/ld+json">' + JSON.stringify(jsonLd) + '</scr' + 'ipt>'}
  {/if}
</svelte:head>

<section class="d-flex fd-column g7">
  <header class="d-flex fd-column g4">
    <h1 class="fs-foolscap fw-700 fc-light-700">{data.meta.title}</h1>
    {#if data.layer['page.index'] > 1}
      <span class="fs-minion fc-light-500">Page {data.layer['page.index']}</span>
    {/if}
  </header>

  <div id="posts" class="d-grid g4 sm:grid__2 md:grid__3">
    <Feed feed={data.feeds.posts} length={18} lazyloadAfter={3} />
    {#each more as posts, i (i)}
      <Feed feed={posts} length={18} />
    {/each}
  </div>

  {#await data.feeds.posts then posts}
    <Pagination
      controls="posts"
      label="Load more articles"
      current={data.layer['page.index']}
      onload={loadMore}
      next={!!posts.links?.next}
      max={Math.ceil((posts.meta?.total || 1) / (posts.meta?.size || 1))}
      url={(p) => ('/articles' + (p > 1 ? `?page=${p}` : '')) as `/${string}`}
    />
  {/await}
</section>
