<script lang="ts">
  import Moon from "@lucide/svelte/icons/moon";
  import Sun from "@lucide/svelte/icons/sun";
  import SunMoon from "@lucide/svelte/icons/sun-moon";
  import X from "@lucide/svelte/icons/x";
  import { onMount } from "svelte";
  import { SvelteDate } from "svelte/reactivity";

  import { LayoutMenuContent } from "$lib/enums/layout/menu/content";
  import { Theme } from "$lib/enums/theme";
  import { layoutStore } from "$lib/stores/layout.svelte";
  import { themeStore } from "$lib/stores/theme.svelte";

  import Button from "../common/interactions/button.svelte";
  import { InteractionEmphasis } from "../common/interactions/enums/emphasis";

  $effect(() => {
    if (themeStore.current != Theme.System) {
      document.documentElement.dataset.theme = themeStore.current;
      const currentTime = new SvelteDate();
      currentTime.setFullYear(currentTime.getFullYear() + 1);
      document.cookie = `theme-preference=${themeStore.current}; SameSite=Strict; Secure; Path=/; Expires=${currentTime.toUTCString()}`;
    } else {
      document.documentElement.dataset.theme = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches
        ? Theme.Dark
        : Theme.Light;
      document.cookie =
        "theme-preference=; SameSite=Strict; Secure; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
  });

  onMount(() => {
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (event) => {
        if (themeStore.current === Theme.System)
          document.documentElement.dataset.theme = event.matches
            ? Theme.Dark
            : Theme.Light;
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
    {#if themeStore.current === Theme.System}
      <SunMoon class="h-7 w-7" />
    {/if}
    {#if themeStore.current === Theme.Light}
      <Sun class="h-7 w-7" />
    {/if}
    {#if themeStore.current === Theme.Dark}
      <Moon class="h-7 w-7" />
    {/if}
  {/if}
</Button>
