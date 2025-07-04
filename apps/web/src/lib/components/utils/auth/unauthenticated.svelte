<script lang="ts">
  import type { Snippet } from "svelte";

  import { AuthStatus } from "@app/api/enums";

  import { authStore } from "$lib/stores/auth.svelte";

  interface Props {
    children: Snippet;
  }

  const { children }: Props = $props();
</script>

{#if authStore.status === AuthStatus.Unauthenticated}
  {@render children()}
{/if}
