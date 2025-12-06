import {
  GiftIcon,
  LogInIcon,
  LogOutIcon,
  UserPlusIcon,
  type Icon,
} from "@lucide/svelte";
import type { HTMLAttributeAnchorTarget } from "svelte/elements";

import type { AuthRole } from "@app/api/enums";

type ShowWhenUnauthenticated = {
  authenticated: false;
};

type ShowWhenAuthenticated = {
  authenticated: true;
  minRole?: AuthRole;
};

type NavigationItem = {
  text: string;
  href: string;
  target?: HTMLAttributeAnchorTarget;
  Icon?: typeof Icon;
  showWhen?: ShowWhenAuthenticated | ShowWhenUnauthenticated;
};

type NavigationStore =
  | [NavigationItem[]]
  | [NavigationItem[], NavigationItem[]];

const navigationStore = $state<NavigationStore>([
  [{ text: "Ønskelister", href: "/wishlists", Icon: GiftIcon }],
  [
    {
      text: "Opret",
      href: "/sign-up",
      Icon: UserPlusIcon,
      showWhen: {
        authenticated: false,
      },
    },
    {
      text: "Log ind",
      href: "/sign-in",
      Icon: LogInIcon,
      showWhen: {
        authenticated: false,
      },
    },
    {
      text: "Log ud",
      href: "/sign-out",
      Icon: LogOutIcon,
      showWhen: {
        authenticated: true,
      },
    },
  ],
]);

export { navigationStore };
export type { NavigationItem };
