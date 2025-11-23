<script lang="ts">
  import type * as Butterfly from '@enodo/butterfly-ts';

  import text from './InlineNodes/Text.svelte';
  import link from './InlineNodes/Link.svelte';
  import strong from './InlineNodes/Strong.svelte';
  import underline from './InlineNodes/Underline.svelte';
  import emphasis from './InlineNodes/Emphasis.svelte';
  import quote from './InlineNodes/Quote.svelte';
  import abbreviation from './InlineNodes/Abbreviation.svelte';
  import strikethrough from './InlineNodes/Strikethrough.svelte';
  import subscript from './InlineNodes/Subscript.svelte';
  import superscript from './InlineNodes/Superscript.svelte';
  import breakElement from './InlineNodes/Break.svelte';
  import code from './InlineNodes/Code.svelte';

  type Props = { nodes: string | Butterfly.PostBody.BodyInlineNode[] };
  const { nodes }: Props = $props();

  const registry = {
    text,
    link,
    strong,
    underline,
    emphasis,
    quote,
    abbreviation,
    strikethrough,
    subscript,
    superscript,
    break: breakElement,
    code,
  };
</script>

{#if typeof nodes === 'string'}
  {nodes}
{:else}
  {#each nodes as node, i (i)}
    {@const Component = registry[node.type]}
    {#if Component}
      <Component node={node as never} />
    {/if}
  {/each}
{/if}
