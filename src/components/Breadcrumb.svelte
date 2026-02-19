<script lang="ts">
  import { page } from '$app/state';
  import { resolve } from '$app/paths';
  import generateBreadcrumbList from '$lib/JsonLD/BreadcrumbList';
  import { Home } from '@lucide/svelte';
  import { PUBLIC_BASE_URL } from '$env/static/public';

  import type { ListItem } from 'schema-dts';

  let breadcrumb = $derived(generateBreadcrumbList(page.data).itemListElement as ListItem[]);
</script>

{#if breadcrumb?.length > 1}
  <nav class="-mb-4 fs-minion" aria-label="Breadcrumb">
    <ul role="list">
      {#each breadcrumb as element, i (element.position)}
        {#if i === 0}
          <li><a href={resolve('/')} aria-label={String(element.name)}><Home size={16} /></a></li>
        {:else}
          <li>
            {#if element.item && typeof element.item === 'string'}
              <a href={resolve(element.item.replace(PUBLIC_BASE_URL, '') as `/${string}`)}
                >{element.name}</a
              >
            {:else}
              <span aria-current="page">
                {element.name}
              </span>
            {/if}
          </li>
        {/if}
      {/each}
    </ul>
  </nav>
{/if}

<style lang="scss">
  a {
    text-decoration: none;
  }
  ul {
    display: flex;
    align-items: center;
    list-style: none;
    max-width: 100%;
    overflow-x: auto;
    scrollbar-width: none;
    gap: 0.5rem;
  }
  li {
    align-items: center;
    flex-shrink: 0;
    display: inline-flex;
    gap: 0.5rem;
    + li:before {
      content: '/';
    }
    &:not(:last-child) {
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
</style>
