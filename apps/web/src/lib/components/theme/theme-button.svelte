<script lang="ts">
  import Moon from "@lucide/svelte/icons/moon";
  import Sun from "@lucide/svelte/icons/sun";
  import SunMoon from "@lucide/svelte/icons/sun-moon";
  import X from "@lucide/svelte/icons/x";
  import { onMount } from "svelte";

  import { LayoutMenuContent } from "$lib/enums/layout/menu/content";
  import { LayoutTheme } from "$lib/enums/layout/theme";
  import { layoutStore } from "$lib/stores/layout.svelte";

  import Button from "../common/interactions/button.svelte";
  import { InteractionEmphasis } from "../common/interactions/enums/emphasis";

  $effect(() => {
    if (layoutStore.theme != LayoutTheme.System) {
      document.documentElement.dataset.theme = layoutStore.theme;
      const currentTime = new Date();
      currentTime.setFullYear(currentTime.getFullYear() + 1);
      document.cookie = `theme-preference=${layoutStore.theme}; SameSite=Strict; Secure; Path=/; Expires=${currentTime.toUTCString()}`;
    } else {
      document.documentElement.dataset.theme = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches
        ? LayoutTheme.Dark
        : LayoutTheme.Light;
      document.cookie =
        "theme-preference=; SameSite=Strict; Secure; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
  });

  onMount(() => {
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (event) => {
        if (layoutStore.theme === LayoutTheme.System)
          document.documentElement.dataset.theme = event.matches
            ? LayoutTheme.Dark
            : LayoutTheme.Light;
      });
  });
</script>

<Button
  emphasis={InteractionEmphasis.Header}
  class="w-10 justify-center justify-self-end p-0"
  aria-label={layoutStore.menu.open ? "Luk tema menu" : "Åben tema menu"}
  onclick={() => layoutStore.menu.toggle(LayoutMenuContent.Theme)}
>
  {#if layoutStore.menu.open && layoutStore.menu.content === LayoutMenuContent.Theme}
    <X class="h-8 w-8" />
  {:else}
    {#if layoutStore.theme === LayoutTheme.System}
      <SunMoon class="h-7 w-7" />
    {/if}
    {#if layoutStore.theme === LayoutTheme.Light}
      <Sun class="h-7 w-7" />
    {/if}
    {#if layoutStore.theme === LayoutTheme.Dark}
      <Moon class="h-7 w-7" />
    {/if}
  {/if}
</Button>
