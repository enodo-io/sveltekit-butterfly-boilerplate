<script lang="ts">
  import type { PageProps } from './$types';
  import type { Graph, WithContext, Thing } from 'schema-dts';
  import type * as Butterfly from '@enodo/butterfly-ts';

  import { generateJsonLd } from '$lib/JsonLD';
  import PostBody from '$components/Post/Body.svelte';

  let { data }: PageProps = $props();

  let jsonLd: Graph | WithContext<Thing> | null = $derived(generateJsonLd(data, ['WebPage']));
</script>

<svelte:head>
  <meta property="og:type" content="webpage" />

  {#if jsonLd}
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html '<scr' + 'ipt type="application/ld+json">' + JSON.stringify(jsonLd) + '</scr' + 'ipt>'}
  {/if}
</svelte:head>

<article id="scope" class="post d-flex fd-column g7">
  <header class="d-flex fd-column g4">
    <h1 class="fs-foolscap fw-700 fc-light-700">{data.meta.title}</h1>
    <p class="fs-double-pica fw-500">{data.meta.description}</p>
  </header>

  <PostBody
    body={data.scope.data.attributes.body as Butterfly.PostBody.BodyData[]}
    resources={data.scope.included}
  />
</article>
