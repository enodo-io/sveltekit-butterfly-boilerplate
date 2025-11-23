<script lang="ts">
  import { resolve } from '$app/paths';
  import { page } from '$app/state';

  const currentPage = $derived(page.url.pathname);
</script>

<footer
  class="w100 fc-light bg-light-700 p6 sm:p6 md:p8 d-flex fd-column-reverse sm:fd-row g7 jc-space-between"
>
  <div class="d-flex fd-column jc-space-between ai-center g4">
    <p class="fs-minion">
      Powered by <a class="px0" href="https://butterfly.enodo.io/">Enodo Butterfly</a>
    </p>
    <p class="fs-minion">
      Copyright © <a
        class="px0"
        href={resolve('/')}
        aria-current={currentPage === resolve('/') ? 'page' : undefined}
        >{page.data.settings.title}</a
      >
    </p>
  </div>
  <nav aria-label="Main pages">
    <ul class="d-grid g-af-column grid__r4 g2 fs-minion ta-center">
      <li>
        <a
          href={resolve('/articles')}
          aria-current={currentPage === resolve('/articles') ? 'page' : undefined}>Articles</a
        >
      </li>
      <li>
        <a
          href={resolve('/tags')}
          aria-current={currentPage === resolve('/tags') ? 'page' : undefined}>Tags</a
        >
      </li>
      <li>
        <a
          href={resolve('/authors')}
          aria-current={currentPage === resolve('/authors') ? 'page' : undefined}>Authors</a
        >
      </li>
      <li>
        <a
          href={resolve('/search')}
          aria-current={currentPage === resolve('/search') ? 'page' : undefined}>Search</a
        >
      </li>
      <li>
        <a
          href={resolve('/about.html')}
          aria-current={currentPage === resolve('/about.html') ? 'page' : undefined}>About</a
        >
      </li>
      <li>
        <a
          href={resolve('/rss.html')}
          aria-current={currentPage === resolve('/rss.html') ? 'page' : undefined}>RSS Feeds</a
        >
      </li>
      <li>
        <a
          href={resolve('/atom.html')}
          aria-current={currentPage === resolve('/atom.html') ? 'page' : undefined}>Atom Feeds</a
        >
      </li>
    </ul>
  </nav>
</footer>

<style lang="scss">
  @use 'sass:map';
  @use '@enodo/foundation-css/variables/breakpoints' as *;

  footer {
    view-transition-name: footer;
  }
  a {
    padding: var(--su1) var(--su4);
    &:hover {
      color: var(--flash);
    }
  }
  :global(header.visible + main + footer) {
    margin-bottom: var(--su11);
  }
  @media (min-width: map.get($breakpoints, 'md')) {
    :global(header.visible + main + footer) {
      margin-bottom: 0;
    }
  }
</style>
