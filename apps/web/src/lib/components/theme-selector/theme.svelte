<script lang="ts">
  import { Moon, Sun, SunMoon, type Icon } from "@lucide/svelte";

  import { LayoutTheme } from "$lib/enums/layout/theme";
  import { layoutStore } from "$lib/stores/layout.svelte";

  import HeaderButton from "../layout/header/header-button.svelte";

  type ThemeItem = {
    theme: LayoutTheme;
    Icon?: typeof Icon;
  };

  const themes: ThemeItem[] = [
    {
      theme: LayoutTheme.System,
      Icon: SunMoon,
    },
    {
      theme: LayoutTheme.Light,
      Icon: Sun,
    },
    {
      theme: LayoutTheme.Dark,
      Icon: Moon,
    },
  ];
</script>

<ul class="flex flex-col gap-1">
  {#each themes as { theme, Icon } (theme)}
    <li class="contents">
      <HeaderButton
        class="h-10 gap-1"
        onclick={() => (
          (layoutStore.theme = theme),
          (layoutStore.menu.open = false)
        )}
      >
        <Icon class="h-5.5 w-5.5" />
        {theme}
      </HeaderButton>
    </li>
  {/each}
</ul>
