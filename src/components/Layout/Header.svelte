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
  class="t t__slow ff-brand ps-fixed md:ps-sticky z-nav-fixed b0 r0 l0 md:t0 ws-nowrap bg-light fc-light-800"
>
  <div class="d-flex ai-center jc-space-between p2">
    <nav aria-label="Home" class="d-flex ai-center ff-brand ps-relative sm:g2">
      <img src="/favicon.svg" width="48" height="48" alt="" />
      <a
        href={resolve('/')}
        class="logo fs-trafalgar fw-600 link--overlay"
        aria-current={currentPage === resolve('/') ? 'page' : undefined}
        ><span>{page.data.settings.title}</span></a
      >
    </nav>

    <nav class="d-flex ai-center">
      <button
        id="burger"
        bind:this={menuBtn}
        class="p2 md:d-none"
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
        class="backdrop t md:d-flex md:g4
               md:ps-unset
               fs-pica fw-400
               "
        class:visible={menu}
      >
        <Categories
          aria-modal="true"
          aria-label="Main navigation"
          class="t d-flex fd-column md:fd-row md:g4 w100 mt-auto"
          categories={page.data.categories.data}
          clickoutsideIgnore="#burger"
          outsideClickHandler={() => (menu = false)}
        >
          {#snippet after()}
            <li class="ps-relative d-flex g3 md:g0" aria-label="Search">
              <Search />
              <a class="search" href={resolve('/search')}>
                <span class="md:d-none">Search</span>
              </a>
            </li>
          {/snippet}
        </Categories>
      </div>
    </nav>
  </div>
</header>

<style lang="scss">
  @use 'sass:map';
  @use '@enodo/foundation-css/variables/breakpoints' as *;

  @mixin dropdown-transition($visible: false, $desktop: false) {
    @if $visible {
      max-height: 100vh;
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
        transform: translateY(-var(--su2));
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
    outline: 1px solid var(--light-075);
    transform: translateY(var(--su12));
    view-transition-name: header;
    &.visible {
      transform: translateY(0);
    }
  }
  .backdrop {
    height: calc(100vh - var(--su11) - 1px);
    background: var(--bg-modal);
    display: flex;
    position: fixed;
    bottom: calc(var(--su11) + 1px);
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
      border-top-left-radius: var(--br-md);
      border-top-right-radius: var(--br-md);
      background: var(--light);
      padding: var(--su2);
      border-top: 1px solid var(--light-600);
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
      padding-left: var(--su4);
      @include dropdown-transition;
    }

    :global(> ul ul.visible) {
      @include dropdown-transition($visible: true);
    }

    :global(li) {
      position: relative;
      padding: var(--su2) 0;
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

  @media (max-width: map.get($breakpoints, 'sm')) {
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
  @media (min-width: map.get($breakpoints, 'md')) {
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
        padding: var(--su3);
      }

      // depth 2
      :global(> ul > li > ul) {
        position: fixed;
        top: var(--su9);
        left: auto;
        right: auto;
        min-width: calc(var(--su-step) * 3);
        max-width: calc(100vw - var(--su4));
        background: var(--light);
        border-radius: var(--br-md);
        border: 1px solid var(--light-200);
        box-shadow: var(--bs-xl);
        padding: var(--su2);
        margin-top: var(--su1);
        margin-left: calc(var(--su4) * -1);
        transform-origin: top left;
        @include dropdown-transition($desktop: true);
      }

      // last-child is align to right
      :global(> ul > li:nth-last-child(-n + 2) > ul) {
        left: auto;
        right: var(--su2);
        transform-origin: top right;
      }

      :global(> ul > li > ul li) {
        padding: var(--su2) 0;
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
        padding-left: var(--su4);
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
