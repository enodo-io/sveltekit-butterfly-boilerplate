<script lang="ts">
  import type * as Butterfly from '@enodo/butterfly-ts';
  import OEmbed from './OEmbed.svelte';

  type Props = { element: Butterfly.PostBody.Tiktok };
  const { element }: Props = $props();
  let embed: HTMLDivElement;
</script>

<div class="post--tiktok" bind:this={embed}>
  <OEmbed
    element={element}
    script="https://www.tiktok.com/embed.js"
    draw={() => window.tiktokEmbed.lib.render(embed.querySelectorAll('blockquote.tiktok-embed'))}
    test={() => !!window.tiktokEmbed}
  />
</div>

<style lang="scss">
  .post--tiktok {
    :global(blockquote.tiktok-embed) {
      position: relative;
      display: inline-block;
      font-family: 'Helvetica Neue', Roboto, 'Segoe UI', Calibri, sans-serif;
      border: 1px solid var(--color-light-100);
      border-radius: var(--radius-sm);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      padding: 1rem;
      max-width: 605px;
      min-width: 325px;
      overflow: hidden;
    }

    :global(blockquote.tiktok-embed:hover) {
      background-color: var(--color-light-025);
    }

    :global(blockquote.tiktok-embed:before) {
      content: 'TikTok';
      position: absolute;
      top: 1rem;
      right: 1rem;
      font-size: 1rem;
      font-weight: 500;
    }

    :global(blockquote.tiktok-embed[id]) {
      border: 0;
      border-radius: 0;
      box-shadow: unset;
      padding: 0;
      max-width: 100%;
      min-width: auto;
      overflow: auto;
    }

    :global(blockquote.tiktok-embed[id]:before) {
      display: none;
    }

    :global(blockquote.tiktok-embed p) {
      font-weight: normal;
      line-height: 1.4;
      margin-bottom: 1rem;
    }

    :global(blockquote.tiktok-embed a) {
      color: #fe2c55;
      text-decoration: none;
      font-weight: 700;
      outline: none;
    }

    :global(blockquote.tiktok-embed a:hover),
    :global(blockquote.tiktok-embed a:focus) {
      text-decoration: underline;
    }

    :global(blockquote.tiktok-embed p a[href*='/tag/']) {
      color: #8fbee9;
      font-weight: 700;
    }

    :global(blockquote.tiktok-embed section) {
      display: block;
    }

    :global(blockquote.tiktok-embed:after) {
      content: 'TikTok video not loaded';
      display: none;
      text-align: center;
      color: #888;
      font-size: 0.9rem;
    }

    :global(blockquote.tiktok-embed[style*='display: none']:after) {
      display: block;
      padding: 1rem;
    }
  }
</style>
