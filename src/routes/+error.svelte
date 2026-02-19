<script lang="ts">
  import { page } from '$app/state';
</script>

<section class="flex flex-col gap-4">
  <h1 class="fs-foolscap font-bold text-light-700">Error {page.status}</h1>

  {#if page.error?.message}
    <p class="fs-pica font-medium">{page.error.message}</p>
  {/if}
</section>
