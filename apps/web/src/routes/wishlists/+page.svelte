<script lang="ts">
  import { slide } from "svelte/transition";

  import { AuthRole } from "@app/api/enums";
  import type { WishlistsGetResponse } from "@app/api/types";

  import { invalidateAll } from "$app/navigation";
  import { resolve } from "$app/paths";

  import { api } from "$lib/api";
  import Authenticated from "$lib/components/common/auth/authenticated.svelte";
  import Button from "$lib/components/common/interactions/button.svelte";
  import { InteractionEmphasis } from "$lib/components/common/interactions/enums/emphasis";
  import { formatRelativeDate } from "$lib/utils/format-relative-date";

  import type { PageProps } from "./$types";
  import WishlistForm from "./wishlist-form.svelte";

  const { data }: PageProps = $props();

  // svelte-ignore state_referenced_locally
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

    <Authenticated minRole={AuthRole.Admin}>
      {#if data.wishlists.length !== 0}
        <Button
          emphasis={InteractionEmphasis.Secondary}
          class="px-4 py-2"
          onclick={toggleForm}
        >
          {formOpen ? "Luk" : "Opret ny ønskeliste"}
        </Button>
      {/if}
    </Authenticated>
  </div>

  <Authenticated minRole={AuthRole.Admin}>
    {#if formOpen}
      <div transition:slide={{ duration: 200 }} class="mb-6">
        {#if data.wishlists.length === 0}
          <p class="my-4 text-center">
            Der er ingen ønskelister endnu. Opret en ny ønskeliste for at komme
            i gang!
          </p>
        {/if}
        <WishlistForm {editItem} onsubmit={() => toggleForm()} />
      </div>
    {/if}
  </Authenticated>

  <div>
    {#if data.wishlists.length !== 0}
      <ul class="flex flex-col gap-4">
        {#each data.wishlists as wishlist (wishlist.id)}
          <li class="contents">
            <a
              href={resolve("/wishlists/[wishlistId]", {
                wishlistId: wishlist.id,
              })}
              class="flex justify-between rounded-[1.25rem] bg-stone-200 py-2 pr-2 pl-4 dark:bg-stone-800"
            >
              <div class="flex flex-col">
                <p class="mr-2 font-bold">{wishlist.name}</p>
                <small class="text-xs text-stone-600 dark:text-stone-400">
                  (Sidst opdateret: {wishlist.wishesUpdatedAt
                    ? formatRelativeDate(wishlist.wishesUpdatedAt)
                    : "Aldrig"})
                </small>
                <p>{wishlist.description}</p>
              </div>
              <Authenticated minRole={AuthRole.Admin}>
                {#if !formOpen}
                  <div class="flex gap-1 self-start">
                    <Button
                      emphasis={InteractionEmphasis.Secondary}
                      class="px-3 py-1 text-sm"
                      onclick={(e: MouseEvent) => {
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
                      onclick={async (e: MouseEvent) => {
                        e.preventDefault();
                        await api.wishlists.delete(wishlist.id);
                        await invalidateAll();
                      }}
                    >
                      Slet
                    </Button>
                  </div>
                {/if}
              </Authenticated>
            </a>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</main>
