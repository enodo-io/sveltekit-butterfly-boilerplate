<script lang="ts">
  import { resolve } from '$app/paths';
  import { page } from '$app/state';
  import { PUBLIC_STATIC_PAGES } from '$env/static/public';

  // the static pages of the site (PUBLIC_STATIC_PAGES), not a hard-coded about.html
  const staticPages = Object.keys(
    JSON.parse(PUBLIC_STATIC_PAGES || '{}') as Record<string, number>,
  );
  const label = (slug: string) => slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ');

  const currentPage = $derived(page.url.pathname);
</script>

<footer
  class="flex w-full flex-col-reverse justify-between gap-7 bg-light-700 p-6 text-light sm:flex-row sm:p-6 md:p-8"
>
  <div class="flex flex-col items-center justify-between gap-4">
    <p class="fs-minion">
      Powered by <a href="https://butterfly.enodo.io/">Enodo Butterfly</a>
    </p>
    <p class="fs-minion">
      Copyright © <a
        href={resolve('/')}
        aria-current={currentPage === resolve('/') ? 'page' : undefined}
        >{page.data.settings.title}</a
      >
    </p>
  </div>
  <nav aria-label="Footer">
    <ul class="grid grid-flow-col grid-rows-4 gap-2 text-center fs-minion">
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
      {#each staticPages as slug (slug)}
        {@const href = resolve(`/${slug}.html`)}
        <li>
          <a href={href} aria-current={currentPage === href ? 'page' : undefined}>{label(slug)}</a>
        </li>
      {/each}
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
  footer {
    view-transition-name: footer;
  }
  a {
    padding: 0.25rem 1rem;
    &:hover {
      color: var(--color-flash);
    }
  }
  p a {
    padding: 0.25rem 0;
  }
  :global(header.visible + main + footer) {
    margin-bottom: 4rem;
  }
  @media (min-width: 1008px) {
    :global(header.visible + main + footer) {
      margin-bottom: 0;
    }
  }
</style>
