<script lang="ts">
  import type { BodyInlineNode } from '@enodo/butterfly-ts/dist/post-body.js';

  import InlineNodes from '../InlineNodes.svelte';

  type Cell = {
    content: BodyInlineNode[];
    colspan?: number;
    rowspan?: number;
    align?: string;
    valign?: string;
  };

  type Props = {
    element: {
      data: {
        head?: Cell[][];
        body: Cell[][];
        foot?: Cell[][];
        caption?: string;
      };
    };
  };
  const { element }: Props = $props();
</script>

<figure class="post--table">
  <table>
    {#if element.data.head?.length}
      <thead>
        {#each element.data.head as row, ri (ri)}
          <tr>
            {#each row as cell, ci (ci)}
              <th
                colspan={cell.colspan || undefined}
                rowspan={cell.rowspan || undefined}
                style:text-align={cell.align || undefined}
                style:vertical-align={cell.valign || undefined}
              >
                <InlineNodes nodes={cell.content as BodyInlineNode[]} />
              </th>
            {/each}
          </tr>
        {/each}
      </thead>
    {/if}

    <tbody>
      {#each element.data.body as row, ri (ri)}
        <tr>
          {#each row as cell, ci (ci)}
            <td
              colspan={cell.colspan || undefined}
              rowspan={cell.rowspan || undefined}
              style:text-align={cell.align || undefined}
              style:vertical-align={cell.valign || undefined}
            >
              <InlineNodes nodes={cell.content as BodyInlineNode[]} />
            </td>
          {/each}
        </tr>
      {/each}
    </tbody>

    {#if element.data.foot?.length}
      <tfoot>
        {#each element.data.foot as row, ri (ri)}
          <tr>
            {#each row as cell, ci (ci)}
              <td
                colspan={cell.colspan || undefined}
                rowspan={cell.rowspan || undefined}
                style:text-align={cell.align || undefined}
                style:vertical-align={cell.valign || undefined}
              >
                <InlineNodes nodes={cell.content as BodyInlineNode[]} />
              </td>
            {/each}
          </tr>
        {/each}
      </tfoot>
    {/if}
  </table>

  {#if element.data.caption}
    <figcaption class="post--media--caption">
      <p>{element.data.caption}</p>
    </figcaption>
  {/if}
</figure>
