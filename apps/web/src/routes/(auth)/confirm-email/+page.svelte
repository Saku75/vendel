<script lang="ts">
  import { CircleAlert, CircleCheck } from "@lucide/svelte";

  import type { PageProps } from "./$types";

  const { data }: PageProps = $props();

  const { status, message } = $derived(data.emailConfirmed);
</script>

<main class="mx-auto flex w-full max-w-xs flex-col items-center text-center">
  <h1 class="mb-4 text-4xl">Bekræft E-mail</h1>
  <p class="mb-2">{message}</p>

  {#if status}
    <CircleCheck class="h-8 w-8 text-green-600 dark:text-green-500" />
  {:else}
    <CircleAlert class="h-8 w-8 text-red-700 dark:text-red-500" />
  {/if}
</main>
