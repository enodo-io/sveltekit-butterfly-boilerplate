<script lang="ts">
  import type * as Butterfly from '@enodo/butterfly-ts';

  import { getContext } from 'svelte';
  import { contentLink, externalRel } from '$lib/links';
  import InlineNodes from '../InlineNodes.svelte';

  type Props = {
    // `rel`: optional qualifiers from the CMS (`nofollow`, `ugc`, `sponsored`)
    node: Butterfly.PostBody.LinkNode & { rel?: string };
  };
  const { node }: Props = $props();

  /** the post is sponsored (set by Post/Body.svelte) */
  const postSponsored = getContext<(() => boolean) | undefined>('postSponsored');
  const link = $derived(contentLink(node.href));
  const rels = $derived((node.rel || '').toLowerCase().split(/\s+/));
  /** paid link: marked on the node by the CMS, or any external link of a sponsored post */
  const rel = $derived(
    link && !link.internal
      ? externalRel({
          sponsored: !!node.sponsored || rels.includes('sponsored') || !!postSponsored?.(),
          ugc: rels.includes('ugc'),
          nofollow: rels.includes('nofollow'),
        })
      : undefined,
  );
</script>

{#if link}
  <!-- internal: a path (client navigation, same tab); external web: new tab -->
  <!-- eslint-disable svelte/no-navigation-without-resolve -->
  <a
    href={link.href}
    title={node.title || undefined}
    target={link.web && !link.internal ? '_blank' : undefined}
    rel={rel}><InlineNodes nodes={node.value} /></a
  >
  <!-- eslint-enable svelte/no-navigation-without-resolve -->
{:else}
  <InlineNodes nodes={node.value} />
{/if}
