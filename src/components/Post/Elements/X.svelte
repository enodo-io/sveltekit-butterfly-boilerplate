<script lang="ts">
  import type * as Butterfly from '@enodo/butterfly-ts';
  import OEmbed from './OEmbed.svelte';

  type Props = { element: Butterfly.PostBody.X };
  const { element }: Props = $props();
</script>

<div class="post--x">
  <OEmbed
    element={element}
    script="https://platform.twitter.com/widgets.js"
    draw={() => window.twttr.widgets.load()}
    test={() => !!window.twttr}
  />
</div>

<style lang="scss">
  .post--x {
    :global(blockquote.twitter-tweet) {
      position: relative;
      display: inline-block;
      font-family: 'Helvetica Neue', Roboto, 'Segoe UI', Calibri, sans-serif;
      font-weight: 700;
      border: 1px solid var(--light-100);
      border-radius: var(--br-sm);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      padding: var(--su4);
      max-width: 468px;
    }
    :global(blockquote.twitter-tweet:hover) {
      background-color: var(--light-025);
    }
    :global(blockquote.twitter-tweet:before) {
      content: '𝕏';
      font-size: 1.75rem;
      position: absolute;
      top: var(--su4);
      right: var(--su4);
    }
    :global(blockquote.twitter-tweet p) {
      font-weight: normal;
      padding-bottom: var(--su4);
    }
    :global(blockquote.twitter-tweet a) {
      font-weight: normal;
      text-decoration: none;
      outline: 0 none;
    }
    :global(blockquote.twitter-tweet p a) {
      color: #1d9bf0;
    }
    :global(blockquote.twitter-tweet a:hover) :global(blockquote.twitter-tweet a:focus) {
      text-decoration: underline;
    }
  }
</style>
