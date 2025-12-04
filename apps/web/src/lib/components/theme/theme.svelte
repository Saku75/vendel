<script lang="ts">
  import { Moon, Sun, SunMoon, type Icon } from "@lucide/svelte";

  import { Theme } from "$lib/enums/theme";
  import { layoutStore } from "$lib/stores/layout.svelte";
  import { themeStore } from "$lib/stores/theme.svelte";

  import Button from "../common/interactions/button.svelte";
  import { InteractionEmphasis } from "../common/interactions/enums/emphasis";

  type ThemeItem = {
    name: string;
    theme: Theme;
    Icon?: typeof Icon;
  };

  const themes: ThemeItem[] = [
    {
      name: "System",
      theme: Theme.System,
      Icon: SunMoon,
    },
    {
      name: "Lys",
      theme: Theme.Light,
      Icon: Sun,
    },
    {
      name: "Mørk",
      theme: Theme.Dark,
      Icon: Moon,
    },
  ];
</script>

<ul class="flex flex-col gap-1">
  {#each themes as { name, theme, Icon } (theme)}
    <li class="contents">
      <Button
        emphasis={InteractionEmphasis.Header}
        class="h-10 w-auto gap-1"
        onclick={() => (
          (themeStore.current = theme),
          (layoutStore.menu.open = false)
        )}
      >
        <Icon class="h-5.5 w-5.5" />
        {name}
      </Button>
    </li>
  {/each}
</ul>
