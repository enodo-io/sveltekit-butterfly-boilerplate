<script lang="ts">
  import { Menu, X, Search, ChevronDown } from '@lucide/svelte';
  import { resolve } from '$app/paths';
  import { page, navigating } from '$app/state';

  import type * as Butterfly from '@enodo/butterfly-ts';

  const currentPage = $derived(page.url.pathname);

  let scrollY = $state(0);
  let lastY = $state(0);
  let show = $state(true);
  let menu = $state(false);
  let menuPopover: HTMLElement;

  // Close menu on navigation
  $effect(() => {
    if (navigating.to) {
      menu = false;
      menuPopover.hidePopover();
      menuPopover.querySelectorAll<HTMLDetailsElement>('details[open]').forEach((d) => {
        d.open = false;
      });
    }
  });

  function handleDetailsToggle(e: Event) {
    if ((e as ToggleEvent).newState !== 'open') return;
    const opened = e.currentTarget as HTMLDetailsElement;

    const ancestors: Element[] = [];
    let el: Element | null = opened.parentElement;
    while (el && el !== menuPopover) {
      if (el.tagName === 'DETAILS') ancestors.push(el);
      el = el.parentElement;
    }

    // Close every open <details> that is not the opened one or one of its ancestors
    menuPopover.querySelectorAll<HTMLDetailsElement>('details[open]').forEach((d) => {
      if (d !== opened && !ancestors.includes(d)) d.open = false;
    });
  }

  // Lock body scroll + trap focus when menu is open
  $effect(() => {
    document.body.style.overflow = menu ? 'hidden' : '';
    document.getElementById('page')?.toggleAttribute('inert', menu);
    document.querySelector('#page + footer')?.toggleAttribute('inert', menu);
    document.querySelector('.skip-link')?.toggleAttribute('inert', menu);
  });

  // Auto-hide header on scroll
  $effect(() => {
    if (menu) return;

    if (scrollY > lastY + 5) {
      show = false;
    } else if (scrollY < lastY - 5) {
      show = true;
    }
    lastY = scrollY;
  });

  $effect(() => {
    const handler = (e: ToggleEvent) => {
      menu = e.newState === 'open';
    };
    menuPopover.addEventListener('toggle', handler);
    return () => menuPopover.removeEventListener('toggle', handler);
  });
</script>

<svelte:window bind:scrollY={scrollY} />

<header
  class:visible={show}
  class="fixed right-0 bottom-0 left-0 z-nav-fixed bg-light font-brand whitespace-nowrap text-light-800 md:sticky md:top-0"
