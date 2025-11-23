<script lang="ts">
  import type { PageProps } from './$types';
  import type { Graph, WithContext, Thing } from 'schema-dts';
  import type * as Butterfly from '@enodo/butterfly-ts';

  import { PUBLIC_BASE_URL } from '$env/static/public';
  import api from '$lib/api';
  import { generateJsonLd } from '$lib/JsonLD';
  import { getRelated } from '@enodo/butterfly-ts';
  import Feed from '$components/Feed.svelte';
  import Pagination from '$components/Pagination.svelte';
  import Image from '$components/Image.svelte';
  import { UserRound as Avatar } from '@lucide/svelte';

  let { data }: PageProps = $props();
  let jsonLd: Graph | WithContext<Thing> | null = $derived(generateJsonLd(data, ['ProfilePage']));
  let thumb: Butterfly.Media | null = $derived(
    data.scope.data.relationships.thumbnail.data
      ? (getRelated<Butterfly.Media>(
          data.scope.data.relationships.thumbnail.data,
          data.scope.included,
        ) as Butterfly.Media)
      : null,
  );

  let more: Promise<Butterfly.ApiResponse<Butterfly.Post[]>>[] = $state([]);
  let loading = $state(false);
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

  let current = data.scope.data.id;
  $effect(() => {
    if (data.scope.data.id !== current) {
      more = [];
      loading = false;
      current = data.scope.data.id;
      pageIndex = data.layer['page.index'] || 1;
    }
  });
</script>

<svelte:head>
  <meta property="og:type" content="website" />
  {#await data.feeds.posts then posts}
    {#if data.layer['page.index'] === 2}
      <link rel="prev" href="{PUBLIC_BASE_URL}/authors/{data.scope.data.id}" />
    {:else if data.layer['page.index'] > 1}
      <link
        rel="prev"
        href="{PUBLIC_BASE_URL}/authors/{data.scope.data.id}?page={data.layer['page.index'] - 1}"
      />
    {/if}
    {#if !!posts.links?.next}
      <link
        rel="next"
        href="{PUBLIC_BASE_URL}/authors/{data.scope.data.id}?page={data.layer['page.index'] + 1}"
      />
    {/if}
  {/await}

  {#if jsonLd}
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html '<scr' + 'ipt type="application/ld+json">' + JSON.stringify(jsonLd) + '</scr' + 'ipt>'}
  {/if}
</svelte:head>

<section class="d-flex fd-column g7">
  <header class="d-flex fd-column g4" id="Scope">
    <div class="d-flex g4 ai-center fw-wrap">
      {#if thumb}
        <picture
          class="fl-shrink0 bar-circle overflow-hidden bg-light ba bc-light-075 fc-light-600"
        >
          <Image
            lazyload={false}
            media={thumb}
            width={64}
            widths={[64]}
            sizes="64px"
            alt={data.meta.title}
            format="square"
            class="bg-light-100"
          />
        </picture>
      {:else}
        <div class="fl-shrink0 bar-circle p3 bg-light ba bc-light-075 fc-light-600">
          <Avatar size={40} />
        </div>
      {/if}

      <h1 class="fs-foolscap fw-700 fc-light-700">{data.meta.title}</h1>
    </div>
    <p class="fs-pica fw-500">{data.meta.description}</p>
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
      url={(p) => (`/authors/${data.scope.data.id}` + (p > 1 ? `?page=${p}` : '')) as `/${string}`}
    />
  {/await}
</section>
