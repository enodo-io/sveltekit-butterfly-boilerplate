<script lang="ts">
  import type { Snippet } from 'svelte';
  import { onMount } from 'svelte';
  import { fade, scale } from 'svelte/transition';
  import { X } from '@lucide/svelte';

  type Props = {
    open: boolean;
    onClose?: () => void;
    content: Snippet;
  };
  const { open = false, onClose = () => {}, content }: Props = $props();

  // svelte-ignore state_referenced_locally
  let isVisible = $state(open);
  let prefersReducedMotion = $state(false);

  $effect(() => {
    isVisible = open;
    document.body.style.overflow = isVisible ? 'hidden' : '';
  });

  const close = () => {
    isVisible = false;
    onClose();
  };

  const onBackdropClick = (e: MouseEvent) => {
    if (e.currentTarget === e.target) close();
  };

  const handleKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
    }
  };

  onMount(() => {
    if (isVisible) document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKey);

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotion = mediaQuery.matches;

    const handleChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion = e.matches;
    };
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKey);
      mediaQuery.removeEventListener('change', handleChange);
    };
  });
</script>

{#if isVisible}
  <div
    class="backdrop show z-modal-bg transition-all duration-100"
    role="button"
    tabindex="0"
    aria-label="Close modal"
    onclick={onBackdropClick}
    onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && close()}
    transition:fade={{ duration: prefersReducedMotion ? 0 : 210 }}
  >
    <button
      aria-label="Close modal"
      onclick={close}
      class="fixed top-2 right-2 z-modal p-4 text-light"><X size={24} /></button
    >
    <div
      class="modal"
      role="dialog"
      aria-modal="true"
      transition:scale={{ duration: prefersReducedMotion ? 0 : 250, start: 0.8 }}
    >
      {@render content()}
    </div>
  </div>
{/if}

<style lang="scss">
  .backdrop {
    position: fixed;
    inset: 0;
    background: var(--bg-modal);
    display: flex;
    align-items: center;
    justify-content: center;
  }
</style>
