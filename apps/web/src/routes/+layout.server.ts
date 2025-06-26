import { LayoutTheme } from "$lib/enums/layout/theme";

import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = ({ platform, cookies }) => {
  const themePreferenceCookie =
    (cookies.get("theme-preference") as LayoutTheme) || LayoutTheme.System;

  return {
    config: {
      themePreference: themePreferenceCookie,
      turnstileSiteKey: platform!.env.TURNSTILE_SITE_KEY,
    },
  };
};
