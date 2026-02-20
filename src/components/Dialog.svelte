<script lang="ts">
  import type { Snippet } from 'svelte';
  import { X } from '@lucide/svelte';

  type Props = {
    open: boolean;
    onClose?: () => void;
    content: Snippet;
  };

  const { open = false, onClose = () => {}, content }: Props = $props();

  let dialog: HTMLDialogElement;

  $effect(() => {
    if (open) {
      dialog.showModal();
    } else if (dialog?.open) {
      dialog.close();
    }
  });

  // Body scroll lock — dialog doesn't do this natively
  $effect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  });

  // Close on ::backdrop click (click lands on <dialog> itself, outside the content)
  const handleClick = (e: MouseEvent) => {
    if (e.target === dialog) dialog.close();
  };
</script>

<dialog bind:this={dialog} onclose={onClose} onclick={handleClick}>
  <button
    class="close fixed top-2 right-2 z-modal p-4 text-light"
    aria-label="Close modal"
    onclick={() => dialog.close()}
  >
    <X size={24} />
  </button>
  <div class="modal">
    {@render content()}
  </div>
</dialog>

<style lang="scss">
  dialog {
    border: none;
    padding: 0;
    background: transparent;
    max-width: 90vw;
    max-height: 90dvh;
    margin: auto;

    // Entry + exit animations via CSS — no JS needed
    opacity: 0;
    transform: scale(0.9);
    transition:
      opacity 210ms ease,
      transform 250ms ease,
      overlay 250ms allow-discrete,
      display 250ms allow-discrete;

    &[open] {
      opacity: 1;
      transform: scale(1);

      @starting-style {
        opacity: 0;
        transform: scale(0.9);
      }
    }

    &::backdrop {
      background: var(--bg-modal);
      opacity: 0;
      transition:
        opacity 210ms ease,
        overlay 210ms allow-discrete,
        display 210ms allow-discrete;
    }

    &[open]::backdrop {
      opacity: 1;

      @starting-style {
        opacity: 0;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      &,
      &::backdrop {
        transition: none;
      }
    }
  }
</style>
