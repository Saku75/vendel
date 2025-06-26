<script lang="ts">
  import { slide } from "svelte/transition";

  import NavigationButton from "$lib/components/navigation/navigation-button.svelte";
  import Navigation from "$lib/components/navigation/navigation.svelte";
  import ThemeButton from "$lib/components/theme-selector/theme-button.svelte";
  import Theme from "$lib/components/theme-selector/theme.svelte";
  import WidthLimiter from "$lib/components/utils/width-limiter.svelte";
  import { LayoutMenuContent } from "$lib/enums/layout/menu/content";
  import { LayoutSize } from "$lib/enums/layout/size";
  import { layoutStore } from "$lib/stores/layout.svelte";

  import Menu from "../menu.svelte";
  import HeaderLink from "./header-link.svelte";
</script>

<header class="sticky top-0 z-40 row-start-1 my-3 h-12">
  <div class="rounded-3xl bg-sky-300/50 p-1 backdrop-blur dark:bg-sky-800/50">
    <div class="grid h-10 grid-cols-layout gap-1">
      <HeaderLink href="/" class="pl-2 font-heading text-[20px]">
        Vendel.dk
      </HeaderLink>

      <WidthLimiter to={LayoutSize.Medium}>
        <NavigationButton />
      </WidthLimiter>

      <WidthLimiter from={LayoutSize.Medium}>
        <Navigation type="bar" />
      </WidthLimiter>

      <ThemeButton />
    </div>

    <Menu>
      {#if layoutStore.menu.content === LayoutMenuContent.Navigation}
        <div transition:slide={{ duration: 200 }}>
          <Navigation type="list" />
        </div>
      {/if}

      {#if layoutStore.menu.content === LayoutMenuContent.Theme}
        <div transition:slide={{ duration: 200 }}>
          <Theme />
        </div>
      {/if}
    </Menu>
  </div>
</header>
