<script lang="ts">
  import { slide } from "svelte/transition";

  import { AuthRole } from "@app/api/enums";
  import type { WishesGetResponse } from "@app/api/types";

  import { invalidateAll } from "$app/navigation";

  import { api } from "$lib/api";
  import Authenticated from "$lib/components/common/auth/authenticated.svelte";
  import Button from "$lib/components/common/interactions/button.svelte";
  import { InteractionEmphasis } from "$lib/components/common/interactions/enums/emphasis";

  import type { PageProps } from "./$types";
  import WishForm from "./wish-form.svelte";

  const { data }: PageProps = $props();

  // svelte-ignore state_referenced_locally
  let formOpen = $state(data.wishes.length === 0);
  let editItem = $state<WishesGetResponse | undefined>();

  function toggleForm() {
    if (formOpen) {
      editItem = undefined;
    }
    formOpen = !formOpen;
  }
</script>

{#snippet wishListItem(wish: WishesGetResponse)}
  <div
    class="flex justify-between rounded-[1.25rem] bg-stone-200 py-2 pr-2 pl-4 dark:bg-stone-800"
  >
    <div class="flex flex-col">
      {#if wish.brand}
        <small class="text-xs text-stone-600 dark:text-stone-400">
          {wish.brand}
        </small>
      {/if}
      <p class="mr-2 font-bold">{wish.title}</p>
      {#if wish.description}
        <p>{wish.description}</p>
      {/if}
      {#if wish.price}
        <p>Pris: {wish.price}</p>
      {/if}
    </div>
    <Authenticated minRole={AuthRole.User}>
      {#if !formOpen}
        <div class="flex gap-1 self-start">
          <Button
            emphasis={InteractionEmphasis.Secondary}
            class="px-3 py-1 text-sm"
            onclick={(e: MouseEvent) => {
              e.preventDefault();
              editItem = wish;
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
              await api.wishlists.wishes.delete(data.wishlist.id, wish.id);
              await invalidateAll();
            }}
          >
            Slet
          </Button>
        </div>
      {/if}
    </Authenticated>
  </div>
{/snippet}

<main class="mx-auto flex h-full w-full max-w-3xl flex-col px-2">
  <div
    class="mb-6 flex flex-col items-center justify-between gap-3 sm:flex-row"
  >
    <h1 class="text-3xl">{data.wishlist.name}</h1>

    <Authenticated minRole={AuthRole.User}>
      {#if data.wishes.length !== 0}
        <Button
          emphasis={InteractionEmphasis.Secondary}
          class="px-4 py-2"
          onclick={toggleForm}
        >
          {formOpen ? "Luk" : "Opret nyt ønske"}
        </Button>
      {/if}
    </Authenticated>
  </div>

  <Authenticated minRole={AuthRole.User}>
    {#if formOpen}
      <div transition:slide={{ duration: 200 }} class="mb-6">
        {#if data.wishes.length === 0}
          <p class="my-4 text-center">
            Der er ingen ønsker på denne ønskeliste endnu. Tilføj en nedenfor!
          </p>
        {/if}
        <WishForm
          wishlistId={data.wishlist.id}
          {editItem}
          onsubmit={() => toggleForm()}
        />
      </div>
    {/if}
  </Authenticated>

  <div>
    {#if data.wishes.length !== 0}
      <ul class="flex flex-col gap-4">
        {#each data.wishes as wish (wish.id)}
          {#if wish.url}
            <li class="contents">
              <a
                href={wish.url}
                target="_blank"
                rel="external noopener noreferrer"
                class="contents"
              >
                {@render wishListItem(wish)}
              </a>
            </li>
          {:else}
            <li class="contents">
              {@render wishListItem(wish)}
            </li>
          {/if}
        {/each}
      </ul>
    {/if}
  </div>
</main>
