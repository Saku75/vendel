<script lang="ts">
  import { InteractionEmphasis } from "$lib/components/common/interactions/enums/emphasis";
  import Link from "$lib/components/common/interactions/link.svelte";

  import type { PageProps } from "./$types";

  const { data }: PageProps = $props();
</script>

<main class="mx-auto flex h-full w-full max-w-3xl flex-col gap-6 px-2">
  <div class="flex flex-col items-center justify-between gap-3 sm:flex-row">
    <h1 class="text-3xl">Ønskelister</h1>
    {#if data.wishlists.length !== 0}
      <Link
        emphasis={InteractionEmphasis.Secondary}
        href="/wishlists/new"
        class="px-4 py-2"
      >
        Opret ny ønskeliste
      </Link>
    {/if}
  </div>

  <div>
    {#if data.wishlists.length !== 0}
      <table>
        <tbody>
          {#each data.wishlists as wishlist (wishlist.id)}
            <tr>
              <td>{wishlist.name}</td>
              <td>{wishlist.description}</td>
              <td>{wishlist.wishesUpdatedAt}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    {:else}
      <p class="my-4 text-center">
        Der er ingen ønskelister endnu. <Link href="/wishlists/new">
          Opret en ny ønskeliste
        </Link> for at komme i gang!
      </p>
    {/if}
  </div>
</main>
