<script lang="ts">
  import type { Snippet } from "svelte";

  import type { AuthRole } from "@app/api/client";

  import { authStore } from "$lib/stores/auth.svelte";

  interface PropsUnauthenticated {
    authenticated: false;

    as?: never;

    children: Snippet;
  }

  interface PropsAuthenticated {
    authenticated: true;

    as?: AuthRole | AuthRole[];

    children: Snippet;
  }

  type Props = PropsUnauthenticated | PropsAuthenticated;

  const { authenticated, as, children }: Props = $props();

  const show = $derived.by<boolean>(() => {
    if (authenticated) {
      if (!authStore.auth) return false;

      if (
        authStore.auth.user.role &&
        as &&
        (as !== authStore.auth.user.role ||
          !as.includes(authStore.auth.user.role))
      )
        return false;
    }

    return true;
  });
</script>

{#if show}
  {@render children()}
{/if}
