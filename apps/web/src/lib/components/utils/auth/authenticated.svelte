<script lang="ts">
  import type { Snippet } from "svelte";

  import type { AuthRole } from "@app/api/client";

  import { authStore } from "$lib/stores/auth.svelte";

  interface Props {
    role?: AuthRole | AuthRole[];

    children: Snippet;
  }

  const { role, children }: Props = $props();

  const show = $derived.by(() => {
    if (!authStore.auth) return false;
    if (!role && authStore.auth) return true;

    if (role && !authStore.auth.user.role) return false;
    if (
      role &&
      (role !== authStore.auth.user.role ||
        !role.includes(authStore.auth.user.role))
    )
      return false;

    return true;
  });
</script>

{#if show}
  {@render children()}
{/if}
