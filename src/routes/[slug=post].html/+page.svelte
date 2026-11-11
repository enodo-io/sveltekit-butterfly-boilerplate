<script lang="ts">
  import type { PageProps } from './$types';
  import type { Graph, WithContext, Thing } from 'schema-dts';
  import type * as Butterfly from '@enodo/butterfly-ts';

  import { resolve } from '$app/paths';
  import { generateJsonLd } from '$lib/JsonLD';
  import { absoluteUrl } from '$lib/seo';
  import { env } from '$env/dynamic/public';
  import { getMediaUrl } from '$lib/getMediaUrl';
  import { getRelated } from '@enodo/butterfly-ts';
  import { formatRelativeDate } from '$lib/formatRelativeDate';
  import { customString, hasFlag } from '$lib/posts';
  import PostBody from '$components/Post/Body.svelte';
  import Authorship from '$components/Post/Authorship.svelte';
  import { Forward as Share } from '@lucide/svelte';
  import Feed from '$components/Feed.svelte';

  let { data }: PageProps = $props();

  // Web Share where available (mobile), else copy the link (desktop Firefox has no navigator.share)
  let copied = $state(false);
  const share = async () => {
    const shared = { title: data.meta.title, text: data.meta.description, url: data.meta.url };
    if (navigator.share) {
      await navigator.share(shared).catch(() => {});
      return;
    }
    await navigator.clipboard?.writeText(shared.url);
    copied = true;
    setTimeout(() => (copied = false), 2000);
  };

  let post: Butterfly.Post = $derived(data.scope.data);
  /** partner content (flag `sponso`): one line above the title, `rel="sponsored"` on its external links */
  let sponsored = $derived(hasFlag(post, 'sponso'));
  let sponsor = $derived(customString(post, 'sponsor'));
  let jsonLd: Graph | WithContext<Thing> | null = $derived(
    generateJsonLd(data, [
      'Article',
      'VideoObject',
      ...((post.attributes.body as Butterfly.PostBody.BodyData[]).some((b) => b.type === 'faq')
        ? ['FAQPage']
        : []),
    ]),
  );
  let hreflangs: Record<string, string> = $derived(
    Object.keys(post.attributes.hreflangs || {}).length
      ? {
          ...(env.PUBLIC_LANGUAGE ? { [env.PUBLIC_LANGUAGE]: data.meta.url } : {}),
          ...post.attributes.hreflangs,
        }
      : {},
  );
  let section: Butterfly.Category | null = $derived(
    post.relationships.category.data?.id
      ? (getRelated(post.relationships.category.data, data.categories.data) as Butterfly.Category)
      : null,
  );
  let tags: Butterfly.Term[] = $derived(
    post.relationships.terms.data
      .filter((t: Butterfly.Related) => t.type === 'term<tags>')
      .map((t: Butterfly.Related) => getRelated(t, data.scope.included)) as Butterfly.Term[],
  );
  let authors: Butterfly.Author[] = $derived(
    post.relationships.authors.data.map((a: Butterfly.Related) =>
      getRelated(a, data.scope.included),
    ) as Butterfly.Author[],
  );
  let videos: Butterfly.Video[] = $derived(
    (post.attributes.body as Butterfly.PostBody.BodyData[])
      .filter((item: Butterfly.PostBody.BodyData) => item.type === 'video')
      .map(
        (item: Butterfly.PostBody.Video) =>
          getRelated(
            { id: item.data.mediaId, type: 'video' },
            data.scope.included,
          ) as Butterfly.Video,
      ),
  );
  let audios: Butterfly.Audio[] = $derived(
    (post.attributes.body as Butterfly.PostBody.BodyData[])
      .filter((item: Butterfly.PostBody.BodyData) => item.type === 'audio')
      .map(
        (item: Butterfly.PostBody.Audio) =>
          getRelated(
            { id: item.data.mediaId, type: 'audio' },
            data.scope.included,
          ) as Butterfly.Audio,
      ),
  );
</script>

