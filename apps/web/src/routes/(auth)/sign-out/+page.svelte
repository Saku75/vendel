<script lang="ts">
  import { goto } from "$app/navigation";

  import { apiClient } from "$lib/api/client";
  import Button from "$lib/components/common/interactions/button.svelte";
  import { InteractionEmphasis } from "$lib/components/common/interactions/enums/emphasis";
  import { authStore } from "$lib/stores/auth.svelte";
</script>

<main class="mx-auto flex w-full max-w-xs flex-col items-center">
  <h1 class="mb-4 text-4xl">Log ud</h1>
  <p class="mb-2">Er du sikker på, at du vil logge ud?</p>

  <div class="flex w-full flex-col gap-2 sm:flex-row">
    <Button
      emphasis={InteractionEmphasis.Secondary}
      class="w-full"
      onclick={() => history.back()}>Nej</Button
    >
    <Button
      class="w-full"
      onclick={async () => {
        await apiClient.auth.signOut().then((res) => {
          if (res.ok) {
            authStore.setUnauthenticated();
          }
        });
        await goto("/");
      }}>Ja</Button
    >
  </div>
</main>
