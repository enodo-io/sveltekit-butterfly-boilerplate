<script lang="ts">
  import type * as Butterfly from '@enodo/butterfly-ts';

  import '$assets/styles/main.scss';
  import defaultThumb from '$assets/images/thumb.jpg';
  import {
    PUBLIC_INDEXABLE,
    PUBLIC_BASE_URL,
    PUBLIC_LOCALE,
    PUBLIC_MEDIA_URL,
  } from '$env/static/public';
  import { page } from '$app/state';
  import { onNavigate } from '$app/navigation';
  import { getRelated } from '@enodo/butterfly-ts';
  import { getMediaUrl } from '$lib/getMediaUrl';
  import Header from '$components/Layout/Header.svelte';
  import Footer from '$components/Layout/Footer.svelte';
  import GTM from '$components/GTM.svelte';
  import Breadcrumb from '$components/Breadcrumb.svelte';

  let { data, children } = $props();

  onNavigate((navigation) => {
    if (!document.startViewTransition) return;

    return new Promise((resolve) => {
      document.startViewTransition(async () => {
        resolve();
        await navigation.complete;
      });
    });
  });
</script>

<svelte:head>
  <link rel="icon" type="image/svg+xml" sizes="any" href="favicon.svg" />
  <link rel="icon" type="icon/png" sizes="180x180" href="/favicon-180.png" />
  <link rel="shortcut icon" href="/favicon.ico" />
  <link rel="apple-touch-icon" sizes="180x180" href="/favicon-180.png" />
  <link rel="preconnect" href={PUBLIC_MEDIA_URL} />

  <meta name="theme-color" content="#4bdc9f" />
  <meta property="og:locale" content={PUBLIC_LOCALE ?? 'en_US'} />
  <meta property="og:site_name" content={data.settings.title} />

  {#if page.error}
    <meta name="robots" content="noindex,follow" />
    <title>Error {page.status}</title>
  {:else}
    <meta
      name="robots"
      content={PUBLIC_INDEXABLE === 'false'
        ? 'noindex,nofollow'
        : page.data.meta.robots || 'index,follow,all,max-snippet:-1,max-image-preview:standard'}
    />
    {#if page.url.pathname !== '/'}
      <title>{page.data.meta.title} | {data.settings.title}</title>
      <meta property="og:title" content="{page.data.meta.title} | {data.settings.title}" />
    {:else}
      <title>{page.data.meta.title}</title>
      <meta property="og:title" content={page.data.meta.title} />
    {/if}

    <meta name="description" content={page.data.meta.description} />
    <meta property="og:description" content={page.data.meta.description} />

    <!-- prettier-ignore -->
    <link
      rel="canonical"
      href={page.data.layer['content.type'] === 'post' &&
      (page.data.scope as Butterfly.ApiResponse<Butterfly.Post>).data.attributes.canonical
        ? (page.data.scope as Butterfly.ApiResponse<Butterfly.Post>).data.attributes.canonical
        : page.data.meta.url}
    />
    <meta property="og:url" content={page.data.meta.url} />

    {#if page.data.scope?.data.relationships.thumbnail?.data}
      <meta
        property="og:image"
        content={getMediaUrl({
          media: getRelated(
            page.data.scope.data.relationships.thumbnail.data,
            page.data.scope.included,
          ) as Butterfly.Media,
          format: 'thumb',
          ext: 'jpg',
        })}
      />
    {:else}
      <meta property="og:image" content={defaultThumb} />
    {/if}
    <meta property="og:image:width" content="1366" />
    <meta property="og:image:height" content="768" />
    <meta property="og:image:type" content="image/jpeg" />

    {#snippet feed(path: string, format: string)}
      <link
        rel="alternate"
        type="application/{format}+xml"
        href="{PUBLIC_BASE_URL}/{format}/{path}.xml"
        title={page.data.meta.title}
      />
    {/snippet}
    {#each ['rss', 'atom'] as format (format)}
      {#if ['home', 'articles'].includes(page.data.layer['content.type'])}
        {@render feed('index', format)}
      {:else if page.data.layer['content.type'] === 'category' && page.data.scope}
        {@render feed(`sections${page.data.scope.data.attributes.path}`, format)}
      {:else if page.data.layer['content.type'] === 'author' && page.data.scope}
        {@render feed(`authors/${page.data.scope.data.id}`, format)}
      {:else if page.data.layer['content.type'] === 'tag' && page.data.scope}
        {@render feed(`tags/${page.data.scope.data.id}`, format)}
      {/if}
    {/each}
  {/if}
</svelte:head>

<a href="#page" class="skip-link" aria-label="Skip to main content"></a>

<Header />

<main id="page" class="d-flex fl1 fd-column g7 ws12 wmx100 mx-auto p2 md:py7">
  {#if !page.error}
    <Breadcrumb />
  {/if}

  {@render children?.()}
</main>

<Footer />
<GTM />

<style lang="scss">
  .skip-link {
    position: absolute;
    left: -9999px;
    z-index: 9999;
    padding: var(--su2) var(--su4);
    background: var(--light-700);
    color: var(--light);
    text-decoration: none;
    border-radius: var(--br-sm);
    &:after {
      content: attr(aria-label);
    }
    &:focus {
      left: 6px;
      top: 7px;
    }
  }
  @keyframes fade-in {
    from {
      opacity: 0;
    }
  }

  @keyframes fade-out {
    to {
      opacity: 0;
    }
  }

  /* @keyframes slide-from-right { */
  /* 	from { */
  /* 		transform: translateX(30px); */
  /* 	} */
  /* } */

  /* @keyframes slide-to-left { */
  /* 	to { */
  /* 		transform: translateX(-30px); */
  /* 	} */
  /* } */

  :root::view-transition-old(root) {
    animation: 90ms cubic-bezier(0.4, 0, 1, 1) both fade-out;
    /* 300ms cubic-bezier(0.4, 0, 0.2, 1) both slide-to-left; */
  }

  :root::view-transition-new(root) {
    animation: 210ms cubic-bezier(0, 0, 0.2, 1) 90ms both fade-in;
    /* 300ms cubic-bezier(0.4, 0, 0.2, 1) both slide-from-right; */
  }

  @media (prefers-reduced-motion) {
    ::view-transition-group(*),
    ::view-transition-old(*),
    ::view-transition-new(*) {
      animation: none !important;
    }
  }
</style>
