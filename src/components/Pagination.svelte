<script lang="ts">
  import { deepPagination } from 'deep-pagination';
  import { inview } from 'svelte-inview';
  import { resolve } from '$app/paths';

  type Props = {
    current: number;
    max: number;
    url?: (page: number) => `/${string}`;
    pad?: number;
    label?: string;
    controls?: string;
    onload?: () => Promise<boolean>;
    next?: boolean;
    infiniteScroll?: boolean;
  };

  let {
    current,
    max,
    url = (page) => `/?page=${page}`,
    pad = 2,
    label = 'Load more',
    controls,
    onload,
    next = false,
    infiniteScroll = false,
    ...others
  }: Props = $props();

  let loading = false;
  let hide = $state(false);
  let pages = $derived(deepPagination({ current, max, pad }).pages);

  const loadMore = async (e: CustomEvent | MouseEvent, force: boolean = false) => {
    if (loading || !next || current === max || !onload) {
      return;
    }
    if (force) {
      infiniteScroll = true;
      loading = true;
    } else if (infiniteScroll) {
      loading = e.detail.inView;
    }

    if (loading) {
      hide = true;
      next = await onload();
      loading = false;
    }
  };
</script>

{#if max > 1}
  <nav
    aria-label="Navigate the pages"
    class="d-flex fd-column md:fd-row g4 ai-center"
    class:jc-center={!onload}
    class:jc-space-between={onload && next && current !== max}
    class:jc-end={onload && (!next || current === max)}
    {...others}
  >
    {#if onload && next && current !== max}
      <button
        class="btn"
        aria-controls={controls}
        use:inview
        oninview_change={(e) => loadMore(e)}
        onclick={(e) => loadMore(e, true)}
      >
        {label}
      </button>
    {/if}

    <ul class:d-none={hide}>
      {#if current > 1}
        <li class="prev">
          <a aria-label="Go to previous page" href={resolve(url(current - 1))}>Previous page</a>
        </li>
      {/if}
      {#each pages as page, i (i)}
        <li
          class="sm:d-flex"
          class:d-none={page !== current && page !== current - 1 && page !== current + 1}
          class:d-flex={page === current || page !== current - 1 || page !== current + 1}
          class:sep={typeof page !== 'number'}
        >
          {#if typeof page !== 'number'}
            <span aria-hidden="true">{page}</span>
          {:else}
            <a
              aria-current={page === current ? 'page' : undefined}
              aria-label={typeof page !== 'number' ? undefined : `Go to page ${page}`}
              href={resolve(url(page))}>{page}</a
            >
          {/if}
        </li>
      {/each}
      {#if current < max}
        <li class="next">
          <a href={resolve(url(current + 1))} aria-label="Go to next page">Next page</a>
        </li>
      {/if}
    </ul>
  </nav>
{/if}

<style lang="scss">
  @use 'sass:map';
  @use '@enodo/foundation-css/variables/spacing-units' as *;

  ul li {
    transition:
      color 150ms ease-in,
      background 150ms ease-in;
  }

  ul {
    background: var(--light-100);
    box-shadow: 0 20px 30px #30336b0f;
    border-radius: var(--br-sm);
    gap: 1px;
    font-size: 0.875rem;

    .prev,
    .next {
      background: var(--light-100);
      &:hover {
        background: var(--light-075);
      }
      a {
        text-indent: -9999px;
        white-space: nowrap;
      }
      &:before {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }

    .prev:before {
      content: '<';
    }

    .next:before {
      content: '>';
    }

    &,
    li,
    li a,
    li span {
      display: flex;
      align-items: center;
      justify-content: center;
      text-decoration: none;
    }
    li {
      background: var(--light);
      position: relative;
      overflow: hidden;
      &:hover {
        background: var(--light-050);
      }
      &.sep:hover {
        background: var(--light);
      }
      &:first-child {
        border-top-left-radius: var(--br-sm);
        border-bottom-left-radius: var(--br-sm);
      }
      &:last-child {
        border-top-right-radius: var(--br-sm);
        border-bottom-right-radius: var(--br-sm);
      }
      a,
      span {
        aspect-ratio: 1;
        width: var(--su8);
        text-overflow: clip;
        overflow: hidden;
      }
      span {
        color: var(--light-400);
      }
      a {
        &:focus-visible {
          background: var(--light-050);
        }
        &:before {
          position: absolute;
          content: '';
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
        }
        &[aria-current='page'] {
          pointer-events: none;
          cursor: default;
          text-decoration: none;
          background-color: var(--light-700);
          color: var(--light);
          font-weight: 600;
        }
      }
    }
  }
</style>
