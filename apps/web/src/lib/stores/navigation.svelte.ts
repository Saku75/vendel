import { Gift, LogIn, LogOut, UserPlus, type Icon } from "@lucide/svelte";
import type { HTMLAttributeAnchorTarget } from "svelte/elements";

import type { AuthRole } from "@app/api/client";

type ShowWhenUnauthenticated = {
  authenticated: false;
};

type ShowWhenAuthenticated = {
  authenticated: true;
  role?: AuthRole | AuthRole[];
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
  [{ text: "Ønskelister", href: "/wishlists", Icon: Gift }],
  [
    {
      text: "Opret",
      href: "/sign-up",
      Icon: UserPlus,
      showWhen: {
        authenticated: false,
      },
    },
    {
      text: "Log ind",
      href: "/sign-in",
      Icon: LogIn,
      showWhen: {
        authenticated: false,
      },
    },
    {
      text: "Log ud",
      href: "/sign-out",
      Icon: LogOut,
      showWhen: {
        authenticated: true,
      },
    },
  ],
]);

export { navigationStore };
export type { NavigationItem };
