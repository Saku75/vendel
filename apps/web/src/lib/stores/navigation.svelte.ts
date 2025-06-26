import { Gift, LogIn, UserPlus, type Icon } from "@lucide/svelte";
import House from "@lucide/svelte/icons/house";
import type { HTMLAttributeAnchorTarget } from "svelte/elements";

type NavigationItem = {
  text: string;
  href: string;
  target?: HTMLAttributeAnchorTarget;
  Icon?: typeof Icon;
};

type NavigationStore =
  | [NavigationItem[]]
  | [NavigationItem[], NavigationItem[]];

const navigationStore = $state<NavigationStore>([
  [
    { text: "Hjem", href: "/", Icon: House },
    { text: "Ønskelister", href: "/wishlists", Icon: Gift },
  ],
  [
    {
      text: "Opret",
      href: "/sign-up",
      Icon: UserPlus,
    },
    {
      text: "Log ind",
      href: "/sign-in",
      Icon: LogIn,
    },
  ],
]);

export { navigationStore };
