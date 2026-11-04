<script lang="ts">
  import { page } from '$app/state';
  import { resolve } from '$app/paths';
  import { Home } from '@lucide/svelte';

  /** 404 and 410 have their own texts; every other status reads the 500 texts. */
  const texts: Record<number, { title: string; text: string }> = {
    404: {
      title: 'Page not found',
      text: 'The page you are looking for has moved or never existed. The sections of the site and the search are in the menu.',
    },
    410: {
      title: 'Content removed',
      text: 'This content has been deleted and will not come back.',
    },
    500: {
      title: 'Something went wrong',
      text: 'An error occurred on our side. Please try again in a moment.',
    },
  };
  let status = $derived(page.status);
  let copy = $derived(texts[status] ?? texts[500]);
</script>

<section class="flex flex-col gap-4 py-9">
  <p class="fs-minion font-medium text-light-600 uppercase">Error {status}</p>
  <h1 class="fs-foolscap font-bold text-light-700">{copy.title}</h1>
  <p class="fs-pica">{copy.text}</p>
  <p>
    <a class="btn" href={resolve('/')}>
      <Home size={20} aria-hidden="true" />
      Back to the home page
    </a>
  </p>
</section>