>
  <div class="flex items-center justify-between p-2">
    <nav aria-label="Home" class="relative flex items-center font-brand sm:gap-2">
      <img src="/favicon.svg" width="48" height="48" alt="" />
      <a
        href={resolve('/')}
        class="logo link--overlay fs-trafalgar font-semibold"
        aria-current={currentPage === resolve('/') ? 'page' : undefined}
        ><span class="sr-only sm:not-sr-only">{page.data.settings.title}</span></a
      >
    </nav>

    <nav class="flex items-center">
      <button
        id="burger"
        popovertarget="menu"
        class="p-2 md:hidden"
        aria-label={menu ? 'Close navigation' : 'Open navigation'}
      >
        {#if !menu}
          <Menu />
        {:else}
          <X />
        {/if}
      </button>

      <div
        id="menu"
        bind:this={menuPopover}
        popover
        class="rounded-t-md
               p-2 fs-pica font-normal
               md:relative md:flex
               md:gap-4
               md:rounded-none md:p-0
               "
      >
        <ul class="mt-auto flex w-full flex-col transition duration-100 md:flex-row md:gap-4">
          {#snippet categoriesMenu(
            categories: Butterfly.Category[],
            parent: Butterfly.Category | null = null,
          )}
            {@const childrens: Butterfly.Category[] = categories.filter((c: Butterfly.Category) =>
              parent
                ? c.relationships.parentCategory.data?.id === parent.id
                : !c.relationships.parentCategory.data,
            )}
            {@const hasChild = (p: Butterfly.Category) =>
              categories.filter(
                (c: Butterfly.Category) => c.relationships.parentCategory.data?.id === p.id,
              ).length > 0}
            {#each childrens as category (category.id)}
              <li class="py-2">
                {#if hasChild(category)}
                  <details ontoggle={handleDetailsToggle}>
                    <summary class="flex w-full items-center justify-between gap-3">
                      {category.attributes.name}
                      <ChevronDown size={20} />
                    </summary>
                    <ul
                      id="subnav-{category.id}"
                      class="mt-auto flex-col pl-4 transition duration-100 md:flex-row md:gap-4"
                    >
                      <li class="py-2">
                        <a
                          href={resolve(category.attributes.path)}
                          aria-current={currentPage === resolve(category.attributes.path)
                            ? 'page'
                            : undefined}>{category.attributes.name}</a
                        >
                      </li>
                      {@render categoriesMenu(categories, category)}
                    </ul>
                  </details>
                {:else}
                  <a
                    href={resolve(category.attributes.path)}
                    aria-current={currentPage === resolve(category.attributes.path)
                      ? 'page'
                      : undefined}>{category.attributes.name}</a
                  >
                {/if}
              </li>
            {/each}
          {/snippet}
          {@render categoriesMenu(page.data.categories.data, null)}
          <li class="relative flex items-center justify-between gap-3 py-2" aria-label="Search">
            <a class="search" href={resolve('/search')}> Search </a>
            <Search />
          </li>
        </ul>
      </div>
    </nav>
  </div>
</header>

<style lang="scss">
  header {
    outline: 1px solid var(--color-light-075);
    view-transition-name: header;
    transform: translateY(4.5rem);
    opacity: 0;
    transition:
      transform 250ms var(--tw-ease, ease),
      opacity 250ms var(--tw-ease, ease);
    &.visible {
      transform: translateY(0);
      opacity: 1;
    }
  }
  #menu {
    background: var(--color-light);
    position: fixed;
    top: auto;
    bottom: calc(4rem + 1px);
    right: 0;
    left: 0;
    margin-top: auto;
    overflow-y: auto;
    width: 100%;
    height: auto;
    opacity: 0;
    transition: opacity 300ms var(--tw-ease, ease);

    &::backdrop {
      transition: opacity 300ms var(--tw-ease, ease);
      background: var(--bg-modal);
      height: calc(100dvh - 4rem - 1px);
    }

    &:popover-open {
      display: flex;
      &,
      &::backdrop {
        opacity: 1;
        @starting-style {
          opacity: 0;
        }
      }
    }

    details {
      &::details-content {
        transition:
          height 350ms var(--tw-ease, ease),
          opacity 250ms var(--tw-ease, ease),
          content-visibility 0.5s var(--tw-ease, ease) allow-discrete;
        height: 0;
        opacity: 0;
        overflow: clip;
      }
      & > summary :global(svg) {
        transition: transform 400ms var(--tw-ease, ease);
        transform: rotate3d(1, 0, 0, 0deg);
      }
      &:open {
        &::details-content {
          height: auto;
          opacity: 1;
        }
        & > summary :global(svg) {
          transform: rotate3d(1, 0, 0, 180deg);
        }
      }
    }
  }

  // fix logo and search icon focus-visible since img is outside link
  a.logo,
  a.search {
    &:focus-visible {
      outline: none;
      &:after {
        outline: var(--focus-ring);
      }
    }
  }

  @media (min-width: 1008px) {
    header {
      transform: none;
      opacity: 1;
    }
    #menu {
      height: auto;
      background: transparent;
      opacity: 1;
      visibility: visible;
      position: static;
      overflow: visible;

      & > ul > li {
        position: relative;
        padding: calc(var(--spacing) * 3);
        & > details {
          & > ul {
            background: var(--color-light);
            border-radius: var(--radius-md);
            border: 1px solid var(--color-light-200);
            min-width: 15.75rem;
            max-width: calc(100vw - 1rem);
            max-height: calc(100dvh - 5rem);
            box-shadow: var(--shadow-xl);
            transform-origin: 0 0;
            padding: calc(var(--spacing) * 2);
            margin-left: -1rem;
            position: absolute;
            top: 3rem;
            left: auto;
            right: auto;
            overflow: auto;
            transform: translateY(-20%) scale(0);
            transition: transform 400ms var(--tw-ease, ease);
          }
          &:open > summary:before {
            content: '';
            position: fixed;
            inset: 0;
            top: 4rem;
            width: 100dvw;
            height: calc(100dvh - 4rem);
            cursor: default;
          }
          &:open > ul {
            transform: translateY(0) scale(1);
            @starting-style {
              transform: translateY(-20%) scale(0);
            }
          }
        }
        &:nth-last-child(-n + 2) > details > ul {
          right: 0.5rem;
          left: auto;
          transform-origin: 100% 0;
        }
      }
    }
  }

  li {
    position: relative;
    summary,
    a {
      cursor: pointer;
      &:after {
        content: '';
        position: absolute;
        inset: 0;
      }
    }
  }

  @media (prefers-reduced-motion: reduce) {
    #menu,
    #menu ul {
      transition: none !important;
      transition-delay: 0s !important;
    }
  }
</style>
