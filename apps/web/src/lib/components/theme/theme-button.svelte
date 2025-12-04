<script lang="ts">
  import { MoonIcon, SunIcon, SunMoonIcon, XIcon } from "@lucide/svelte";
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
    <XIcon class="h-8 w-8" />
  {:else}
    {#if themeStore.current === Theme.System}
      <SunMoonIcon class="h-7 w-7" />
    {/if}
    {#if themeStore.current === Theme.Light}
      <SunIcon class="h-7 w-7" />
    {/if}
    {#if themeStore.current === Theme.Dark}
      <MoonIcon class="h-7 w-7" />
    {/if}
  {/if}
</Button>
