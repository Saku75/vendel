<script lang="ts">
  import type { Snippet } from "svelte";

  import { AuthStatus } from "@app/api/enums";

  import { getAuthContext } from "$lib/contexts/auth.svelte";

  interface Props {
    children: Snippet;
  }

  const { children }: Props = $props();

  const authContext = getAuthContext();
</script>

{#if authContext.status === AuthStatus.Unauthenticated}
  {@render children()}
{/if}
