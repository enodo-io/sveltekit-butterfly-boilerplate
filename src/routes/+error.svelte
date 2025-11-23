<script lang="ts">
  import { page } from '$app/state';
</script>

<section class="d-flex fd-column g4">
  <h1 class="fs-foolscap fw-700 fc-light-700">Error {page.status}</h1>

  {#if page.error?.message}
    <p class="fs-pica fw-500">{page.error.message}</p>
  {/if}
</section>
