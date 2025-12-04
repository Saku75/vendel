<script lang="ts">
  import type { Snippet } from "svelte";

  import { AuthStatus, type AuthRole } from "@app/api/enums";

  import { getAuthContext } from "$lib/contexts/auth.svelte";

  interface Props {
    role?: AuthRole | AuthRole[];

    children: Snippet;
  }

  const { role, children }: Props = $props();

  const authContext = getAuthContext();

  const show = $derived.by(() => {
    if (authContext.status === AuthStatus.Unauthenticated) return false;
    if (!role && authContext.status === AuthStatus.Authenticated) return true;

    if (role && !authContext.user?.role) return false;
    if (
      role &&
      (role !== authContext.user?.role ||
        !role.includes(authContext.user?.role))
    )
      return false;

    return true;
  });
</script>

{#if show}
  {@render children()}
{/if}
