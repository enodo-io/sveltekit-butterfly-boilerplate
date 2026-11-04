<script lang="ts">
  import type * as Butterfly from '@enodo/butterfly-ts';

  import { getContext } from 'svelte';
  import { PUBLIC_BASE_URL } from '$env/static/public';
  import { resolve } from '$app/paths';
  import InlineNodes from '../InlineNodes.svelte';

  type Props = {
    node: Butterfly.PostBody.LinkNode;
  };
  const { node }: Props = $props();

  /** the post is sponsored (set by Post/Body.svelte) */
  const postSponsored = getContext<(() => boolean) | undefined>('postSponsored');
  const href = $derived(node.href ?? '');
  const internal = $derived(href.startsWith(PUBLIC_BASE_URL));
  /** paid link: marked on the node by the CMS, or any external link of a sponsored post */
  const sponsored = $derived(!internal && (!!node.sponsored || !!postSponsored?.()));
</script>

<!-- eslint-disable svelte/no-navigation-without-resolve -->
<a
  href={internal ? resolve(href.replace(PUBLIC_BASE_URL, '') as `/${string}`) : href}
  title={node.title}
  target={internal ? undefined : '_blank'}
  rel={internal ? undefined : sponsored ? 'sponsored noopener' : 'noopener'}
  ><InlineNodes nodes={node.value} /></a
>
<!-- eslint-enable svelte/no-navigation-without-resolve -->
