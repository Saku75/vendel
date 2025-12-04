<script lang="ts">
  import type { Snippet } from "svelte";

  import { hasRequiredRole, type AuthRole } from "@app/api/enums";

  import { getAuthContext } from "$lib/contexts/auth.svelte";

  interface Props {
    minRole: AuthRole;

    children: Snippet;
  }

  const { minRole, children }: Props = $props();

  const authContext = getAuthContext();

  const shouldShow = $derived.by(() => {
    if (authContext.status !== "authenticated") {
      return false;
    }
    return hasRequiredRole(authContext.user?.role ?? null, minRole);
  });
</script>

{#if shouldShow}
  {@render children()}
{/if}
