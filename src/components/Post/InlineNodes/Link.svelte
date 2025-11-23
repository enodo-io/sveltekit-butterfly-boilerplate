<script lang="ts">
  import type * as Butterfly from '@enodo/butterfly-ts';

  import { PUBLIC_BASE_URL } from '$env/static/public';
  import { resolve } from '$app/paths';
  import InlineNodes from '../InlineNodes.svelte';

  type Props = {
    node: Butterfly.PostBody.LinkNode;
  };
  const { node }: Props = $props();
</script>

<!-- eslint-disable svelte/no-navigation-without-resolve -->
<a
  href={node.href?.startsWith(PUBLIC_BASE_URL)
    ? resolve(node.href.replace(PUBLIC_BASE_URL, '') as `/${string}`)
    : node.href}
  title={node.title}
  target={node.href?.startsWith(PUBLIC_BASE_URL) ? undefined : '_blank'}
  rel={node.href?.startsWith(PUBLIC_BASE_URL) ? undefined : 'noopener'}
  ><InlineNodes nodes={node.value} /></a
>
<!-- eslint-enable svelte/no-navigation-without-resolve -->
