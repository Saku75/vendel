import { Theme } from "$lib/enums/theme";

type ThemeStore = {
  current: Theme;
};

const themeStore = $state<ThemeStore>({
  current: Theme.System,
});

export { themeStore };
