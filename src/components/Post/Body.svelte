<script lang="ts">
  import type * as Butterfly from '@enodo/butterfly-ts';

  import title from './Elements/Title.svelte';
  import paragraph from './Elements/Paragraph.svelte';
  import quote from './Elements/Quote.svelte';
  import list from './Elements/List.svelte';
  import image from './Elements/Image.svelte';
  import video from './Elements/Video.svelte';
  import audio from './Elements/Audio.svelte';
  import gallery from './Elements/Gallery.svelte';
  import faq from './Elements/FAQ.svelte';
  import iframe from './Elements/Iframe.svelte';
  import youtube from './Elements/Youtube.svelte';
  import dailymotion from './Elements/Dailymotion.svelte';
  import vimeo from './Elements/Vimeo.svelte';
  import x from './Elements/X.svelte';
  import tiktok from './Elements/Tiktok.svelte';
  import facebook from './Elements/Facebook.svelte';
  import instagram from './Elements/Instagram.svelte';
  import pagebreak from './Elements/Pagebreak.svelte';
  import markdown from './Elements/Markdown.svelte';
  import code from './Elements/Code.svelte';
  import embed from './Elements/Embed.svelte';

  type Props = {
    body: Butterfly.PostBody.BodyData[];
    resources: Butterfly.Resource[];
  };

  const { body, resources }: Props = $props();

  const registry = {
    title2: title,
    title3: title,
    title4: title,
    title5: title,
    title6: title,
    paragraph,
    quote,
    bulletList: list,
    orderedList: list,
    reversedList: list,
    image,
    video,
    audio,
    gallery,
    faq,
    iframe,
    youtube,
    dailymotion,
    vimeo,
    x,
    tiktok,
    facebook,
    instagram,
    pagebreak,
    markdown,
    code,
    embed,
  };
</script>

{#each body as element, i (i)}
  {#if element.type in registry}
    {@const Component = registry[element.type]}
    <Component element={element as never} resources={resources as never} />
  {:else}
    <p>[{element.type}]</p>
  {/if}
{/each}
