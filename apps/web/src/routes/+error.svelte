<script lang="ts">
  import { page } from "$app/state";
</script>

<main class="grid place-items-center text-center">
  <h1 class="px-4 text-4xl font-medium sm:text-5xl md:text-6xl">
    {page.error?.message}
  </h1>
</main>
