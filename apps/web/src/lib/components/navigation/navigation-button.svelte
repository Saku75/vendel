<script lang="ts">
  import { MenuIcon, XIcon } from "@lucide/svelte";

  import { LayoutMenuContent } from "$lib/enums/layout/menu/content";
  import { layoutStore } from "$lib/stores/layout.svelte";

  import Button from "../common/interactions/button.svelte";
  import { InteractionEmphasis } from "../common/interactions/enums/emphasis";
</script>

<Button
  emphasis={InteractionEmphasis.Header}
  class="w-10 justify-center justify-self-end p-0"
  aria-label={layoutStore.menu.open
    ? "Luk navigations menu"
    : "Åben navigations menu"}
  onclick={() => layoutStore.menu.toggle(LayoutMenuContent.Navigation)}
>
  {#if layoutStore.menu.open && layoutStore.menu.content === LayoutMenuContent.Navigation}
    <XIcon class="h-8 w-8" />
  {:else}
    <MenuIcon class="h-7 w-7" />
  {/if}
</Button>
