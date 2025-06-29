<script lang="ts">
  import type { Snippet } from "svelte";

  import { authStore } from "$lib/stores/auth.svelte";

  interface Props {
    children: Snippet;
  }

  const { children }: Props = $props();
</script>

{#if !authStore.auth}
  {@render children()}
{/if}
