<script lang="ts">
  import type { PageProps } from './$types';
  import type { Graph, WithContext, Thing } from 'schema-dts';
  import type * as Butterfly from '@enodo/butterfly-ts';

  import { PUBLIC_BASE_URL } from '$env/static/public';
  import { getRelated } from '@enodo/butterfly-ts';
  import Feed from '$components/Feed.svelte';
  import Image from '$components/Image.svelte';
  import Pagination from '$components/Pagination.svelte';
  import api from '$lib/api';
  import { generateJsonLd } from '$lib/JsonLD';

  let { data }: PageProps = $props();
  let jsonLd: Graph | WithContext<Thing> | null = $derived(generateJsonLd(data, ['WebPage']));

  let category = $derived(data.scope as Butterfly.ApiResponse<Butterfly.Category>);
  let thumb = $derived(
    getRelated<Butterfly.Media>(category.data.relationships.thumbnail.data, category.included),
  );
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

  // svelte-ignore state_referenced_locally
  let current = data.scope.data?.id;
  $effect(() => {
    if (data.scope.data?.id !== current) {
      more = [];
      loading = false;
      current = data.scope.data?.id;
      pageIndex = data.layer['page.index'] || 1;
    }
  });
</script>

<svelte:head>
  <meta property="og:type" content="website" />
  {#await data.feeds.posts then posts}
    {#if data.layer['page.index'] === 2}
      <link rel="prev" href="{PUBLIC_BASE_URL}{category.data.attributes.path}" />
    {:else if data.layer['page.index'] > 1}
      <link
        rel="prev"
        href="{PUBLIC_BASE_URL}{category.data.attributes.path}?page={data.layer['page.index'] - 1}"
      />
    {/if}
    {#if !!posts.links?.next}
      <link
        rel="next"
        href="{PUBLIC_BASE_URL}{category.data.attributes.path}?page={data.layer['page.index'] + 1}"
      />
    {/if}
  {/await}

  {#if jsonLd}
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html '<scr' + 'ipt type="application/ld+json">' + JSON.stringify(jsonLd) + '</scr' + 'ipt>'}
  {/if}
</svelte:head>

<section class="d-flex fd-column g7">
  <header class="d-flex fd-column g4" id="scope">
    <div class="ps-relative bar-lg overflow-hidden">
      {#if thumb}
        <picture>
          <Image
            class="w100"
            lazyload={false}
            media={thumb}
            alt={thumb?.attributes.description || category.data.attributes.description || undefined}
            format="cover"
          />
        </picture>
      {/if}

      <h1
        class="fs-foolscap fw-700 d-flex ai-center {thumb
          ? 'jc-center ps-absolute t0 r0 b0 l0 fc-light'
          : 'fc-light-700'}"
      >
        {category.data.attributes.name}
      </h1>
    </div>

    {#if category.data.attributes.description}
      <p class="fs-pica fw-500">{category.data.attributes.description}</p>
    {/if}
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
      current={data.layer['page.index']}
      onload={loadMore}
      next={!!posts.links?.next}
      max={Math.ceil((posts.meta?.total || 1) / (posts.meta?.size || 1))}
      url={(p) => (category.data.attributes.path + (p > 1 ? `?page=${p}` : '')) as `/${string}`}
    />
  {/await}
</section>

<style lang="scss">
  h1.ps-absolute {
    background: rgba(48, 51, 107, 0.75);
  }
</style>
