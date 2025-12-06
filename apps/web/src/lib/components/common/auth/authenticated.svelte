<script lang="ts">
  import type { Snippet } from "svelte";

  import { AuthStatus, hasRequiredRole, type AuthRole } from "@app/api/enums";

  import { getAuthContext } from "$lib/contexts/auth.svelte";

  interface Props {
    minRole?: AuthRole;

    children: Snippet;
  }

  const { minRole, children }: Props = $props();

  const authContext = getAuthContext();

  const show = $derived.by(() => {
    if (authContext.status !== AuthStatus.Authenticated) {
      return false;
    }
    return minRole
      ? hasRequiredRole(authContext.user?.role ?? null, minRole)
      : true;
  });
</script>

{#if show}
  {@render children()}
{/if}