<svelte:head>
  <!-- Open Graph article namespace: `article:*` (ogp.me/ns/article), not `og:article:*` -->
  <meta property="og:type" content="article" />
  <meta property="article:published_time" content={post.attributes.publishedAt} />
  {#if post.attributes.updatedAt > post.attributes.publishedAt}
    <meta property="article:modified_time" content={post.attributes.updatedAt} />
  {/if}

  <!-- hreflang: the translations of the CMS plus the page itself (Google ignores a
       set whose pages do not reference themselves) -->
  {#each Object.entries(hreflangs) as [lang, url] (lang)}
    <link rel="alternate" hreflang={lang} href={url} />
  {/each}

  {#each authors as author (author.id)}
    <!-- article:author is a profile URL, not a name -->
    <meta property="article:author" content={absoluteUrl(`/authors/${author.id}`)} />
  {/each}

  {#if section}
    <meta property="article:section" content={section.attributes.name} />
  {/if}

  {#each tags as tag (tag.id)}
    <meta property="article:tag" content={tag.attributes.name} />
  {/each}

  {#each videos as video (video.id)}
    <meta
      property="og:video"
      content={getMediaUrl({ media: video, definition: 'hd', ext: 'mp4' })}
    />
    <meta property="og:video:type" content="video/mp4" />
    <meta property="og:video:width" content={video.attributes.width.toString()} />
    <meta property="og:video:height" content={video.attributes.height.toString()} />
  {/each}

  {#each audios as audio (audio.id)}
    <meta
      property="og:audio"
      content={getMediaUrl({ media: audio, definition: 'hd', ext: 'mp3' })}
    />
    <meta property="og:audio:type" content="audio/mpeg" />
  {/each}

  {#if jsonLd}
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html '<scr' + 'ipt type="application/ld+json">' + JSON.stringify(jsonLd) + '</scr' + 'ipt>'}
  {/if}
</svelte:head>

<!-- layout wrapper only (no heading of its own): a div, not a section -->
<div class="flex flex-col gap-4 md:grid md:grid-cols-3 md:items-start">
  <article id="scope" class="post col-span-2 flex flex-col gap-7">
    <header class="flex flex-col gap-4">
      {#if tags.length}
        <ul class="flex flex-wrap gap-2">
          {#each tags as tag (tag.id)}
            <li class="tag">
              <a href={resolve(`/tags/${tag.id}`)}>{tag.attributes.name}</a>
            </li>
          {/each}
        </ul>
      {/if}
      {#if sponsored}
        <p
          class="self-start rounded-sm bg-light-100 px-2 py-1 fs-brevier font-medium tracking-wide text-light-600 uppercase"
        >
          {sponsor ? `Sponsored by ${sponsor}` : 'Partner content'}
        </p>
      {/if}
      <h1 class="fs-foolscap font-bold text-light-700">{data.meta.title}</h1>
      <p class="fs-double-pica font-medium">{data.meta.description}</p>
      {#snippet date(d: string, action: string)}
        {@const relativeDate = formatRelativeDate(new Date(d))}
        <time class="fs-brevier" datetime={d}>
          <span class="pr-2 sm:pr-4">{relativeDate.date}</span>
          <span class="whitespace-nowrap">{action} {relativeDate.time}</span>
        </time>
      {/snippet}

      {#if new Date(post.attributes.publishedAt) >= new Date(post.attributes.updatedAt)}
        {@render date(post.attributes.publishedAt, 'Published')}
      {:else}
        {@render date(post.attributes.updatedAt, 'Updated')}
      {/if}

      <div class="flex flex-wrap items-center gap-4">
        {#if authors.length}
          <Authorship authors={authors} resources={data.scope.included} />
        {/if}

        <button type="button" class="btn btn__sm" onclick={share}>
          <Share size={20} />
          {copied ? 'Link copied' : 'Share'}
        </button>
      </div>
    </header>

    <PostBody
      body={post.attributes.body as Butterfly.PostBody.BodyData[]}
      resources={data.scope.included}
      sponsored={sponsored}
    />
  </article>
  <aside class="sticky top-12 flex flex-col gap-7" aria-labelledby="related-title">
    <div class="flex flex-col gap-4">
      <!-- always rendered: the aside is labelled by it, also while the posts load -->
      <h2 id="related-title" class="fs-paragon font-bold text-light-700">Related articles</h2>
      <!-- the aside is a third of the 992px column from md, full width below -->
      <ul class="flex flex-col gap-4">
        <Feed
          feed={data.feeds.related}
          length={3}
          resume={false}
          thumbnail={true}
          sizes="(min-width: 1008px) 320px, calc(100vw - 16px)"
        />
      </ul>
    </div>
  </aside>
</div>
