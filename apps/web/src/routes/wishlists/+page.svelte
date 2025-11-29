<script lang="ts">
  import { slide } from "svelte/transition";

  import { AuthRole } from "@app/api/enums";
  import type { WishlistsGetResponse } from "@app/api/types";

  import { invalidateAll } from "$app/navigation";
  import { resolve } from "$app/paths";

  import { apiClient } from "$lib/api/client";
  import AuthAs from "$lib/components/common/auth/auth-as.svelte";
  import Button from "$lib/components/common/interactions/button.svelte";
  import { InteractionEmphasis } from "$lib/components/common/interactions/enums/emphasis";

  import type { PageProps } from "./$types";
  import WishlistForm from "./wishlist-form.svelte";

  const { data }: PageProps = $props();

  let formOpen = $state(data.wishlists.length === 0);
  let editItem = $state<WishlistsGetResponse | undefined>();

  function toggleForm() {
    if (formOpen) {
      editItem = undefined;
    }
    formOpen = !formOpen;
  }
</script>

<main class="mx-auto flex h-full w-full max-w-3xl flex-col px-2">
  <div
    class="mb-6 flex flex-col items-center justify-between gap-3 sm:flex-row"
  >
    <h1 class="text-3xl">Ønskelister</h1>

    <AuthAs minRole={AuthRole.Admin}>
      {#if data.wishlists.length !== 0}
        <Button
          emphasis={InteractionEmphasis.Secondary}
          class="px-4 py-2"
          onclick={toggleForm}
        >
          {formOpen ? "Luk" : "Opret ny ønskeliste"}
        </Button>
      {/if}
    </AuthAs>
  </div>

  {#if formOpen}
    <div transition:slide={{ duration: 200 }} class="mb-6">
      {#if data.wishlists.length === 0}
        <p class="my-4 text-center">
          Der er ingen ønskelister endnu. Opret en ny ønskeliste for at komme i
          gang!
        </p>
      {/if}
      <WishlistForm {editItem} onsubmit={() => toggleForm()} />
    </div>
  {/if}

  <div>
    {#if data.wishlists.length !== 0}
      <ul class="flex flex-col gap-4">
        {#each data.wishlists as wishlist (wishlist.id)}
          <li class="contents">
            <a
              href={resolve("/wishlists/[wishlistId]", {
                wishlistId: wishlist.id,
              })}
              class="rounded-[1.25rem] bg-stone-200 p-4 px-4 py-2 dark:bg-stone-800"
            >
              <div class="flex justify-between">
                <div class="flex flex-col sm:flex-row sm:items-center">
                  <p class="mr-2 font-bold">{wishlist.name}</p>
                  <p class="text-xs text-stone-600 dark:text-stone-400">
                    (Sidst opdateret: {wishlist.wishesUpdatedAt
                      ? new Date(wishlist.wishesUpdatedAt).toLocaleDateString()
                      : "Aldrig"})
                  </p>
                </div>
                <AuthAs minRole={AuthRole.Admin}>
                  {#if !formOpen}
                    <div class="flex gap-1">
                      <Button
                        emphasis={InteractionEmphasis.Secondary}
                        class="px-3 py-1 text-sm"
                        onclick={(e) => {
                          e.preventDefault();
                          editItem = wishlist;
                          formOpen = true;
                        }}
                      >
                        Rediger
                      </Button>
                      <Button
                        emphasis={InteractionEmphasis.Secondary}
                        class="px-3 py-1 text-sm"
                        onclick={async (e) => {
                          e.preventDefault();
                          await apiClient.wishlists.delete(wishlist.id);
                          await invalidateAll();
                        }}
                      >
                        Slet
                      </Button>
                    </div>
                  {/if}
                </AuthAs>
              </div>
              <p>{wishlist.description}</p>
            </a>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</main>
