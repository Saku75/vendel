<script lang="ts">
  import type { Snippet } from "svelte";

  import { hasRequiredRole, type AuthRole } from "@app/api/enums";

  import { authStore } from "$lib/stores/auth.svelte";

  interface Props {
    minRole: AuthRole;

    children: Snippet;
  }

  const { minRole, children }: Props = $props();

  const shouldShow = $derived.by(() => {
    if (authStore.status !== "authenticated") {
      return false;
    }
    return hasRequiredRole(authStore.user?.role ?? null, minRole);
  });
</script>

{#if shouldShow}
  {@render children()}
{/if}
