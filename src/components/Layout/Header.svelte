<script lang="ts">
  import { Menu, X, Search } from '@lucide/svelte';
  import { resolve } from '$app/paths';
  import { page, navigating } from '$app/state';
  import Categories from './Categories.svelte';

  const currentPage = $derived(page.url.pathname);

  let scrollY = $state(0);
  let lastY = $state(0);
  let show = $state(true);
  let menu = $state(false);
  let menuBtn: HTMLButtonElement;

  // Close menu on navigation
  $effect(() => {
    if (navigating.to) {
      menu = false;
    }
  });

  // Lock body scroll when menu is open
  $effect(() => {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = menu ? 'hidden' : '';
    }
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

  // Handle escape for a11y
  const handleEscape = (e: KeyboardEvent) => {
    if (menu && e.key === 'Escape') {
      e.preventDefault();
      menuBtn.focus();
      menu = false;
    }
  };
</script>

<svelte:window bind:scrollY={scrollY} on:keydown={handleEscape} />

<header
  class:visible={show}
  class="t__slow fixed right-0 bottom-0 left-0 z-nav-fixed bg-light font-brand whitespace-nowrap text-light-800 transition duration-250 md:sticky md:top-0"
>
  <div class="flex items-center justify-between p-2">
    <nav aria-label="Home" class="relative flex items-center font-brand sm:gap-2">
      <img src="/favicon.svg" width="48" height="48" alt="" />
      <a
        href={resolve('/')}
        class="logo link--overlay fs-trafalgar font-semibold"
        aria-current={currentPage === resolve('/') ? 'page' : undefined}
        ><span>{page.data.settings.title}</span></a
      >
    </nav>

    <nav class="flex items-center">
      <button
        id="burger"
        bind:this={menuBtn}
        class="p-2 md:hidden"
        onclick={() => (menu = !menu)}
        aria-label={menu ? 'Close navigation' : 'Open navigation'}
        aria-controls="menu"
        aria-expanded={menu}
      >
        {#if !menu}
          <Menu />
        {:else}
          <X />
        {/if}
      </button>

      <div
        id="menu"
        class="backdrop fs-pica font-normal transition duration-100
               md:relative
               md:flex md:gap-4
               "
        class:visible={menu}
      >
        <Categories
          aria-modal="true"
          aria-label="Main navigation"
          class="dureation-100 mt-auto flex w-full flex-col transition md:flex-row md:gap-4"
          categories={page.data.categories.data}
          clickoutsideIgnore="#burger"
          outsideClickHandler={() => (menu = false)}
        >
          {#snippet after()}
            <li class="relative flex gap-3 md:gap-0" aria-label="Search">
              <Search />
              <a class="search" href={resolve('/search')}>
                <span class="md:hidden">Search</span>
              </a>
            </li>
          {/snippet}
        </Categories>
      </div>
    </nav>
  </div>
</header>

<style lang="scss">
  @mixin dropdown-transition($visible: false, $desktop: false) {
    @if $visible {
      max-height: 100dvh;
      opacity: 1;
      @if $desktop {
        transform: translateY(0) scale(1);
      } @else {
        transform: translateY(0);
      }
      visibility: visible;
      pointer-events: auto;
      transition:
        max-height 350ms cubic-bezier(0.22, 1, 0.36, 1),
        opacity 250ms ease,
        transform 400ms cubic-bezier(0.22, 1, 0.36, 1),
        visibility 0s 0s;
    } @else {
      max-height: 0;
      overflow: hidden;
      opacity: 0;
      @if $desktop {
        transform: translateY(-20%) scale(0);
      } @else {
        transform: translateY(-0.5rem);
      }
      visibility: hidden;
      pointer-events: none;
      transition:
        max-height 350ms cubic-bezier(0.22, 1, 0.36, 1),
        opacity 200ms ease,
        transform 300ms cubic-bezier(0.22, 1, 0.36, 1),
        visibility 0s 300ms;
    }
  }

  header {
    outline: 1px solid var(--color-light-075);
    transform: translateY(4.5rem);
    view-transition-name: header;
    &.visible {
      transform: translateY(0);
    }
  }
  .backdrop {
    height: calc(100dvh - 4rem - 1px);
    background: var(--bg-modal);
    display: flex;
    position: fixed;
    bottom: calc(4rem + 1px);
    right: 0;
    left: 0;
    overflow-y: auto;
    width: 100%;
    opacity: 0;
    visibility: hidden;
    &.visible {
      opacity: 1;
      visibility: visible;
    }

    :global(> ul) {
      border-top-left-radius: var(--radius-md);
      border-top-right-radius: var(--radius-md);
      background: var(--color-light);
      padding: 0.5rem;
      border-top: 1px solid var(--color-light-600);
      transform-origin: bottom right;
      transform: translateY(40%) scale(0);
      opacity: 0;
      transition:
        transform 420ms cubic-bezier(0.22, 1, 0.36, 1),
        opacity 250ms ease;
    }

    &.visible :global(> ul) {
      transform: translateY(0) scale(1);
      opacity: 1;
    }

    :global(> ul ul) {
      padding-left: 1rem;
      @include dropdown-transition;
    }

    :global(> ul ul.visible) {
      @include dropdown-transition($visible: true);
    }

    :global(li) {
      position: relative;
      padding: 0.5rem 0;
    }

    :global(li a:after),
    :global(li button:after) {
      content: '';
      position: absolute;
      inset: 0;
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

  @media (max-width: 600px) {
    .logo span {
      border: 0 !important;
      clip: rect(1px, 1px, 1px, 1px) !important;
      -webkit-clip-path: inset(50%) !important;
      clip-path: inset(50%) !important;
      height: 1px !important;
      overflow: hidden !important;
      padding: 0 !important;
      position: absolute !important;
      width: 1px !important;
      white-space: nowrap !important;
    }
  }
  @media (min-width: 1008px) {
    header {
      transform: none;
    }
    .backdrop {
      height: auto;
      background: transparent;
      opacity: 1;
      visibility: visible;
      position: static;
      overflow: visible;

      :global(> ul) {
        border: 0;
        background: transparent;
        opacity: 1;
        transform: none;
        padding: 0;
      }
    }

    #menu {
      // depth 1
      :global(> ul > li) {
        position: relative;
        padding: 0.75rem;
      }

      // depth 2
      :global(> ul > li > ul) {
        position: fixed;
        top: 3rem;
        left: auto;
        right: auto;
        min-width: calc(5.25rem * 3);
        max-width: calc(100vw - 1rem);
        background: var(--color-light);
        border-radius: var(--radius-md);
        border: 1px solid var(--color-light-200);
        box-shadow: var(--shadow-xl);
        padding: 0.5rem;
        margin-top: 0.25rem;
        margin-left: calc(1rem * -1);
        transform-origin: top left;
        @include dropdown-transition($desktop: true);
      }

      // last-child is align to right
      :global(> ul > li:nth-last-child(-n + 2) > ul) {
        left: auto;
        right: 0.5rem;
        transform-origin: top right;
      }

      :global(> ul > li > ul li) {
        padding: 0.5rem 0;
      }

      :global(> ul > li:hover > ul),
      :global(> ul > li > ul.visible) {
        max-height: 80vh;
        overflow-y: auto;
        @include dropdown-transition($visible: true, $desktop: true);
      }

      // depth 3
      :global(> ul > li > ul ul) {
        position: static;
        border: 0;
        box-shadow: none;
        padding-left: 1rem;
        @include dropdown-transition;
      }

      :global(> ul > li > ul ul.visible) {
        @include dropdown-transition($visible: true);
      }
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .backdrop,
    .backdrop :global(ul),
    .backdrop :global(ul ul) {
      transition: none !important;
      transition-delay: 0s !important;
    }
  }
</style>
