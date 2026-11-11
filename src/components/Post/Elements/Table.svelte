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

  // no text at all (empty strings, empty nodes)
  const isEmpty = (content: unknown): boolean => {
    if (content == null) return true;
    if (typeof content === 'string') return content.trim() === '';
    if (Array.isArray(content)) return content.every(isEmpty);
    if (typeof content === 'object' && 'value' in content)
      return isEmpty((content as { value: unknown }).value);
    return (content as { type?: string }).type !== 'break' ? false : true;
  };
</script>

<figure class="post--table">
  <!-- wide tables scroll horizontally inside the column (not the page): the
       scrollable region is focusable and named so keyboard users can scroll it -->
  <!-- svelte-ignore a11y_no_noninteractive_tabindex (WCAG: a scrollable region must be keyboard reachable, axe scrollable-region-focusable) -->
  <section class="post--table--scroll" aria-label={element.data.caption || 'Table'} tabindex="0">
    <table>
      {#if element.data.head?.length}
        <thead>
          {#each element.data.head as row, ri (ri)}
            <tr>
              {#each row as cell, ci (ci)}
                <!-- an empty header cell (a corner) is a td: a th must name its column -->
                {#if isEmpty(cell.content)}
                  <td colspan={cell.colspan || undefined} rowspan={cell.rowspan || undefined}></td>
                {:else}
                  <th
                    scope="col"
                    colspan={cell.colspan || undefined}
                    rowspan={cell.rowspan || undefined}
                    style:text-align={cell.align || undefined}
                    style:vertical-align={cell.valign || undefined}
                  >
                    <InlineNodes nodes={cell.content as BodyInlineNode[]} />
                  </th>
                {/if}
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
  </section>

  {#if element.data.caption}
    <figcaption class="post--media--caption">
      <p>{element.data.caption}</p>
    </figcaption>
  {/if}
</figure>
