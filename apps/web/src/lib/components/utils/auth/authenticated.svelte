<script lang="ts">
  import type { Snippet } from "svelte";

  import { AuthStatus, type AuthRole } from "@app/api/enums";

  import { authStore } from "$lib/stores/auth.svelte";

  interface Props {
    role?: AuthRole | AuthRole[];

    children: Snippet;
  }

  const { role, children }: Props = $props();

  const show = $derived.by(() => {
    if (authStore.status === AuthStatus.Unauthenticated) return false;
    if (!role && authStore.status === AuthStatus.Authenticated) return true;

    if (role && !authStore.user!.role) return false;
    if (
      role &&
      (role !== authStore.user!.role || !role.includes(authStore.user!.role))
    )
      return false;

    return true;
  });
</script>

{#if show}
  {@render children()}
{/if}
