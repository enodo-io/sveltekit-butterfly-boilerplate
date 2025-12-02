<script lang="ts">
  import { ChevronDown, ChevronUp } from '@lucide/svelte';
  import { resolve } from '$app/paths';
  import { page, navigating } from '$app/state';
  import { clickoutside } from '$directives/clickoutside.js';
  import Categories from './Categories.svelte';

  import type * as Butterfly from '@enodo/butterfly-ts';

  type Props = {
    parent?: Butterfly.Category;
    categories: Butterfly.Category[];
    visible?: boolean;
    outsideClickHandler?: () => void;
    clickoutsideIgnore?: string;
    before?: import('svelte').Snippet;
    after?: import('svelte').Snippet;
  } & Record<string, unknown>;
  const {
    parent,
    categories,
    visible = true,
    outsideClickHandler,
    clickoutsideIgnore,
    before,
    after,
    ...others
  }: Props = $props();

  let currentPage = $derived(page.url.pathname);
  let openChild = $state<number[]>([]);
  let isDesktop = $state(false);

  // Detect desktop mode
  $effect(() => {
    if (navigating.to) {
      openChild = [];
    }

    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(min-width: 1008px)');
      isDesktop = mediaQuery.matches;

      const handler = (e: MediaQueryListEvent) => {
        isDesktop = e.matches;
      };

      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  });

  // svelte-ignore state_referenced_locally
  const childrens: Butterfly.Category[] = categories.filter((c: Butterfly.Category) =>
    parent
      ? c.relationships.parentCategory.data?.id === parent.id
      : !c.relationships.parentCategory.data,
  );

  const hasChild = (p: Butterfly.Category) =>
    categories.filter((c: Butterfly.Category) => c.relationships.parentCategory.data?.id === p.id)
      .length > 0;

  const toggleChild = (c: Butterfly.Category) => {
    const index = openChild.indexOf(c.id);
    openChild = index < 0 ? [...openChild, c.id] : openChild.toSpliced(index, 1);
  };

  const closeChild = (c: Butterfly.Category) => {
    if (!isDesktop) return;

    const index = openChild.indexOf(c.id);
    if (index >= 0) {
      openChild = openChild.toSpliced(index, 1);
    }
  };

  const handleEscape = (e: KeyboardEvent) => {
    if (!parent && openChild.length && e.key === 'Escape') {
      e.preventDefault();
      if (typeof document !== 'undefined') {
        document.getElementById(`navbar-${openChild[0]}`)?.focus();
      }
      openChild = [];
    }
  };
</script>

<svelte:window on:keydown={handleEscape} />

<ul
  {...others}
  id={parent ? `subnav-${parent.id}` : undefined}
  class:visible={visible}
  use:clickoutside={clickoutsideIgnore ||
    (parent && !parent.relationships?.parentCategory?.data ? `#navbar-${parent.id}` : undefined)}
  onclickoutside={outsideClickHandler}
>
  {#if before}
    {@render before()}
  {/if}

  {#if parent}
    <li>
      <a
        href={resolve(parent.attributes.path)}
        aria-current={currentPage === resolve(parent.attributes.path) ? 'page' : undefined}
        >{parent.attributes.name}</a
      >
    </li>
  {/if}
  {#each childrens as category (category.id)}
    <li>
      {#if hasChild(category)}
        <button
          id="navbar-{category.id}"
          onclick={() => toggleChild(category)}
          aria-controls="subnav-{category.id}"
          aria-expanded={openChild.includes(category.id)}
          class="d-flex ai-center jc-space-between g3 w100"
        >
          {category.attributes.name}
          {#if openChild.includes(category.id)}
            <ChevronUp size={20} />
          {:else}
            <ChevronDown size={20} />
          {/if}
        </button>

        <Categories
          visible={openChild.includes(category.id)}
          categories={categories}
          parent={category}
          outsideClickHandler={!parent ? () => closeChild(category) : undefined}
        />
      {:else}
        <a
          href={resolve(category.attributes.path)}
          aria-current={currentPage === resolve(category.attributes.path) ? 'page' : undefined}
          >{category.attributes.name}</a
        >
      {/if}
    </li>
  {/each}

  {#if after}
    {@render after()}
  {/if}
</ul>
